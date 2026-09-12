import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowRight, Sparkles, Code2, Layout } from "lucide-react";
import React, { useRef, useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
    },
  },
};

const floatingAnimation = {
  y: [0, -12, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

function MagneticButton({ children, className, onClick, primary = false }: { children: React.ReactNode, className?: string, onClick?: () => void, primary?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={`${primary ? "apple-button-primary" : "apple-button-secondary"} ${className} relative overflow-hidden group`}
    >
      <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">{children}</span>
      {primary && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ filter: "blur(20px)" }}
        />
      )}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
}

export function Hero({ onStart }: { onStart: () => void }) {
  const headlineWords = ["Your", "sketches,", "now", "in"];
  
  return (
    <section className="relative pt-64 pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center">
      {/* Background Visual Effects - Now handled by BackgroundPhysics but adding some static glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 text-center relative z-10"
      >
        <motion.div
          variants={wordVariants}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-2xl glow-primary"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>Next Generation AI</span>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 mb-12 max-w-5xl mx-auto">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="text-6xl md:text-9xl font-black tracking-tighter text-foreground"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={wordVariants}
            className="text-7xl md:text-[11rem] font-black tracking-tighter text-gradient animate-gradient glow-text relative group cursor-default"
          >
            code.
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
          </motion.span>
        </div>

        <motion.p
          variants={wordVariants}
          className="text-xl md:text-2xl text-secondary/70 max-w-2xl mx-auto mb-16 leading-relaxed font-medium text-balance"
        >
          VisionCode uses advanced spatial reasoning to transform your hand-drawn UI into clean, production-ready React components.
        </motion.p>

        <motion.div
          variants={wordVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <MagneticButton 
            primary 
            onClick={() => {
              console.log("Start Designing button clicked!");
              onStart();
            }}
            className="text-xl py-6 px-12 rounded-[2rem] shadow-2xl shadow-blue-500/30"
          >
            Start Designing
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </MagneticButton>
          
          <MagneticButton 
            className="text-xl py-6 px-12 rounded-[2rem] border border-white/10 glass"
          >
            Explore Gallery
          </MagneticButton>
        </motion.div>

        {/* Feature Cards with enhanced styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-56 max-w-7xl mx-auto">
          {[
            { icon: <Layout className="text-blue-400" />, title: "Spatial Analysis", desc: "Our AI understands the hierarchy and layout of your hand-drawn elements." },
            { icon: <Code2 className="text-purple-400" />, title: "Clean Architecture", desc: "Get modular React code with Tailwind CSS that follows industry best practices." },
            { icon: <Sparkles className="text-blue-400" />, title: "Real-time Magic", desc: "Iterate instantly with a live preview that updates as the AI generates your code." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={wordVariants}
              whileHover={{ y: -15, scale: 1.03 }}
              className="glass p-12 rounded-[4rem] text-left border border-white/10 hover:border-white/20 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-10 border border-white/10 group-hover:scale-110 transition-transform duration-700 shadow-inner">
                {React.cloneElement(feature.icon as React.ReactElement, { size: 32 })}
              </div>
              <h3 className="text-3xl font-black mb-6 tracking-tight group-hover:text-primary transition-colors duration-500">{feature.title}</h3>
              <p className="text-secondary/60 text-lg leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
