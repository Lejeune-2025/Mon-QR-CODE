// Utilitaires pour encoder les données QR

import type { QRType, WifiData, VCardData, EmailData, VideoData } from '@/types/qr';

export function encodeQRData(type: QRType, data: any): string {
  switch (type) {
    case 'url':
      return data as string;
    case 'text':
      // Encoder le texte brut pour rester dans la limite des QR codes
      return data as string;
    case 'email':
      return encodeEmail(data as EmailData);
    case 'video':
      return (data as VideoData).url;
    case 'wifi':
      return encodeWifi(data as WifiData);
    case 'vcard':
      return encodeVCard(data as VCardData);
    default:
      return data as string;
  }
}

function encodeEmail(data: EmailData): string {
  const { email, subject, body } = data;
  let mailto = `mailto:${email}`;
  const params: string[] = [];
  
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  
  if (params.length > 0) {
    mailto += '?' + params.join('&');
  }
  
  return mailto;
}

function encodeWifi(data: WifiData): string {
  const { ssid, password, encryption, hidden } = data;
  let wifi = `WIFI:T:${encryption};S:${escapeSpecialChars(ssid)};`;
  
  if (encryption !== 'nopass' && password) {
    wifi += `P:${escapeSpecialChars(password)};`;
  }
  
  if (hidden) {
    wifi += 'H:true;';
  }
  
  wifi += ';';
  return wifi;
}

function encodeVCard(data: VCardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.firstName} ${data.lastName}`,
  ];

  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.company) lines.push(`ORG:${data.company}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.website) lines.push(`URL:${data.website}`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

function escapeSpecialChars(str: string): string {
  return str.replace(/([\\;,:"'])/g, '\\$1');
}

export function getDisplayText(type: QRType, data: any): string {
  switch (type) {
    case 'url':
    case 'text':
      return data as string;
    case 'video':
      return (data as VideoData).url;
    case 'email':
      return (data as EmailData).email;
    case 'wifi':
      return (data as WifiData).ssid;
    case 'vcard':
      const vcard = data as VCardData;
      return `${vcard.firstName} ${vcard.lastName}`;
    default:
      return String(data);
  }
}
