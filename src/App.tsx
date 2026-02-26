import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LegalNotice from "./pages/LegalNotice";
import Studio from "./pages/Studio";

const queryClient = new QueryClient();

const Preloader = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500">
    <div className="flex flex-col items-center gap-4">
      <div className="p-6 rounded-2xl gradient-primary shadow-glow animate-spin-slow">
        <QrCode className="h-20 w-20 text-primary-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground animate-pulse">Chargement...</h2>
    </div>
  </div>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement minimum pour voir l'animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter
          basename="/mon-qr-code/"
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
