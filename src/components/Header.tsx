import { Moon, Sun, QrCode, Sparkles, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useTheme from '@/hooks/useTheme';
import { toast } from 'sonner';

interface HeaderProps {
  totalCount: number;
}

export function Header({ totalCount }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleStudioClick = (e: React.MouseEvent) => {
    if (import.meta.env.PROD) {
      e.preventDefault();
      toast.info('Fonctionnalité en cours de développement', {
        description: 'Le Studio est visible uniquement en local pour le moment.',
        duration: 5000,
      });
    } else {
      navigate('/studio');
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full glass border-b"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-2 rounded-xl gradient-primary shadow-glow"
          >
            <QrCode className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-yellow-600">MON QR CODE</h1>
            <p className="text-xs text-muted-foreground">Mon Générateur Pro</p>
          </div>
        </div>

        {/* Nav & Stats & Theme Toggle */}
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button onClick={handleStudioClick} variant={location.pathname === '/studio' ? 'secondary' : 'outline'} className="relative h-9 px-3">
              <ImagePlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Miniature Studio</span>
              <span className="hidden sm:inline ml-2 px-2 py-0.5 text-[10px] rounded-full bg-yellow-400 text-black font-bold">
                NEW
              </span>
            </Button>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            <span> J'ai {totalCount} QR créés</span>
          </motion.div>

          {/* Bouton toggle */}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={toggleTheme}
          >
            {resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Changer le thème</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
