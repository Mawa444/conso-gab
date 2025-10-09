import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TermsOfServicePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Conditions Générales d'Utilisation</CardTitle>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptation des Conditions</h2>
              <p>
                Bienvenue sur ConsoGab ! En accédant et en utilisant cette application mobile ("l'Application"),
                vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation ("CGU").
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application.
              </p>
              <p>
                Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications prendront effet
                dès leur publication. Votre utilisation continue de l'Application après les modifications constitue
                votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description du Service</h2>
              <p>
                ConsoGab est une plateforme mobile qui connecte les consommateurs et les entreprises au Gabon.
                L'Application permet :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Aux <strong>consommateurs</strong> de découvrir des entreprises locales, consulter des catalogues de produits/services,
                    effectuer des réservations, passer des commandes, et communiquer avec les entreprises</li>
                <li>Aux <strong>entreprises</strong> de créer des profils, publier des catalogues, gérer des commandes et réservations,
                    et communiquer avec leurs clients</li>
                <li>La géolocalisation pour recommander des entreprises à proximité</li>
                <li>Un système de messagerie pour faciliter la communication</li>
                <li>Des fonctionnalités de scan QR pour accéder rapidement aux informations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Inscription et Compte</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Création de Compte</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vous devez avoir au moins 13 ans pour utiliser l'Application</li>
                <li>Vous devez fournir des informations exactes et complètes lors de l'inscription</li>
                <li>Vous êtes responsable de la sécurité de votre mot de passe</li>
                <li>Vous ne pouvez créer qu'un seul compte par personne</li>
                <li>Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Types de Comptes</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte Consommateur :</strong> Pour découvrir et interagir avec les entreprises</li>
                <li><strong>Compte Entreprise :</strong> Pour gérer un ou plusieurs profils d'entreprise</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">3.3 Suspension et Résiliation</h3>
              <p>
                Nous nous réservons le droit de suspendre ou résilier votre compte à tout moment, sans préavis,
                si vous violez ces CGU ou si nous estimons que votre compte compromet la sécurité ou l'intégrité
                de l'Application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Utilisation Acceptable</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Vous Acceptez de NE PAS :</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Utiliser l'Application à des fins illégales ou frauduleuses</li>
                <li>Publier du contenu offensant, diffamatoire, obscène, ou discriminatoire</li>
                <li>Usurper l'identité d'une autre personne ou entité</li>
                <li>Transmettre des virus, malwares, ou tout code malveillant</li>
                <li>Collecter des données d'autres utilisateurs sans leur consentement</li>
                <li>Interférer avec le fonctionnement de l'Application</li>
                <li>Contourner les mesures de sécurité de l'Application</li>
                <li>Utiliser des robots, scrapers, ou outils automatisés non autorisés</li>
                <li>Créer de faux comptes ou fausses entreprises</li>
                <li>Spammer ou harceler d'autres utilisateurs</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.2 Contenu Interdit</h3>
              <p>Il est strictement interdit de publier du contenu qui :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Viole les droits d'autrui (propriété intellectuelle, vie privée, etc.)</li>
                <li>Promeut la violence, le terrorisme, ou la haine</li>
                <li>Contient de la pornographie ou de l'exploitation sexuelle</li>
                <li>Fait la promotion de produits illégaux ou dangereux</li>
                <li>Est faux ou trompeur (fausse publicité, arnaques)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Contenu Utilisateur</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">5.1 Propriété</h3>
              <p>
                Vous conservez tous les droits sur le contenu que vous publiez (textes, photos, vidéos, catalogues).
                Cependant, en publiant du contenu sur l'Application, vous nous accordez une licence mondiale,
                non exclusive, libre de redevances, pour utiliser, reproduire, modifier, adapter, publier, traduire,
                et distribuer ce contenu dans le cadre de nos services.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">5.2 Responsabilité</h3>
              <p>
                Vous êtes seul responsable du contenu que vous publiez. Nous ne sommes pas responsables du contenu
                des utilisateurs. Nous nous réservons le droit de supprimer tout contenu qui viole ces CGU,
                sans notification préalable.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">5.3 Modération</h3>
              <p>
                Nous pouvons (mais ne sommes pas obligés de) modérer le contenu des utilisateurs.
                Vous pouvez signaler du contenu inapproprié via les outils de signalement de l'Application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Transactions et Paiements</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">6.1 Rôle de ConsoGab</h3>
              <p>
                ConsoGab est une plateforme de mise en relation. Nous ne sommes PAS partie aux transactions
                entre consommateurs et entreprises. Nous ne sommes pas responsables de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La qualité, la sécurité, ou la légalité des produits/services offerts</li>
                <li>La véracité ou l'exactitude des informations fournies par les entreprises</li>
                <li>La capacité des entreprises à fournir les produits/services annoncés</li>
                <li>Les litiges entre consommateurs et entreprises</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">6.2 Paiements</h3>
              <p>
                Si l'Application intègre des fonctionnalités de paiement :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Les paiements sont traités par des prestataires tiers sécurisés</li>
                <li>Nous ne stockons jamais vos informations de carte bancaire complètes</li>
                <li>Toutes les transactions sont régies par les conditions du prestataire de paiement</li>
                <li>Les remboursements sont à la discrétion de l'entreprise vendeuse</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">6.3 Prix et Disponibilité</h3>
              <p>
                Les prix affichés sont fixés par les entreprises et peuvent changer sans préavis.
                ConsoGab ne garantit pas la disponibilité des produits/services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Propriété Intellectuelle</h2>
              <p>
                L'Application, incluant son code source, design, logo, marques, et contenu original,
                est la propriété exclusive de ConsoGab et est protégée par les lois sur la propriété intellectuelle.
              </p>
              <p>
                Vous ne pouvez pas :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Copier, modifier, ou créer des œuvres dérivées de l'Application</li>
                <li>Utiliser nos marques ou logos sans autorisation écrite</li>
                <li>Désassembler, décompiler, ou faire de l'ingénierie inverse de l'Application</li>
                <li>Extraire le code source de l'Application</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation de Responsabilité</h2>
              <p>
                L'APPLICATION EST FOURNIE "EN L'ÉTAT" SANS GARANTIE D'AUCUNE SORTE.
                DANS LA MESURE MAXIMALE PERMISE PAR LA LOI :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nous ne garantissons pas que l'Application sera toujours disponible, sécurisée, ou sans erreur</li>
                <li>Nous ne sommes pas responsables des pertes de données, profits, ou dommages indirects</li>
                <li>Nous ne sommes pas responsables du comportement des utilisateurs ou des entreprises</li>
                <li>Nous ne sommes pas responsables des transactions entre utilisateurs</li>
                <li>Notre responsabilité totale envers vous ne peut excéder 100 000 FCFA</li>
              </ul>
              <p className="mt-4">
                Certaines juridictions ne permettent pas l'exclusion de certaines garanties ou responsabilités.
                Dans ce cas, ces limitations s'appliqueront dans la mesure maximale permise par la loi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Indemnisation</h2>
              <p>
                Vous acceptez d'indemniser et de dégager ConsoGab, ses dirigeants, employés, et partenaires
                de toute réclamation, perte, dommage, responsabilité, ou dépense (incluant les frais juridiques)
                découlant de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Votre utilisation de l'Application</li>
                <li>Votre violation de ces CGU</li>
                <li>Votre violation des droits de tiers</li>
                <li>Votre contenu publié sur l'Application</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Données Personnelles</h2>
              <p>
                Notre collecte et utilisation de vos données personnelles sont régies par notre
                <Button 
                  variant="link" 
                  className="inline p-0 h-auto font-semibold"
                  onClick={() => navigate('/legal/privacy')}
                >
                  Politique de Confidentialité
                </Button>.
                En utilisant l'Application, vous consentez également à cette politique.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Résiliation</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">11.1 Par Vous</h3>
              <p>
                Vous pouvez supprimer votre compte à tout moment via les paramètres de l'Application.
                La suppression est définitive après 30 jours.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">11.2 Par Nous</h3>
              <p>
                Nous pouvons suspendre ou résilier votre compte immédiatement, sans préavis, si :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vous violez ces CGU</li>
                <li>Votre compte est impliqué dans des activités frauduleuses ou illégales</li>
                <li>Nous recevons une injonction légale</li>
                <li>Nous cessons de fournir le service</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">11.3 Effets de la Résiliation</h3>
              <p>
                Après la résiliation, vous perdez l'accès à votre compte et à votre contenu.
                Les dispositions qui, de par leur nature, doivent survivre (propriété intellectuelle,
                limitation de responsabilité, indemnisation) restent en vigueur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Modifications de l'Application</h2>
              <p>
                Nous nous réservons le droit de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modifier ou interrompre l'Application à tout moment</li>
                <li>Ajouter ou retirer des fonctionnalités</li>
                <li>Limiter l'accès à certaines parties de l'Application</li>
                <li>Cesser définitivement le service avec un préavis raisonnable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Loi Applicable et Juridiction</h2>
              <p>
                Ces CGU sont régies par les lois du Gabon. Tout litige découlant de ces CGU ou de l'utilisation
                de l'Application sera soumis à la juridiction exclusive des tribunaux de Libreville, Gabon.
              </p>
              <p className="mt-4">
                Avant d'engager une action en justice, vous acceptez de tenter de résoudre tout litige
                à l'amiable en nous contactant à : legal@consogab.ga
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Dispositions Générales</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">14.1 Intégralité de l'Accord</h3>
              <p>
                Ces CGU constituent l'intégralité de l'accord entre vous et ConsoGab concernant l'utilisation
                de l'Application.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">14.2 Divisibilité</h3>
              <p>
                Si une disposition de ces CGU est jugée invalide ou inapplicable, les autres dispositions
                restent en vigueur.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">14.3 Non-Renonciation</h3>
              <p>
                Notre non-exercice d'un droit prévu par ces CGU ne constitue pas une renonciation à ce droit.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">14.4 Cession</h3>
              <p>
                Vous ne pouvez pas céder vos droits en vertu de ces CGU. Nous pouvons céder nos droits
                à tout moment à une société affiliée ou en cas de fusion/acquisition.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">15. Contact</h2>
              <p>Pour toute question concernant ces CGU, contactez-nous :</p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Email :</strong> legal@consogab.ga</li>
                <li><strong>Support :</strong> support@consogab.ga</li>
                <li><strong>Adresse :</strong> Libreville, Gabon</li>
              </ul>
            </section>

            <section className="bg-muted p-4 rounded-lg mt-8">
              <p className="text-sm font-semibold mb-2">Acceptation</p>
              <p className="text-sm">
                En créant un compte ou en utilisant ConsoGab, vous reconnaissez avoir lu, compris,
                et accepté ces Conditions Générales d'Utilisation.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
