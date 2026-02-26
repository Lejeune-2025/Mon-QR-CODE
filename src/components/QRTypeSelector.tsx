// Sélecteur de type de QR Code

import { Link, Type, Mail, Wifi, User, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { QRType } from '@/types/qr';
import { QR_TYPE_OPTIONS } from '@/types/qr';

interface QRTypeSelectorProps {
  selectedType: QRType;
  onTypeChange: (type: QRType) => void;
}

const iconMap = {
  Link,
  Type,
  Mail,
  Video,
  Wifi,
  User,
};

export function QRTypeSelector({ selectedType, onTypeChange }: QRTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Type de QR Code
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {QR_TYPE_OPTIONS.map((option, index) => {
          const IconComponent = iconMap[option.icon as keyof typeof iconMap];
          const isSelected = selectedType === option.type;

          return (
            <motion.button
              key={option.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onTypeChange(option.type)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary shadow-glow'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
              )}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs font-medium">{option.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="type-indicator"
                  className="absolute inset-0 border-2 border-primary rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
