import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export const TermsDialog = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85dvh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg">Conditions Générales d'Utilisation</DialogTitle>
          <p className="text-xs text-muted-foreground">Dernière mise à jour : janvier 2026</p>
        </DialogHeader>
        <ScrollArea className="h-[65dvh] px-4 pb-4">
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pr-2">
            <section>
              <h3 className="font-semibold text-foreground mb-1">1. Acceptation</h3>
              <p>En accédant et en utilisant ConsoGab, vous acceptez d'être lié par les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">2. Description du Service</h3>
              <p>ConsoGab connecte consommateurs et entreprises au Gabon : découverte de commerces, catalogues produits/services, réservations, commandes, messagerie et géolocalisation.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">3. Inscription et Compte</h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>Âge minimum : 13 ans</li>
                <li>Informations exactes et complètes requises</li>
                <li>Vous êtes responsable de la sécurité de votre mot de passe</li>
                <li>Un seul compte par personne</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">4. Types de Comptes</h3>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Consommateur :</strong> Découvrir et interagir avec les entreprises</li>
                <li><strong>Entreprise :</strong> Gérer un ou plusieurs profils d'entreprise</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">5. Utilisation Acceptable</h3>
              <p>Il est interdit d'utiliser l'application à des fins illégales, de publier du contenu offensant, d'usurper une identité, de transmettre des virus, ou de collecter des données sans consentement.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">6. Contenu Utilisateur</h3>
              <p>Vous conservez vos droits sur votre contenu. En publiant, vous accordez à ConsoGab une licence non exclusive pour l'utiliser dans le cadre du service. Vous êtes seul responsable de votre contenu.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">7. Transactions</h3>
              <p>ConsoGab est une plateforme de mise en relation. Nous ne sommes pas partie aux transactions entre consommateurs et entreprises et ne garantissons pas la qualité des produits/services.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">8. Propriété Intellectuelle</h3>
              <p>L'application, son code, design, logo et contenu sont la propriété exclusive de ConsoGab, protégés par les lois sur la propriété intellectuelle.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">9. Limitation de Responsabilité</h3>
              <p>L'application est fournie "en l'état". Nous ne garantissons pas sa disponibilité permanente ni son absence d'erreurs. Notre responsabilité totale ne peut excéder 100 000 FCFA.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">10. Données Personnelles</h3>
              <p>La collecte et l'utilisation de vos données sont régies par notre Politique de Confidentialité. La géolocalisation est utilisée pour recommander des commerces à proximité.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">11. Résiliation</h3>
              <p>Vous pouvez supprimer votre compte à tout moment. Nous pouvons suspendre votre compte en cas de violation des CGU.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">12. Loi Applicable</h3>
              <p>Ces CGU sont régies par les lois du Gabon. Tout litige sera soumis aux tribunaux de Libreville.</p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-1">13. Contact</h3>
              <p>Email : legal@consogab.ga • Support : support@consogab.ga • Adresse : Libreville, Gabon</p>
            </section>

            <section className="bg-muted p-3 rounded-lg">
              <p className="text-xs">En créant un compte ou en utilisant ConsoGab, vous reconnaissez avoir lu, compris et accepté ces Conditions Générales d'Utilisation.</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
