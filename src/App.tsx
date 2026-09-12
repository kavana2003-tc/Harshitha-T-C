import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { UploadArea } from "./components/UploadArea";
import { ResultView } from "./components/ResultView";
import { convertSketchToCode, modifyCodeWithPrompt, enhanceUI, validateAndFixCode, getUISuggestions } from "./services/aiService";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Github, Twitter, Linkedin, AlertCircle, Home as HomeIcon, Layout, ArrowLeft } from "lucide-react";
import { PhysicsWorld, BackgroundPhysics } from "./components/PhysicsWorld";
import { ErrorBoundary } from "./components/ErrorBoundary";

// --- Components ---

function GeneratedPage({ pages }: { pages: Record<string, string> }) {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const code = pageId ? pages[pageId] : null;

  if (!code) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center glass rounded-[3rem] border border-white/10 glow-primary mx-6 my-20">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-10 shadow-2xl shadow-blue-500/20"
        >
          <AlertCircle size={48} />
        </motion.div>
        <h2 className="text-5xl font-black mb-6 tracking-tighter text-gradient animate-gradient">Page Not Found</h2>
        <p className="text-2xl text-secondary/60 max-w-xl mx-auto mb-12 font-medium">
          The page you're looking for doesn't exist or hasn't been generated yet.
        </p>
        <Link
          to="/"
          className="apple-button-primary flex items-center gap-4 px-12 py-6 rounded-2xl text-xl font-black shadow-2xl shadow-blue-500/30"
        >
          <HomeIcon size={24} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-secondary hover:text-primary transition-all font-black tracking-tighter text-xl group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            BACK TO EDITOR
          </Link>
          <div className="flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-sm font-black text-primary shadow-2xl glow-primary">
            <Layout size={18} />
            LIVE PREVIEW: /{pageId}
          </div>
        </div>
        
        <ErrorBoundary>
          <div className="glass rounded-[4rem] overflow-hidden apple-shadow-lg border border-white/10 glow-primary h-[900px]">
            <iframe
              srcDoc={code}
              className="w-full h-full border-none"
              title={`Preview: ${pageId}`}
              sandbox="allow-scripts allow-forms allow-popups allow-modals"
            />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function MainApp() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<{ base64: string; mimeType: string } | null>(null);
  const [pages, setPages] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("visioncode-pages");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("visioncode-pages", JSON.stringify(pages));
  }, [pages]);

  const scrollToUpload = () => {
    console.log("Scrolling to upload area...");
    const element = document.getElementById("upload-area");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("Upload area element not found!");
    }
  };

  const handleUpload = async (base64: string, mimeType: string) => {
    console.log("Upload received, processing...");
    setIsProcessing(true);
    setLastUpload({ base64, mimeType });
    try {
      let code = await convertSketchToCode(base64, mimeType);
      code = await validateAndFixCode(code);
      console.log("Code generated and validated successfully!");
      setGeneratedCode(code);
    } catch (error) {
      console.error("Failed to generate code:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModify = async (prompt: string) => {
    if (!generatedCode) return;
    setIsProcessing(true);
    try {
      let updatedCode = await modifyCodeWithPrompt(generatedCode, prompt);
      updatedCode = await validateAndFixCode(updatedCode);
      setGeneratedCode(updatedCode);
    } catch (error) {
      console.error("Failed to modify code:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnhance = async () => {
    if (!generatedCode) return;
    setIsProcessing(true);
    try {
      let enhancedCode = await enhanceUI(generatedCode);
      enhancedCode = await validateAndFixCode(enhancedCode);
      setGeneratedCode(enhancedCode);
    } catch (error) {
      console.error("Failed to enhance UI:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = () => {
    if (lastUpload) {
      handleUpload(lastUpload.base64, lastUpload.mimeType);
    }
  };

  const handleSavePage = (name: string) => {
    if (generatedCode) {
      const id = name.toLowerCase().replace(/\s+/g, "-");
      setPages(prev => ({ ...prev, [id]: generatedCode }));
      return id;
    }
    return null;
  };

  return (
    <PhysicsWorld>
      <BackgroundPhysics />
      
      <Navbar onStart={scrollToUpload} />
      
      <main className="pt-20">
        <Routes>
          <Route path="/" element={
            <>
              <Hero onStart={scrollToUpload} />
              
              <div id="upload-area">
                <UploadArea onUpload={handleUpload} isProcessing={isProcessing} />
              </div>

              <section className="py-40 relative overflow-hidden rounded-[5rem] mx-6 glass mb-20 border border-white/10 glow-primary">
                <div className="container mx-auto px-6 text-center">
                  <h2 className="text-6xl font-black mb-24 tracking-tighter text-gradient animate-gradient">The VisionCode Workflow</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-20 max-w-6xl mx-auto">
                    {[
                      { step: "01", title: "Sketch", desc: "Draw your vision on paper or a tablet with total freedom." },
                      { step: "02", title: "Analyze", desc: "Our advanced AI identifies UI patterns and developer intent." },
                      { step: "03", title: "Deploy", desc: "Export clean, production-ready React code in seconds." }
                    ].map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                        className="relative group"
                      >
                        <div className="text-[12rem] font-black text-primary/5 absolute -top-24 left-1/2 -translate-x-1/2 -z-10 select-none group-hover:text-primary/10 transition-all duration-700">
                          {item.step}
                        </div>
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-10 shadow-inner border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                          <Sparkles size={32} />
                        </div>
                        <h3 className="text-3xl font-black mb-6 tracking-tight">{item.title}</h3>
                        <p className="text-xl text-secondary/70 leading-relaxed font-medium">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              <AnimatePresence>
                {generatedCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                  >
                    <ResultView 
                      code={generatedCode} 
                      onRegenerate={handleRegenerate} 
                      onSave={handleSavePage}
                      onModify={handleModify}
                      onEnhance={handleEnhance}
                      isProcessing={isProcessing}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {Object.keys(pages).length > 0 && (
                <section className="py-40 container mx-auto px-6 max-w-7xl">
                  <h2 className="text-5xl font-black mb-16 tracking-tighter text-gradient animate-gradient">Generated Pages</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.keys(pages).map((id) => (
                      <Link
                        key={id}
                        to={`/p/${id}`}
                        className="glass p-10 rounded-[3rem] border border-white/10 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                            <Layout size={28} />
                          </div>
                          <span className="text-xs font-black tracking-widest uppercase text-secondary/40">/{id}</span>
                        </div>
                        <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors duration-500 capitalize">{id.replace(/-/g, " ")}</h3>
                        <p className="text-secondary/60 font-medium">Click to view the live preview of this generated page.</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          } />
          <Route path="/p/:pageId" element={<GeneratedPage pages={pages} />} />
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center">
              <h2 className="text-6xl font-black mb-8 tracking-tighter text-gradient animate-gradient">404 - Not Found</h2>
              <Link to="/" className="apple-button-primary px-12 py-6 rounded-2xl text-xl font-black">Back to Home</Link>
            </div>
          } />
        </Routes>
      </main>

      <Footer />
    </PhysicsWorld>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function Footer() {
  return (
    <footer className="py-24 border-t border-white/10 bg-white/5 dark:bg-black/20 rounded-t-[5rem] mx-6 glass backdrop-blur-3xl">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 glow-primary"
            >
              <Sparkles size={24} />
            </motion.div>
            <span className="text-2xl font-black tracking-tighter text-gradient animate-gradient">VisionCode</span>
          </div>
          
          <p className="text-secondary/60 text-sm font-bold tracking-widest uppercase">
            © 2026 VisionCode Inc. DEVELOPED BY MANOJ
          </p>
          
          <div className="flex items-center gap-8 text-secondary/60">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ y: -5, color: "var(--primary)", scale: 1.2 }}
                className="transition-all duration-300"
              >
                <Icon size={24} strokeWidth={2.5} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
