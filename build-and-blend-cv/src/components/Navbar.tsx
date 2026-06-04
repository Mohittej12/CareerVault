import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl whitespace-nowrap shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-primary">
            ResumeAI
          </span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/analyzer">
            <Button variant="ghost" className="text-foreground font-semibold hover:text-primary">Analyzer</Button>
          </Link>
          <Link to="/builder">
            <Button variant="ghost" className="text-foreground font-semibold hover:text-primary">Builder</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
