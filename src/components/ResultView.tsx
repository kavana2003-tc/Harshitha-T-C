import { motion, AnimatePresence } from "motion/react";
import { Code2, Eye, Download, Copy, RefreshCcw, Check, Layout, Send, Sparkles, Wand2, Loader2 } from "lucide-react";
import React, { useState } from "react";

interface ResultViewProps {
  code: string;
  onRegenerate: () => void;
  onSave?: (name: string) => string | null;
  onModify?: (prompt: string) => void;
  onEnhance?: () => void;
  isProcessing?: boolean;
}

export function ResultView({ code, onRegenerate, onSave, onModify, onEnhance, isProcessing }: ResultViewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [modifyPrompt, setModifyPrompt] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave && saveName.trim()) {
      const id = onSave(saveName);
      setSavedId(id);
      setIsSaving(false);
      setSaveName("");
      setTimeout(() => setSavedId(null), 3000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "visioncode-output.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onModify && modifyPrompt.trim()) {
      onModify(modifyPrompt);
      setModifyPrompt("");
    }
  };

  return (
    <section className="py-40 container mx-auto px-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 25 }}
        className="glass rounded-[4rem] overflow-hidden apple-shadow-lg border border-white/10 glow-primary relative"
      >
        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6 text-primary"
              >
                <Loader2 size={64} />
              </motion.div>
              <h3 className="text-3xl font-black tracking-tighter animate-pulse">REFINING YOUR VISION...</h3>
              <p className="text-white/60 mt-4 font-medium">Applying AI modifications and validating code</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-16 py-10 border-b border-white/10 flex flex-col lg:flex-row items-center justify-between gap-10 bg-white/10 dark:bg-black/20 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="relative flex items-center p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl w-full md:w-auto border border-white/5">
              {/* Sliding Indicator */}
              <motion.div
                layoutId="tab-indicator"
                className="absolute h-[calc(100%-12px)] bg-white dark:bg-zinc-800 rounded-xl shadow-2xl z-0"
                initial={false}
                animate={{
                  left: activeTab === "preview" ? "6px" : "50%",
                  width: "calc(50% - 6px)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              
              <button
                onClick={() => setActiveTab("preview")}
                className={`relative z-10 flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-sm font-black transition-all duration-300 ${
                  activeTab === "preview" ? "text-primary" : "text-secondary hover:text-foreground"
                }`}
              >
                <Eye size={20} strokeWidth={2.5} />
                PREVIEW
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`relative z-10 flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-sm font-black transition-all duration-300 ${
                  activeTab === "code" ? "text-primary" : "text-secondary hover:text-foreground"
                }`}
              >
                <Code2 size={20} strokeWidth={2.5} />
                CODE
              </button>
            </div>

            {onEnhance && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnhance}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all group"
              >
                <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                ENHANCE UI
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-6 w-full lg:w-auto justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRegenerate}
              className="w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-secondary border border-transparent hover:border-white/10"
              title="Regenerate"
            >
              <RefreshCcw size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-secondary border border-transparent hover:border-white/10"
              title="Copy Code"
            >
              {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
            </motion.button>

            {onSave && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSaving(!isSaving)}
                  className={`py-4 px-10 rounded-2xl flex items-center gap-3 text-sm font-black transition-all duration-300 ${
                    savedId ? "bg-green-500/20 text-green-500 border border-green-500/30" : "bg-white/5 text-secondary hover:text-primary border border-white/10"
                  }`}
                >
                  {savedId ? (
                    <>
                      <Check size={20} />
                      SAVED AS /{savedId}
                    </>
                  ) : (
                    <>
                      <Layout size={20} />
                      SAVE TO ROUTE
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isSaving && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-4 right-0 w-80 p-6 glass rounded-3xl border border-white/10 shadow-2xl z-50"
                    >
                      <h4 className="text-lg font-black mb-4 tracking-tight">Route Name</h4>
                      <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="e.g. dashboard"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-primary transition-all"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsSaving(false)}
                          className="flex-1 py-3 rounded-xl text-sm font-bold hover:bg-white/5 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!saveName.trim()}
                          className="flex-1 apple-button-primary py-3 rounded-xl text-sm font-black disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="apple-button-primary py-4 px-10 flex items-center gap-3 text-sm font-black shadow-2xl shadow-blue-500/30"
            >
              <Download size={22} />
              EXPORT CODE
            </motion.button>
          </div>
        </div>

        {/* Modification Bar */}
        {onModify && (
          <div className="px-16 py-6 bg-black/5 dark:bg-white/5 border-b border-white/10">
            <form onSubmit={handleModifySubmit} className="flex items-center gap-4">
              <div className="relative flex-1">
                <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input
                  type="text"
                  value={modifyPrompt}
                  onChange={(e) => setModifyPrompt(e.target.value)}
                  placeholder="Describe changes... (e.g. 'Make buttons rounded and blue', 'Add a sidebar')"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!modifyPrompt.trim() || isProcessing}
                className="apple-button-primary px-10 py-4 flex items-center gap-3 text-sm font-black disabled:opacity-50"
              >
                <Send size={18} />
                MODIFY
              </motion.button>
            </form>
          </div>
        )}

        {/* Content Area */}
        <div className="h-[850px] relative bg-white dark:bg-zinc-950">
          <AnimatePresence mode="wait">
            {activeTab === "preview" ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="w-full h-full"
              >
                <iframe
                  srcDoc={code}
                  className="w-full h-full border-none"
                  title="Preview"
                  sandbox="allow-scripts allow-forms allow-popups allow-modals"
                />
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="w-full h-full bg-[#0a0a0a] text-zinc-400 p-16 overflow-auto font-mono text-lg leading-relaxed selection:bg-primary/30"
              >
                <pre className="max-w-5xl mx-auto">
                  <code>{code}</code>
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
