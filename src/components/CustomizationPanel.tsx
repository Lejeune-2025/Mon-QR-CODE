import React from "react";
import { Palette, Maximize2, Shield, Image } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { QRSettings } from "@/types/qr";

interface CustomizationPanelProps {
  settings: QRSettings;
  onSettingsChange: (settings: QRSettings) => void;
}

export function CustomizationPanel({
  settings,
  onSettingsChange,
}: CustomizationPanelProps) {
  // ================= LOGO UPLOAD =================

  const handleLogoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onSettingsChange({
        ...settings,
        logoUrl: reader.result as string,
      });
    };

    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    onSettingsChange({
      ...settings,
      logoUrl: null,
    });
  };

  // ================= RENDER =================

  return (
    <div className="space-y-6 p-4 rounded-xl bg-card border">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        Personnalisation
      </h3>

      {/* COLORS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">Couleur du QR</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={settings.foregroundColor}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  foregroundColor: e.target.value,
                })
              }
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={settings.foregroundColor}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  foregroundColor: e.target.value,
                })
              }
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Couleur de fond</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  backgroundColor: e.target.value,
                })
              }
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  backgroundColor: e.target.value,
                })
              }
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* SIZE */}
      <div className="space-y-3">
        <Label className="text-sm flex items-center gap-2">
          <Maximize2 className="h-4 w-4" />
          Taille : {settings.size}px
        </Label>

        <Slider
          value={[settings.size]}
          min={128}
          max={512}
          step={32}
          onValueChange={(value) => {
            if (value?.[0] !== undefined) {
              onSettingsChange({
                ...settings,
                size: value[0],
              });
            }
          }}
          className="w-full"
        />
      </div>

      {/* LOGO */}
      <div className="space-y-3">
        <Label className="text-sm flex items-center gap-2">
          <Image className="h-4 w-4" />
          Logo au centre
        </Label>

        {settings.logoUrl ? (
          <div className="flex items-center gap-3">
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-12 h-12 object-contain rounded border"
            />
            <button
              type="button"
              onClick={removeLogo}
              className="text-sm text-destructive hover:underline"
            >
              Supprimer
            </button>
          </div>
        ) : (
          <Input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="cursor-pointer"
          />
        )}

        {settings.logoUrl && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Taille du logo : {settings.logoSize}px
            </Label>

            <Slider
              value={[settings.logoSize]}
              min={30}
              max={100}
              step={5}
              onValueChange={(value) => {
                if (value?.[0] !== undefined) {
                  onSettingsChange({
                    ...settings,
                    logoSize: value[0],
                  });
                }
              }}
            />
          </div>
        )}
      </div>

      {/* ERROR CORRECTION */}
      <div className="space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="text-sm flex items-center gap-2 cursor-help">
              <Shield className="h-4 w-4" />
              Correction d'erreur
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-xs">
              Plus le niveau est élevé, plus le QR Code peut être endommagé tout
              en restant lisible. Niveau H recommandé si vous ajoutez un logo.
            </p>
          </TooltipContent>
        </Tooltip>

        <Select
          value={settings.errorCorrectionLevel}
          onValueChange={(value) =>
            onSettingsChange({
              ...settings,
              errorCorrectionLevel: value as "L" | "M" | "Q" | "H",
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">L - Low (7%)</SelectItem>
            <SelectItem value="M">M - Medium (15%)</SelectItem>
            <SelectItem value="Q">Q - Quartile (25%)</SelectItem>
            <SelectItem value="H">H - High (30%)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}