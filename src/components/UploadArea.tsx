import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, X, Sparkles, Loader2, FileImage } from "lucide-react";

interface UploadAreaProps {
  onUpload: (imageBase64: string, mimeType: string) => void;
  isProcessing: boolean;
}

export function UploadArea({ onUpload, isProcessing }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onUpload(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <section className="py-40 container mx-auto px-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 25 }}
        className={`relative glass rounded-[4rem] p-20 text-center border-2 transition-all duration-700 apple-shadow-lg glow-primary ${
          dragActive 
            ? "border-primary bg-primary/5 scale-[1.02] ring-8 ring-primary/5" 
            : "border-white/10"
        }`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
      >
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
              className="flex flex-col items-center"
            >
              <motion.div 
                animate={dragActive ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                className="w-28 h-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-12 shadow-inner border border-primary/20"
              >
                <Upload size={40} strokeWidth={2.5} />
              </motion.div>
              <h2 className="text-5xl font-black mb-8 tracking-tighter text-gradient animate-gradient">Drop your sketch</h2>
              <p className="text-2xl text-secondary/70 mb-16 max-w-xl mx-auto leading-relaxed font-medium">
                Upload a photo of your hand-drawn wireframe and watch it transform into production-ready code.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log("Select Image button clicked!");
                  fileInputRef.current?.click();
                }}
                className="apple-button-primary text-xl py-5 px-12 rounded-2xl shadow-2xl shadow-blue-500/20"
              >
                Select Image
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onChange}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Sketch Preview"
                  className="max-h-[700px] rounded-[3rem] apple-shadow-lg object-contain border-8 border-white dark:border-zinc-800"
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPreview(null)}
                  className="absolute -top-6 -right-6 w-14 h-14 bg-white dark:bg-zinc-900 rounded-full apple-shadow-md flex items-center justify-center text-secondary hover:text-red-500 transition-all border border-border shadow-2xl"
                >
                  <X size={28} />
                </motion.button>
              </div>

              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-[3rem] flex flex-col items-center justify-center z-30"
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.4, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full"
                      />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="relative text-primary"
                      >
                        <Loader2 size={80} strokeWidth={1.5} />
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 text-center"
                    >
                      <h3 className="text-4xl font-black tracking-tighter text-gradient animate-gradient">AI is thinking...</h3>
                      <p className="text-xl text-secondary font-bold mt-4">Crafting your production-ready code</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
