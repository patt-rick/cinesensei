"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { X, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            className="relative bg-[#111827] border border-[#1f2937] rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="p-3 rounded-full bg-indigo-600/20 border border-indigo-500/30">
                <Film size={28} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sign in to CineSensei</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Save your watchlist and get personalized recommendations
                </p>
              </div>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold"
              >
                {loading ? "Signing in..." : "Continue with Google"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
