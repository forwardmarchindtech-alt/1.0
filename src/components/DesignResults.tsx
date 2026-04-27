import { Building2, Layers, PenTool, Eye, Download, Maximize2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface DesignResult {
  id: string;
  prompt: string;
  images: { label: string; url: string; icon: React.ReactNode }[];
}

interface DesignResultsProps {
  results: DesignResult[];
}

const suggestions = [
  "30×40 modern duplex with balcony",
  "50×80 farmhouse with courtyard",
  "20×30 compact 2BHK",
  "60×40 villa with garden",
];

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="flex flex-col items-center justify-center flex-1 py-16 px-4 relative"
  >
    {/* Background accents */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-primary/3 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
    </div>

    <motion.div
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
      className="relative mb-8"
    >
      <div className="w-28 h-28 rounded-[2rem] gradient-hero flex items-center justify-center shadow-glow animate-float">
        <Building2 className="w-14 h-14 text-primary-foreground" strokeWidth={1.5} />
      </div>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="absolute -bottom-2 -right-2 w-10 h-10 bg-card rounded-2xl border border-border/80 flex items-center justify-center shadow-elevated"
      >
        <Sparkles className="w-5 h-5 text-primary" />
      </motion.div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="text-center max-w-lg"
    >
      <h2 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">
        Design your <span className="text-gradient">dream home</span>
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed mb-10">
        Describe your requirements — plot size, style, floors — and our AI engine generates
        floor plans, elevations, and interior/exterior concepts in seconds.
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="flex flex-col items-center gap-3"
    >
      <p className="text-[11px] text-muted-foreground/70 font-semibold uppercase tracking-widest">Try a prompt</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {suggestions.map((ex, i) => (
          <motion.span
            key={ex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="text-xs px-4 py-2.5 rounded-full border border-border/80 text-muted-foreground bg-card/80 shadow-card hover:border-primary/40 hover:text-primary hover:bg-accent/30 cursor-default transition-all duration-200"
          >
            {ex}
          </motion.span>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

const typeIcons: Record<string, React.ReactNode> = {
  "Floor Plan": <Layers className="w-4 h-4" />,
  Elevation: <Eye className="w-4 h-4" />,
  Interior: <PenTool className="w-4 h-4" />,
  Exterior: <Building2 className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  "Floor Plan": "bg-primary/10 text-primary",
  Elevation: "bg-accent text-accent-foreground",
  Interior: "bg-secondary text-secondary-foreground",
  Exterior: "bg-primary/10 text-primary",
};

const ImageCard = ({ img, index }: { img: { label: string; url: string }; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.12, duration: 0.45, ease: "easeOut" }}
        className="group relative rounded-2xl overflow-hidden bg-card border border-border/60 shadow-card hover:shadow-elevated transition-all duration-300"
      >
        <div className="relative overflow-hidden">
          <img
            src={img.url}
            alt={img.label}
            className="w-full aspect-[4/3] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Actions */}
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={() => setExpanded(true)}
              className="w-9 h-9 rounded-xl bg-card/90 glass border border-border/60 flex items-center justify-center hover:bg-card hover:scale-105 transition-all"
            >
              <Maximize2 className="w-4 h-4 text-foreground" />
            </button>
            <a
              href={img.url}
              download
              className="w-9 h-9 rounded-xl bg-card/90 glass border border-border/60 flex items-center justify-center hover:bg-card hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4 text-foreground" />
            </a>
          </div>

          {/* Type badge on image */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="text-xs font-semibold text-primary-foreground bg-foreground/60 glass px-3 py-1.5 rounded-full">
              {img.label}
            </span>
          </div>
        </div>

        {/* Label bar */}
        <div className="px-4 py-3.5 flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${typeColors[img.label] || "bg-secondary text-secondary-foreground"}`}>
            {typeIcons[img.label] || <Layers className="w-4 h-4" />}
          </div>
          <span className="text-sm font-semibold text-foreground">{img.label}</span>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/80 glass flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setExpanded(false)}
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={img.url}
              alt={img.label}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const DesignResults = ({ results }: DesignResultsProps) => {
  if (results.length === 0) return <EmptyState />;

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-10">
      <AnimatePresence>
        {results.map((result) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 max-w-5xl mx-auto"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shrink-0 mt-0.5 shadow-glow">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{result.prompt}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.images.length} of 4 designs generated
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-[52px]">
              {result.images.map((img, i) => (
                <ImageCard key={i} img={img} index={i} />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DesignResults;
export type { DesignResult };
