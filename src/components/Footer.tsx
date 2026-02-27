import { Heart, Github, FileText, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from '@formspree/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function ContactForm() {
  const [state, handleSubmit] = useForm("meelnbzw");

  if (state.succeeded) {
    return <p className="text-center text-green-600 font-medium">Merci pour votre message !</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom</Label>
        <Input id="name" type="text" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Adresse Email</Label>
        <Input id="email" type="email" name="email" required />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required />
      </div>
      <Button type="submit" disabled={state.submitting} className="w-full gap-2">
        {state.submitting ? 'Envoi en cours...' : 'Envoyer le message'}
        {!state.submitting && <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="py-8 px-4 border-t bg-muted/30">
      <div className="container mx-auto grid md:grid-cols-2 gap-8">
        {/* Section Contact */}
        <div>
          <h3 className="font-bold text-lg mb-4">Contactez-moi</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Une question, une suggestion ou un bug à signaler ? N'hésitez pas à m'envoyer un message.
          </p>
          <ContactForm />
        </div>

        {/* Section Infos */}
        <div className="flex flex-col items-start md:items-end">
          <div className="flex flex-col items-start md:items-end mb-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Créé Par Covanix <Heart className="h-4 w-4 text-destructive fill-destructive" />
            </p>
            <p className="text-xs text-muted-foreground/60 mt-4">
              © {new Date().getFullYear()} Mon QR . Tous droits réservés.
            </p>
          </div>
          <div className="flex items-center gap-6 mt-auto">
            <a
              href="https://github.com/Lejeune-2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link
              to="/mentions-legales"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Mentions Légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
