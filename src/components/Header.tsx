import { Hexagon, Sparkles, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="relative flex items-center justify-between px-4 md:px-6 py-3 bg-card/80 glass border-b border-border/60 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex items-center justify-center w-10 h-10 rounded-xl gradient-hero shadow-glow animate-glow-pulse cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Hexagon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
        </motion.div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-display font-bold text-foreground tracking-tight leading-tight">
            Tecton Forge AI
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
            Architectural Design Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-full border border-primary/10">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium">AI-Powered</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin")}
          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all"
          title="Analytics"
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
