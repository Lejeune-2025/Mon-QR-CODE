// Aperçu et export du QR Code

import { useState, useEffect } from 'react';
import { Download, Copy, Check, FileImage, FileType, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { downloadQRCode, copyQRCodeToClipboard, generateSVG } from '@/utils/qr-generator';
import { encodeQRData } from '@/utils/qr-encoder';
import { toast } from 'sonner';
import type { QRSettings, ExportFormat, QRType } from '@/types/qr';

interface QRPreviewProps {
  dataUrl: string;
  isGenerating: boolean;
  settings: QRSettings;
  qrType: QRType;
  inputData: any;
}

export function QRPreview({ dataUrl, isGenerating, settings, qrType, inputData }: QRPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [filename, setFilename] = useState('qr-code');
  const [showAnimation, setShowAnimation] = useState(false);

  const handleDownload = async (format: ExportFormat) => {
    if (!dataUrl) return;

    try {
      if (format === 'svg') {
        const encodedData = encodeQRData(qrType, inputData);
        const svgString = await generateSVG(encodedData, settings);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.svg`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        downloadQRCode(dataUrl, filename, format);
      }
      toast.success(`QR Code téléchargé en ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleCopy = async () => {
    if (!dataUrl) return;

    const success = await copyQRCodeToClipboard(dataUrl);
    if (success) {
      setCopied(true);
      toast.success('QR Code copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Impossible de copier le QR Code');
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-6 p-6 rounded-2xl bg-card border shadow-lg"
    >
      {/* Zone d'aperçu */}
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[300px] mx-auto aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Génération...</span>
          </div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt="QR Code généré"
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="text-center p-6">
            <div className="w-32 h-32 mx-auto mb-4 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <FileImage className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">
              Remplissez les champs et cliquez sur "Générer"
            </p>
          </div>
        )}
      </div>

      {/* Options d'export */}
      {dataUrl && (
        <div className="w-full space-y-4">
          {/* Nom du fichier */}
          <div className="flex items-center gap-2">
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Nom du fichier"
              className="flex-1"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-2">
            {qrType === 'text' && (
              <Button 
                onClick={() => setShowAnimation(true)}
                className="gap-2 flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Heart className="h-4 w-4" />
                Voir l'animation
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownload('png')}>
                  <FileImage className="mr-2 h-4 w-4" />
                  PNG (image)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('jpg')}>
                  <FileImage className="mr-2 h-4 w-4" />
                  JPG (image)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('svg')}>
                  <FileType className="mr-2 h-4 w-4" />
                  SVG (vectoriel)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copié !' : 'Copier'}
            </Button>
          </div>
        </div>
      )}

      {/* Modal Animation avec cœurs */}
      <Dialog open={showAnimation} onOpenChange={setShowAnimation}>
        <DialogContent className="max-w-2xl h-96 overflow-hidden p-0 border-none bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500">
          <DialogHeader className="sr-only">
            <DialogTitle>Animation du message avec cœurs</DialogTitle>
            <DialogDescription>
              Aperçu animé de votre message avec des cœurs tombants
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
            {/* Animation de cœurs */}
            <AnimationHearts />
            
            {/* Texte affiché */}
            <div className="text-center z-10 relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg animate-pulse break-all">
                {typeof inputData === 'string' ? inputData : ''}
              </h2>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant pour animer les cœurs tombants
const AnimationHearts: React.FC = () => {
  const [hearts, setHearts] = useState<Array<{ id: string; left: number; duration: number }>>([]);

  useEffect(() => {
    // Générer des cœurs initiales
    const initialHearts = Array.from({ length: 8 }).map((_, i) => ({
      id: `initial-${i}`,
      left: Math.random() * 100,
      duration: 3 + Math.random() * 2,
    }));
    setHearts(initialHearts);

    // Générer de nouveaux cœurs périodiquement
    const interval = setInterval(() => {
      setHearts((prev) => {
        const newHeart = {
          id: Date.now() + Math.random().toString(),
          left: Math.random() * 100,
          duration: 3 + Math.random() * 2,
        };
        // Garder max 20 cœurs à la fois
        return [...prev.slice(-19), newHeart];
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-4xl pointer-events-none"
          style={{
            left: `${heart.left}%`,
            top: '-50px',
            animation: `fall ${heart.duration}s linear forwards`,
          }}
        >
          ❤️
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotateZ(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(400px) rotateZ(720deg);
          }
        }
      `}</style>
    </>
  );
};
