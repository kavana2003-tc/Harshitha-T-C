import { motion, useScroll, useTransform } from "motion/react";
import { Moon, Sun, Sparkles, RefreshCw } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { PhysicsWorldContext } from "./PhysicsWorld";

export function Navbar({ onStart }: { onStart: () => void }) {
  const [isDark, setIsDark] = useState(false);
  const physics = useContext(PhysicsWorldContext);
  const { scrollY } = useScroll();
  
  const navWidth = useTransform(scrollY, [0, 100], ["90%", "75%"]);
  const navPadding = useTransform(scrollY, [0, 100], ["1.5rem 2.5rem", "1rem 2rem"]);
  const navRadius = useTransform(scrollY, [0, 100], ["3rem", "2.5rem"]);
  const navY = useTransform(scrollY, [0, 100], [24, 16]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="fixed top-0 left-0 w-full flex justify-center z-50 pointer-events-none">
      <motion.nav
        style={{ width: navWidth, y: navY }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="pointer-events-auto"
      >
        <motion.div 
          style={{ padding: navPadding, borderRadius: navRadius }}
          className="glass apple-shadow-lg flex items-center justify-between border border-white/10"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 glow-primary"
            >
              <Sparkles size={24} />
            </motion.div>
            <span className="text-2xl font-black tracking-tighter text-gradient animate-gradient">
              VisionCode
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-secondary">
            {["How it works", "Examples", "Pricing"].map((item) => (
              <motion.a
                key={item}
                href="#"
                whileHover={{ y: -2, color: "var(--foreground)" }}
                className="transition-all duration-300 hover:glow-text"
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => physics?.resetWorld()}
              className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-accent transition-all text-secondary hover:text-foreground border border-transparent hover:border-white/10"
              title="Reset Physics"
            >
              <RefreshCw size={22} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDark(!isDark)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-accent transition-all border border-transparent hover:border-white/10"
            >
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="apple-button-primary text-sm py-3 px-8 rounded-2xl shadow-xl shadow-blue-500/20"
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
      </motion.nav>
    </div>
  );
}
