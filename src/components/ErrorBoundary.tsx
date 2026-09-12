import React, { ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "motion/react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-12 text-center glass rounded-[3rem] border border-red-500/20 bg-red-500/5">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-8 shadow-2xl shadow-red-500/20"
      >
        <AlertCircle size={40} />
      </motion.div>
      <h2 className="text-3xl font-black mb-4 tracking-tight text-red-500">Something went wrong</h2>
      <p className="text-secondary/60 max-w-md mx-auto mb-10 font-medium">
        The generated page encountered a runtime error. This can happen if the AI uses undefined components or invalid syntax.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="apple-button-secondary flex items-center gap-3 px-8 py-4 rounded-2xl"
      >
        <RefreshCcw size={20} />
        Try Again
      </button>
      {error && (
        <pre className="mt-10 p-6 bg-black/40 rounded-2xl text-xs text-red-400/70 text-left overflow-auto max-w-2xl w-full border border-white/5 font-mono">
          {error.toString()}
        </pre>
      )}
    </div>
  );
}

export function ErrorBoundary({ children, fallback }: Props) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? undefined : ErrorFallback}
      fallback={fallback as React.ReactElement}
      onReset={() => {
        // Reset the state of your app so the error doesn't happen again
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
