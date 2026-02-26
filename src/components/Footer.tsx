// Footer avec informations

import { Heart, Github, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="py-8 px-4 border-t bg-muted/30">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Créé Par Covanix <Heart className="h-4 w-4 text-destructive fill-destructive" />
          </p>
          
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Lejeune-2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link
              to="/mentions-legales"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Mentions Légales
            </Link>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground/60 text-center mt-4">
          © {new Date().getFullYear()} Mon QR . Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
