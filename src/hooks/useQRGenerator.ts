// Version simplifiée et sûre - à remplacer dans useQRGenerator.ts

import { useState, useCallback, useEffect, useRef } from 'react';
import type { QRType, QRSettings, QRHistoryItem, EmailData, WifiData, VCardData, VideoData } from '@/types/qr';
import { DEFAULT_QR_SETTINGS } from '@/types/qr';
import { generateQRCode } from '@/utils/qr-generator';
import { encodeQRData, getDisplayText } from '@/utils/qr-encoder';
import useQRHistory from './useQRHistory';
import { z } from 'zod';
import { urlSchema, simpleInputSchema, emailSchema, videoSchema, wifiSchema, vcardSchema } from '@/lib/validation';

export function useQRGenerator() {
  const [qrType, setQRType] = useState<QRType>('url');
  const [inputData, setInputData] = useState<string>('');
  const [emailData, setEmailData] = useState<EmailData>({ email: '', subject: '', body: '' });
  const [videoData, setVideoData] = useState<VideoData>({ url: '' });
  const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', password: '', encryption: 'WPA', hidden: false });
  const [vcardData, setVCardData] = useState<VCardData>({
    firstName: '', lastName: '', email: '', phone: '', company: '', title: '', website: ''
  });
  const [settings, setSettings] = useState<QRSettings>(DEFAULT_QR_SETTINGS);
  const [qrDataUrl, setQRDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<z.ZodError | null>(null);

  // Robustification du hook history
  const _qrHistory = useQRHistory() as any;
  const history = _qrHistory?.history ?? [];
  const addToHistory = _qrHistory?.add ?? _qrHistory?.addToHistory ?? (() => {});
  const removeFromHistory = _qrHistory?.remove ?? _qrHistory?.removeFromHistory ?? (() => {});
  const clearHistory = _qrHistory?.clear ?? _qrHistory?.clearHistory ?? (() => {});
  const totalCount = typeof _qrHistory?.totalCount === 'number' ? _qrHistory.totalCount : (Array.isArray(history) ? history.length : 0);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentData = useCallback(() => {
    switch (qrType) {
      case 'email':
        return emailData;
      case 'wifi':
        return wifiData;
      case 'vcard':
        return vcardData;
      case 'video':
        return videoData;
      default:
        return inputData;
    }
  }, [qrType, inputData, emailData, wifiData, vcardData, videoData]);

  const validateInput = useCallback(() => {
    const currentData = getCurrentData();
    let schema;

    switch (qrType) {
      case 'url':
        schema = urlSchema;
        break;
      case 'text':
        schema = simpleInputSchema;
        break;
      case 'email':
        schema = emailSchema;
        break;
      case 'video':
        schema = videoSchema;
        break;
      case 'wifi':
        schema = wifiSchema;
        break;
      case 'vcard':
        schema = vcardSchema;
        break;
      default:
        return true;
    }

    const result = schema.safeParse(currentData);
    if (!result.success) {
      setValidationErrors(result.error);
    } else {
      setValidationErrors(null);
    }
    return result.success;
  }, [qrType, getCurrentData]);

  const generate = useCallback(async () => {
    if (!validateInput()) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Délai artificiel pour permettre de voir l'animation de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));

      const currentData = getCurrentData();
      const encodedData = encodeQRData(qrType, currentData);
      const dataUrl = await generateQRCode(encodedData, settings);
      setQRDataUrl(dataUrl);

      const historyItem: QRHistoryItem = {
        id: crypto.randomUUID(),
        type: qrType,
        data: encodedData,
        displayText: getDisplayText(qrType, currentData),
        settings: { ...settings },
        createdAt: Date.now(),
        dataUrl,
      };
      addToHistory(historyItem);
    } catch (err) {
      setError('Erreur lors de la génération du QR Code');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [qrType, getCurrentData, settings, validateInput, addToHistory]);

  // Debounce simple sans conflit DOM
  useEffect(() => {
    const currentData = getCurrentData();
    if (!qrDataUrl || !validateInput()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const currentData = getCurrentData();
        const encodedData = encodeQRData(qrType, currentData);
        const dataUrl = await generateQRCode(encodedData, settings);
        setQRDataUrl(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [settings, qrType]);

  const loadFromHistory = useCallback((item: QRHistoryItem) => {
    setQRDataUrl(item.dataUrl);
    setSettings(item.settings);
    setQRType(item.type);
    if (item.type === 'url' || item.type === 'text') {
      setInputData(item.displayText);
    } else if (item.type === 'video') {
      // Assuming displayText for video is the URL
      setVideoData({ url: item.displayText });
    }
  }, []);

  const resetForm = useCallback(() => {
    setInputData('');
    setEmailData({ email: '', subject: '', body: '' });
    setVideoData({ url: '' });
    setWifiData({ ssid: '', password: '', encryption: 'WPA', hidden: false });
    setVCardData({ firstName: '', lastName: '', email: '', phone: '', company: '', title: '', website: '' });
    setQRDataUrl('');
    setError(null);
    setValidationErrors(null);
  }, []);

  return {
    qrType,
    inputData,
    emailData,
    videoData,
    wifiData,
    vcardData,
    settings,
    qrDataUrl,
    isGenerating,
    error,
    validationErrors,
    history,
    totalCount,
    setQRType,
    setInputData,
    setEmailData,
    setVideoData,
    setWifiData,
    setVCardData,
    setSettings,
    generate,
    loadFromHistory,
    removeFromHistory,
    clearHistory,
    resetForm,
    validateInput,
  };
}