// Page des Mentions Légales

import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function LegalNotice() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header totalCount={0} />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Bouton retour */}
          <Link to="/" className="inline-block mb-8">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>

          {/* Contenu des mentions légales */}
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Identification du site</h2>
              <p>
                <strong>Nom du site:</strong> MON QR CODE<br />
                <strong>Type de site:</strong> Générateur de codes QR<br />
                <strong>URL:</strong> <a href="www.linkedin.com/in/moussa-gbamou-72443b308">Mon LinKedIn</a> <br />
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Propriétaire et responsable</h2>
              <p>
                <strong>Propriétaire:</strong> Covanix<br />
                <strong>Email:</strong> moussagbamou6@gmail.com<br />
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Droits d'auteur</h2>
              <p>
                Le contenu de ce site, incluant mais sans s'y limiter les textes, les images, et 
                les logos, est la propriété exclusive de Covanix ou est utilisé avec permission. 
                Toute reproduction ou distribution sans autorisation écrite est interdite.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Conditions d'utilisation</h2>
              <p>
                L'utilisation de ce site est gratuite et réservée à des fins personnelles et non commerciales. 
                Les utilisateurs s'engagent à ne pas utiliser ce site pour:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Générer des codes QR frauduleux ou malveillants</li>
                <li>Violer les droits de propriété intellectuelle d'autrui</li>
                <li>Transmettre des données sensibles ou confidentielles</li>
                <li>Créer du contenu offensant ou illégal</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Données personnelles</h2>
              <p>
                Ce site ne collecte pas volontairement de données personnelles. Cependant, votre navigateur 
                peut stocker localement vos préférences de thème et votre historique de codes QR générés 
                pour améliorer votre expérience utilisateur.
              </p>
              <p className="mt-4">
                Ces données sont stockées localement sur votre appareil via le localStorage et ne sont 
                jamais envoyées à nos serveurs.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Responsabilité</h2>
              <p>
                Covanix ne peut être tenu responsable des dommages directs ou indirects résultant de 
                l'utilisation ou de l'impossibilité d'utiliser ce site. L'utilisateur assume tous les risques 
                liés à l'utilisation des codes QR générés.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Limitations de responsabilité</h2>
              <p>
                Le site est fourni "tel quel" sans garantie d'aucune sorte. Covanix ne garantit pas que:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Le site sera disponible 24h/24 et 7j/7</li>
                <li>Le fonctionnement du site sera sans erreurs</li>
                <li>Les codes QR générés seront toujours accessibles</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Cookies</h2>
              <p>
                Ce site utilise les fonctionnalités de stockage local du navigateur (localStorage) 
                pour améliorer votre expérience. Aucun cookie tiers n'est utilisé.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Liens externes</h2>
              <p>
                Ce site peut contenir des liens vers d'autres sites. Covanix n'est pas responsable du contenu 
                de ces sites externes et décline toute responsabilité pour les dommages qui en découleraient.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Modifications</h2>
              <p>
                Covanix se réserve le droit de modifier ces mentions légales à tout moment. 
                Les modifications prendront effet immédiatement après leur publication.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Droit applicable</h2>
              <p>
                Ces mentions légales sont régies par la loi française. 
                Tout litige sera soumis à la juridiction compétente française.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Contact</h2>
              <p>
                Pour toute question concernant ces mentions légales, veuillez nous contacter à:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> <a href="mailto:moussagbamou6@gmail.com">moussagbamou6@gmail.com</a> 
              </p>
            </section>
          </article>

          {/* Date de dernière mise à jour */}
          <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
