// Page principale du générateur de QR Code

import { useRef, useEffect } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQRGenerator } from '@/hooks/useQRGenerator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QRTypeSelector } from '@/components/QRTypeSelector';
import { DataInputForm } from '@/components/DataInputForm';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { QRPreview } from '@/components/QRPreview';
import { QRHistory } from '@/components/QRHistory';
import { LoaderLogo } from '@/components/LoaderLogo';

const Index = () => {
  const qrPreviewRef = useRef<HTMLDivElement>(null);
  const {
    qrType,
    inputData,
    emailData,
    wifiData,
    vcardData,
    videoData,
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
    setWifiData,
    setVCardData,
    setVideoData,
    setSettings,
    generate,
    loadFromHistory,
    removeFromHistory,
    clearHistory,
    resetForm,
    validateInput,
  } = useQRGenerator();

  // Auto-scroll vers la preview du QR quand il est généré
  useEffect(() => {
    if (qrDataUrl && qrPreviewRef.current) {
      qrPreviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [qrDataUrl]);

  const getCurrentInputData = () => {
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
  };

  return (
    <div className="min-h-screen flex flex-col gradient-subtle">
      <Header totalCount={totalCount} />

        {/* Hero Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Créez des <span className="text-yellow-600">QR Codes</span> en quelques secondes
            </h2>
            <p className="text-lg text-muted-foreground">
              Générez, personnalisez et téléchargez des QR Codes professionnels gratuitement.
              URL, texte, Wi-Fi, contacts et plus encore.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="flex-1 pb-12 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-[1fr,400px] gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* Type Selector */}
                <div className="p-6 rounded-2xl bg-card border shadow-sm">
                  <QRTypeSelector
                    selectedType={qrType}
                    onTypeChange={(type) => {
                      setQRType(type);
                      resetForm();
                    }}
                  />
                </div>

                {/* Data Input */}
                <div className="p-6 rounded-2xl bg-card border shadow-sm">
                  <DataInputForm
                    type={qrType}
                    inputData={inputData}
                    emailData={emailData}
                    wifiData={wifiData}
                    vcardData={vcardData}
                    videoData={videoData}
                    onInputChange={setInputData}
                    onEmailChange={setEmailData}
                    onWifiChange={setWifiData}
                    onVCardChange={setVCardData}
                    onVideoChange={setVideoData}
                    validationErrors={validationErrors}
                  />

                  {/* Error Message */}
                  {error && (
                    <p className="mt-4 text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  {/* Generate Button */}
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={generate}
                      disabled={isGenerating}
                      className="flex-1 h-12 text-base gap-2 
                      bg-gradient-to-r from-blue-600 to-yellow-400 
                      hover:from-blue-700 hover:to-yellow-500 
                      text-white font-semibold 
                      transition-all duration-300 
                      shadow-md hover:shadow-lg"
                    >
                      {isGenerating ? (
                        <>
                          <LoaderLogo size={24} />
                          <span>Génération...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          <span>Générer le QR Code</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="h-12 px-4"
                      title="Réinitialiser"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Customization */}
                <div>
                  <CustomizationPanel
                    settings={settings}
                    onSettingsChange={setSettings}
                  />
                </div>

                {/* History */}
                <div>
                  <QRHistory
                    history={history}
                    onLoadItem={loadFromHistory}
                    onRemoveItem={removeFromHistory}
                    onClearHistory={clearHistory}
                  />
                </div>
              </div>

              {/* Right Column - Preview */}
              <div ref={qrPreviewRef} className="lg:sticky lg:top-24 lg:h-fit">
                <QRPreview
                  dataUrl={qrDataUrl}
                  isGenerating={isGenerating}
                  settings={settings}
                  qrType={qrType}
                  inputData={getCurrentInputData()}
                />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default Index;
