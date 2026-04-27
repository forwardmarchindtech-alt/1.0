import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import DesignResults, { type DesignResult } from "@/components/DesignResults";
import PromptBar from "@/components/PromptBar";
import { supabase } from "@/integrations/supabase/client"; // still used for page_visits tracking

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const DESIGN_TYPES = ["floorplan", "elevation", "interior", "exterior"] as const;
const DESIGN_LABELS: Record<string, string> = {
  floorplan: "Floor Plan",
  elevation: "Elevation",
  interior: "Interior",
  exterior: "Exterior",
};

const Index = () => {
  
  const [results, setResults] = useState<DesignResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentType, setCurrentType] = useState("");
  const abortRef = useRef(false);

  // Track page visit
  useEffect(() => {
    supabase.from("page_visits").insert([
      {
        user_id: null,
        page: window.location.pathname,
        user_agent: navigator.userAgent,
      },
    ]);
  }, []);

  const generateOne = async (prompt: string, type: string): Promise<{ label: string; url: string } | null> => {
    try {
      setCurrentType(DESIGN_LABELS[type] || type);

      const response = await fetch("/api/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        toast.error(data?.error || `Failed to generate ${type}`);
        return null;
      }

      return { label: DESIGN_LABELS[type] || type, url: data.imageUrl };
    } catch (err) {
      console.error(`Failed ${type}:`, err);
      return null;
    }
  };

  const handleGenerate = async (data: { prompt: string; plotSize: string; image: File | null }) => {
    setIsLoading(true);
    abortRef.current = false;

    const fullPrompt = data.plotSize
      ? `${data.prompt} (Plot size: ${data.plotSize})`
      : data.prompt;

    const resultId = crypto.randomUUID();

    setResults((prev) => [
      { id: resultId, prompt: fullPrompt, images: [] },
      ...prev,
    ]);

    const promises = DESIGN_TYPES.map(async (type) => {
      const img = await generateOne(fullPrompt, type);
      if (img && !abortRef.current) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === resultId
              ? { ...r, images: [...r.images, { ...img, icon: null }] }
              : r
          )
        );
      }
    });

    await Promise.all(promises);

    setIsLoading(false);
    setCurrentType("");
    toast.success("Design generation complete!");
  };

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      <Header />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 md:px-8 pt-6 max-w-5xl mx-auto w-full"
          >
            <div className="flex items-center gap-4 p-4 bg-card/90 glass rounded-2xl border border-primary/10 shadow-card">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center animate-pulse-soft shadow-glow">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-shimmer" style={{ width: "60%", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-glow)), hsl(var(--primary)))" }} />
                  </div>
                  <span className="text-xs font-semibold text-primary">{currentType}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generating designs… this may take a minute
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DesignResults results={results} />
      <PromptBar onSubmit={handleGenerate} isLoading={isLoading} />
    </div>
  );
};

export default Index;
