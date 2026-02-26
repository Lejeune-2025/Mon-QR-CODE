// Formulaires de saisie dynamiques selon le type de QR

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { QRType, EmailData, WifiData, VCardData, VideoData } from '@/types/qr';
import { QR_TYPE_OPTIONS } from '@/types/qr';
import { z } from 'zod';

interface DataInputFormProps {
  type: QRType;
  inputData: string;
  emailData: EmailData;
  wifiData: WifiData;
  vcardData: VCardData;
  videoData: VideoData;
  onInputChange: (value: string) => void;
  onEmailChange: (data: EmailData) => void;
  onWifiChange: (data: WifiData) => void;
  onVCardChange: (data: VCardData) => void;
  onVideoChange: (data: VideoData) => void;
  validationErrors: z.ZodError | null;
}

export function DataInputForm({
  type,
  inputData,
  emailData,
  wifiData,
  vcardData,
  videoData,
  onInputChange,
  onEmailChange,
  onWifiChange,
  onVCardChange,
  onVideoChange,
  validationErrors,
}: DataInputFormProps) {
  const placeholder = QR_TYPE_OPTIONS.find(o => o.type === type)?.placeholder || '';

  const getErrorMessage = (path: (string | number)[]) => {
    return validationErrors?.errors.find(err => err.path.join('.') === path.join('.'))?.message;
  };

  const ErrorMessage = ({ path }: { path: (string | number)[] }) => {
    const message = getErrorMessage(path);
    return message ? <p className="text-sm text-destructive mt-1">{message}</p> : null;
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Données du QR Code</Label>
      <div className="space-y-4">
        {(type === 'url' || type === 'text') && (
          <div className="space-y-2">
            {type === 'text' ? (
              <>
                <Textarea
                  placeholder={placeholder}
                  value={inputData}
                  onChange={(e) => onInputChange(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <ErrorMessage path={[]} />
              </>
            ) : (
              <>
                <Input
                  type={'url'}
                  placeholder={placeholder}
                  value={inputData}
                  onChange={(e) => onInputChange(e.target.value)}
                  className="h-12"
                />
                <ErrorMessage path={[]} />
              </>
            )}
          </div>
        )}
        {type === 'email' && (
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Adresse email *"
              value={emailData.email}
              onChange={(e) => onEmailChange({ ...emailData, email: e.target.value })}
              className="h-12"
            />
            <ErrorMessage path={['email']} />
            <Input
              placeholder="Sujet (optionnel)"
              value={emailData.subject}
              onChange={(e) => onEmailChange({ ...emailData, subject: e.target.value })}
            />
            <Textarea
              placeholder="Message (optionnel)"
              value={emailData.body}
              onChange={(e) => onEmailChange({ ...emailData, body: e.target.value })}
              className="min-h-[80px] resize-none"
            />
          </div>
        )}
        {type === 'video' && (
          <div className="space-y-3">
            <Input
              type="url"
              placeholder="Lien de la vidéo (YouTube, Vimeo...) *"
              value={videoData.url}
              onChange={(e) => onVideoChange({ ...videoData, url: e.target.value })}
              className="h-12"
            />
            <ErrorMessage path={['url']} />
          </div>
        )}
        {type === 'wifi' && (
          <div className="space-y-3">
            <Input
              placeholder="Nom du réseau (SSID) *"
              value={wifiData.ssid}
              onChange={(e) => onWifiChange({ ...wifiData, ssid: e.target.value })}
              className="h-12"
            />
            <ErrorMessage path={['ssid']} />
            <Select value={wifiData.encryption} onValueChange={(value: 'WPA' | 'WEP' | 'nopass') => onWifiChange({ ...wifiData, encryption: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Type de sécurité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">Aucun (réseau ouvert)</SelectItem>
              </SelectContent>
            </Select>
            {wifiData.encryption !== 'nopass' && (
              <Input
                type="password"
                placeholder="Mot de passe"
                value={wifiData.password}
                onChange={(e) => onWifiChange({ ...wifiData, password: e.target.value })}
              />
            )}
            <div className="flex items-center gap-3">
              <Switch id="hidden-network" checked={wifiData.hidden} onCheckedChange={(checked) => onWifiChange({ ...wifiData, hidden: checked })} />
              <Label htmlFor="hidden-network" className="text-sm">Réseau masqué</Label>
            </div>
          </div>
        )}
        {type === 'vcard' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input placeholder="Prénom *" value={vcardData.firstName} onChange={(e) => onVCardChange({ ...vcardData, firstName: e.target.value })} />
                <ErrorMessage path={['firstName']} />
              </div>
              <div>
                <Input placeholder="Nom *" value={vcardData.lastName} onChange={(e) => onVCardChange({ ...vcardData, lastName: e.target.value })} />
                <ErrorMessage path={['lastName']} />
              </div>
            </div>
            <div>
              <Input type="email" placeholder="Email" value={vcardData.email} onChange={(e) => onVCardChange({ ...vcardData, email: e.target.value })} />
              <ErrorMessage path={['email']} />
            </div>
            <Input type="tel" placeholder="Téléphone" value={vcardData.phone} onChange={(e) => onVCardChange({ ...vcardData, phone: e.target.value })} />
            <Input placeholder="Entreprise" value={vcardData.company} onChange={(e) => onVCardChange({ ...vcardData, company: e.target.value })} />
            <Input placeholder="Fonction" value={vcardData.title} onChange={(e) => onVCardChange({ ...vcardData, title: e.target.value })} />
            <div>
              <Input type="url" placeholder="Site web" value={vcardData.website} onChange={(e) => onVCardChange({ ...vcardData, website: e.target.value })} />
              <ErrorMessage path={['website']} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
