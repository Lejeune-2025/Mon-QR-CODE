// Types pour le générateur de QR Code

export type QRType = 'url' | 'text' | 'email' | 'video' | 'wifi' | 'vcard';

export interface QRTypeOption {
  type: QRType;
  label: string;
  icon: string;
  placeholder: string;
}

export interface VideoData {
  url: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  website: string;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface QRSettings {
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logoUrl: string | null;
  logoSize: number;
}

export interface QRHistoryItem {
  id: string;
  type: QRType;
  data: string;
  displayText: string;
  settings: QRSettings;
  createdAt: number;
  dataUrl: string;
}

export type ExportFormat = 'png' | 'jpg' | 'svg';

export const DEFAULT_QR_SETTINGS: QRSettings = {
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  size: 256,
  errorCorrectionLevel: 'M',
  logoUrl: null,
  logoSize: 50,
};

export const QR_TYPE_OPTIONS: QRTypeOption[] = [
  { type: 'url', label: 'URL', icon: 'Link', placeholder: 'https://example.com' },
  { type: 'text', label: 'Texte', icon: 'Type', placeholder: 'Entrez votre texte...' },
  { type: 'email', label: 'Email', icon: 'Mail', placeholder: 'email@example.com' },
  { type: 'video', label: 'Vidéo', icon: 'Video', placeholder: 'Lien de la vidéo' },
  { type: 'wifi', label: 'Wi-Fi', icon: 'Wifi', placeholder: 'Nom du réseau' },
  { type: 'vcard', label: 'Contact', icon: 'User', placeholder: 'Prénom Nom' },
];
