import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import Matter from "matter-js";

interface PhysicsElementProps {
  id: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  isStatic?: boolean;
  className?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  key?: React.Key;
}

interface PhysicsWorldContextType {
  engine: Matter.Engine;
  registerBody: (id: string, body: Matter.Body) => void;
  unregisterBody: (id: string) => void;
  resetWorld: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const PhysicsWorldContext = React.createContext<PhysicsWorldContextType | null>(null);

export function PhysicsWorld({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine>(Matter.Engine.create({
    gravity: { x: 0, y: 0 }, // Zero gravity for floating effect
    enableSleeping: false
  }));

  const registerBody = useCallback((id: string, body: Matter.Body) => {
    Matter.Composite.add(engineRef.current.world, body);
  }, []);

  const unregisterBody = useCallback((id: string) => {
    const world = engineRef.current.world;
    const bodies = Matter.Composite.allBodies(world);
    const body = bodies.find(b => b.label === id);
    if (body) {
      Matter.Composite.remove(world, body);
    }
  }, []);

  const resetWorld = useCallback(() => {
    const world = engineRef.current.world;
    const bodies = Matter.Composite.allBodies(world).filter(b => !["ground", "leftWall", "rightWall", "ceiling"].includes(b.label));
    
    bodies.forEach(body => {
      Matter.Body.setPosition(body, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 });
      Matter.Body.setAngle(body, 0);
      Matter.Body.setAngularVelocity(body, 0);
    });
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    const world = engine.world;
    // Boundaries
    const thickness = 100;
    const updateBoundaries = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;

      const ground = Matter.Bodies.rectangle(width / 2, height + thickness / 2, width * 2, thickness, { isStatic: true, label: "ground" });
      const leftWall = Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, { isStatic: true, label: "leftWall" });
      const rightWall = Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, { isStatic: true, label: "rightWall" });
      const ceiling = Matter.Bodies.rectangle(width / 2, -thickness / 2, width * 2, thickness, { isStatic: true, label: "ceiling" });

      // Remove old boundaries
      const oldBoundaries = Matter.Composite.allBodies(world).filter(b => ["ground", "leftWall", "rightWall", "ceiling"].includes(b.label));
      Matter.Composite.remove(world, oldBoundaries);
      
      Matter.Composite.add(world, [ground, leftWall, rightWall, ceiling]);
    };

    updateBoundaries();
    const resizeObserver = new ResizeObserver(updateBoundaries);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Mouse constraint
    const mouse = Matter.Mouse.create(containerRef.current!);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.1,
        damping: 0.1,
        render: { visible: false }
      }
    });

    // CRITICAL: Allow scrolling by removing wheel listeners from Matter.js
    if (mouse.element) {
      mouse.element.removeEventListener("mousewheel", (mouse as any).mousewheel);
      mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);
      
      // Ensure touch-action doesn't block vertical scroll
      mouse.element.style.touchAction = "pan-y";
      
      // Also remove touchmove if it's blocking scroll, but we need it for dragging.
      // Matter.js usually calls preventDefault in touchmove.
      // We can try to make it passive if the browser supports it, 
      // but Matter.js attaches it directly.
    }

    Matter.Composite.add(world, mouseConstraint);

    // Add some random drift to keep things moving (gentle floating)
    const driftInterval = setInterval(() => {
      const world = engine.world;
      const bodies = Matter.Composite.allBodies(world).filter(b => !b.isStatic && !["ground", "leftWall", "rightWall", "ceiling"].includes(b.label));
      bodies.forEach(body => {
        const force = {
          x: (Math.random() - 0.5) * 0.0001,
          y: (Math.random() - 0.5) * 0.0001
        };
        Matter.Body.applyForce(body, body.position, force);
      });
    }, 1000);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      resizeObserver.disconnect();
      clearInterval(driftInterval);
    };
  }, []);

  return (
    <PhysicsWorldContext.Provider value={{ engine: engineRef.current, registerBody, unregisterBody, resetWorld, containerRef }}>
      <div className="relative w-full min-h-screen bg-background">
        {/* Physics Layer - Background only */}
        <div 
          ref={containerRef} 
          className="fixed inset-0 pointer-events-none z-0"
          style={{ height: "100vh" }}
        >
          {/* Background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-purple-500/10 blur-[120px] rounded-full" />
          </div>
        </div>

        {/* UI Layer - Interactive and Scrollable */}
        <div className="relative z-10 w-full min-h-screen pointer-events-auto">
          {children}
        </div>
      </div>
    </PhysicsWorldContext.Provider>
  );
}

export function PhysicsElement({ 
  id, 
  children, 
  initialX, 
  initialY, 
  isStatic = false,
  className = "",
  onDragStart,
  onDragEnd
}: PhysicsElementProps) {
  const context = React.useContext(PhysicsWorldContext);
  const elementRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<Matter.Body | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!context || !elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const width = rect.width || 100;
    const height = rect.height || 50;
    setDimensions({ width, height });

    // For background elements, we use window dimensions
    const x = initialX !== undefined ? initialX : Math.random() * window.innerWidth;
    const y = initialY !== undefined ? initialY : Math.random() * window.innerHeight;

    const body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic,
      friction: 0.1,
      frictionAir: 0.05,
      restitution: 0.9,
      density: 0.001,
      label: id,
      chamfer: { radius: width / 2 } // Make them more rounded/blobby
    });

    // Give it a little initial floating velocity
    Matter.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 1,
      y: (Math.random() - 0.5) * 1
    });

    bodyRef.current = body;
    context.registerBody(id, body);
    setIsVisible(true);

    let animId: number;
    const update = () => {
      if (bodyRef.current && elementRef.current) {
        const { x, y } = bodyRef.current.position;
        const angle = bodyRef.current.angle;
        
        // Wrap around screen
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (x < -100) Matter.Body.setPosition(bodyRef.current, { x: width + 100, y: bodyRef.current.position.y });
        if (x > width + 100) Matter.Body.setPosition(bodyRef.current, { x: -100, y: bodyRef.current.position.y });
        if (y < -100) Matter.Body.setPosition(bodyRef.current, { x: bodyRef.current.position.x, y: height + 100 });
        if (y > height + 100) Matter.Body.setPosition(bodyRef.current, { x: bodyRef.current.position.x, y: -100 });

        elementRef.current.style.transform = `translate(${x - dimensions.width / 2}px, ${y - dimensions.height / 2}px) rotate(${angle}rad)`;
        elementRef.current.style.position = "fixed";
        elementRef.current.style.left = "0";
        elementRef.current.style.top = "0";
        elementRef.current.style.margin = "0";
        elementRef.current.style.pointerEvents = "none";
      }
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      context.unregisterBody(id);
      cancelAnimationFrame(animId);
    };
  }, [context, id, isStatic, initialX, initialY, dimensions.width, dimensions.height]);

  return (
    <div 
      ref={elementRef} 
      className={`fixed top-0 left-0 z-0 pointer-events-none ${isVisible ? "opacity-100" : "opacity-0"} ${className}`}
      style={{ transition: "opacity 1s ease" }}
    >
      {children}
    </div>
  );
}

export function BackgroundPhysics() {
  return (
    <>
      {[...Array(12)].map((_, i) => (
        <PhysicsElement key={i} id={`blob-${i}`} className="blur-xl opacity-20">
          <div 
            className={`rounded-full ${i % 2 === 0 ? "bg-blue-400" : "bg-purple-400"}`}
            style={{ 
              width: Math.random() * 150 + 50, 
              height: Math.random() * 150 + 50 
            }}
          />
        </PhysicsElement>
      ))}
      {[...Array(8)].map((_, i) => (
        <PhysicsElement key={`icon-${i}`} id={`icon-${i}`} className="opacity-10">
          <div className="text-foreground">
            {/* Simple geometric shapes as decorative icons */}
            <div className={`border-2 border-current ${i % 3 === 0 ? "rounded-full w-12 h-12" : i % 3 === 1 ? "w-10 h-10 rotate-45" : "w-14 h-8 rounded-lg"}`} />
          </div>
        </PhysicsElement>
      ))}
    </>
  );
}
