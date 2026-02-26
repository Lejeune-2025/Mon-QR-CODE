// Historique des QR Codes générés

import { Clock, Trash2, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { QRHistoryItem } from '@/types/qr';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QRHistoryProps {
  history: QRHistoryItem[];
  onLoadItem: (item: QRHistoryItem) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
}

export function QRHistory({ history, onLoadItem, onRemoveItem, onClearHistory }: QRHistoryProps) {
  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-xl bg-card border text-center"
      >
        <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Aucun QR Code dans l'historique
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Vos QR Codes apparaîtront ici après génération
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Historique ({history.length})</h3>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Vider l'historique ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera tous les QR Codes de votre historique local.
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onClearHistory} className="bg-destructive hover:bg-destructive/90">
                Vider
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Liste */}
      <ScrollArea className="h-[300px]">
        <AnimatePresence>
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-muted/50 transition-colors group"
            >
              {/* Miniature */}
              <img
                src={item.dataUrl}
                alt="QR miniature"
                className="w-12 h-12 rounded border bg-white"
              />

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium whitespace-normal break-all max-h-12 overflow-hidden"
                  title={item.displayText}
                >
                  {item.displayText}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.type.toUpperCase()} • {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: fr })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onLoadItem(item)}
                  className="h-8 w-8"
                  title="Recharger"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  title="Supprimer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </motion.div>
  );
}
