import { useState, useRef } from "react";
import { Send, ImagePlus, X, Ruler, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PromptBarProps {
  onSubmit: (data: { prompt: string; plotSize: string; image: File | null }) => void;
  isLoading: boolean;
}

const PromptBar = ({ onSubmit, isLoading }: PromptBarProps) => {
  const [prompt, setPrompt] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit({ prompt: prompt.trim(), plotSize: plotSize.trim(), image });
    setPrompt("");
    setPlotSize("");
    setImage(null);
  };

  return (
    <div className="relative bg-card/90 glass border-t border-border/60 shadow-prompt">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
        <AnimatePresence>
          {image && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-2.5 bg-accent/30 rounded-xl border border-primary/10">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border/60">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Land photo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-sm"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{image.name}</p>
                  <p className="text-[11px] text-muted-foreground">Site photo attached</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 transition-all duration-200 ${
            isFocused ? "scale-[1.003]" : ""
          }`}
        >
          {/* Main prompt input */}
          <div
            className={`flex-1 flex items-center gap-3 bg-card rounded-2xl px-4 py-3.5 border transition-all duration-200 ${
              isFocused
                ? "border-primary/40 shadow-glow ring-2 ring-primary/8"
                : "border-border/80 hover:border-border"
            } shadow-card`}
          >
            <Sparkles className={`w-4 h-4 shrink-0 transition-all duration-200 ${isFocused ? "text-primary scale-110" : "text-muted-foreground"}`} />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Describe your dream home… e.g. 30×40 modern duplex"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none min-w-0"
            />
          </div>

          {/* Plot size input */}
          <div className="flex items-center gap-2 bg-card rounded-2xl px-3.5 py-3.5 border border-border/80 hover:border-border sm:w-36 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/8 transition-all shadow-card">
            <Ruler className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={plotSize}
              onChange={(e) => setPlotSize(e.target.value)}
              placeholder="Plot size"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none min-w-0"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 h-12 w-12 rounded-2xl border-border/80 hover:bg-accent/50 hover:border-primary/30 transition-all"
              title="Upload land photo"
            >
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="h-12 rounded-2xl px-6 gap-2.5 gradient-hero text-primary-foreground font-semibold shadow-glow hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isLoading ? "Generating…" : "Generate"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptBar;
