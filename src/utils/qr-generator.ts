// Génération de QR Code avec la bibliothèque qrcode

import QRCode from 'qrcode';
import type { QRSettings, ExportFormat } from '@/types/qr';

export async function generateQRCode(
  data: string,
  settings: QRSettings
): Promise<string> {
  const options: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: settings.errorCorrectionLevel,
    type: 'image/png',
    width: settings.size,
    margin: 2,
    color: {
      dark: settings.foregroundColor,
      light: settings.backgroundColor,
    },
  };

  try {
    const dataUrl = await QRCode.toDataURL(data, options);
    
    // Si un logo est spécifié, on l'ajoute au centre
    if (settings.logoUrl) {
      return await addLogoToQR(dataUrl, settings.logoUrl, settings.logoSize, settings.size);
    }
    
    return dataUrl;
  } catch (error) {
    console.error('Erreur lors de la génération du QR Code:', error);
    throw error;
  }
}

async function addLogoToQR(
  qrDataUrl: string,
  logoUrl: string,
  logoSize: number,
  qrSize: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    canvas.width = qrSize;
    canvas.height = qrSize;
    
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);
      
      const logoImage = new Image();
      logoImage.crossOrigin = 'anonymous';
      logoImage.onload = () => {
        const logoX = (qrSize - logoSize) / 2;
        const logoY = (qrSize - logoSize) / 2;
        
        // Fond blanc derrière le logo
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
        
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        resolve(canvas.toDataURL('image/png'));
      };
      logoImage.onerror = () => resolve(qrDataUrl); // En cas d'erreur, retourner le QR sans logo
      logoImage.src = logoUrl;
    };
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });
}

export async function generateSVG(data: string, settings: QRSettings): Promise<string> {
  const options: QRCode.QRCodeToStringOptions = {
    errorCorrectionLevel: settings.errorCorrectionLevel,
    type: 'svg',
    width: settings.size,
    margin: 2,
    color: {
      dark: settings.foregroundColor,
      light: settings.backgroundColor,
    },
  };

  return await QRCode.toString(data, options);
}

export function downloadQRCode(
  dataUrl: string,
  filename: string,
  format: ExportFormat
): void {
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  
  if (format === 'svg') {
    // Pour SVG, on doit d'abord générer le SVG
    link.href = dataUrl;
  } else if (format === 'jpg') {
    // Convertir PNG en JPG
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      }
    };
    img.src = dataUrl;
    return;
  } else {
    link.href = dataUrl;
  }
  
  link.click();
}

export async function copyQRCodeToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    return false;
  }
}
