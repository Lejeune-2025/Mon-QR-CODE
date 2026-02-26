import { z } from 'zod';

// Schéma pour les types simples (URL, Texte)
export const simpleInputSchema = z.string().min(1, { message: 'Ce champ ne peut pas être vide.' });

// Schéma pour l'URL
export const urlSchema = z.string().url({ message: 'Veuillez entrer une URL valide.' });

// Schéma pour l'Email
export const emailSchema = z.object({
  email: z.string().email({ message: 'Adresse email invalide.' }),
  subject: z.string().optional(),
  body: z.string().optional(),
});

// Schéma pour la Vidéo
export const videoSchema = z.object({
  url: z.string().url({ message: 'Veuillez entrer une URL de vidéo valide.' }),
});

// Schéma pour le Wi-Fi
export const wifiSchema = z.object({
  ssid: z.string().min(1, { message: 'Le nom du réseau (SSID) est requis.' }),
  password: z.string().optional(),
  encryption: z.enum(['WPA', 'WEP', 'nopass']),
  hidden: z.boolean(),
});

// Schéma pour la vCard
export const vcardSchema = z.object({
  firstName: z.string().min(1, { message: 'Le prénom est requis.' }),
  lastName: z.string().min(1, { message: 'Le nom de famille est requis.' }),
  email: z.string().email({ message: 'Adresse email invalide.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  website: z.string().url({ message: 'URL de site web invalide.' }).optional().or(z.literal('')),
});
