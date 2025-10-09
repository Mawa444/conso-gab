import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PrivacyPolicyPage = () => {
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
            <CardTitle className="text-3xl font-bold">Politique de Confidentialité</CardTitle>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p>
                ConsoGab ("nous", "notre", "l'Application") s'engage à protéger la vie privée de ses utilisateurs.
                Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons
                vos informations personnelles lorsque vous utilisez notre application mobile et nos services.
              </p>
              <p>
                En utilisant ConsoGab, vous acceptez les pratiques décrites dans cette politique de confidentialité.
                Si vous n'acceptez pas ces pratiques, veuillez ne pas utiliser notre Application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Informations Collectées</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Informations Fournies Directement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte utilisateur :</strong> Pseudo, prénom, nom, email, numéro de téléphone</li>
                <li><strong>Profil d'entreprise :</strong> Nom commercial, catégorie, description, informations de contact</li>
                <li><strong>Contenu généré :</strong> Catalogues, produits, messages, avis, photos</li>
                <li><strong>Informations de localisation :</strong> Adresse, province, département, coordonnées GPS (avec votre consentement)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Informations Collectées Automatiquement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Données de navigation :</strong> Pages visitées, durée, interactions</li>
                <li><strong>Données d'appareil :</strong> Type d'appareil, système d'exploitation, identifiants uniques</li>
                <li><strong>Données de géolocalisation :</strong> Position GPS en temps réel (uniquement avec autorisation explicite)</li>
                <li><strong>Cookies et technologies similaires :</strong> Pour améliorer l'expérience utilisateur</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Informations Provenant de Tiers</h3>
              <p>
                Si vous vous connectez via Google ou d'autres services tiers, nous recevons les informations
                de profil public que vous avez autorisées à partager.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Utilisation des Informations</h2>
              <p>Nous utilisons vos informations pour :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fournir, maintenir et améliorer nos services</li>
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Personnaliser votre expérience (recommandations basées sur la localisation)</li>
                <li>Faciliter les transactions entre utilisateurs et entreprises</li>
                <li>Envoyer des notifications importantes (messages, réservations, commandes)</li>
                <li>Analyser l'utilisation de l'Application pour améliorer nos services</li>
                <li>Détecter et prévenir les fraudes et abus</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Partage des Informations</h2>
              <p>Nous ne vendons jamais vos données personnelles. Nous partageons vos informations uniquement dans les cas suivants :</p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">4.1 Avec Votre Consentement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informations de profil public visibles par tous les utilisateurs (pseudo, photo, ville)</li>
                <li>Catalogues et produits publics visibles par tous</li>
                <li>Partage de localisation en temps réel (uniquement si vous l'autorisez explicitement)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.2 Avec les Entreprises</h3>
              <p>
                Lorsque vous contactez une entreprise, effectuez une réservation ou passez une commande,
                nous partageons les informations nécessaires à la transaction (nom, contact, adresse de livraison).
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.3 Avec Nos Prestataires de Services</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Supabase :</strong> Hébergement de la base de données et authentification</li>
                <li><strong>Services de cartographie :</strong> Pour afficher les cartes et itinéraires</li>
                <li><strong>Services de paiement :</strong> Pour traiter les transactions (si applicable)</li>
                <li><strong>Services d'analyse :</strong> Pour comprendre l'utilisation de l'Application</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.4 Pour Raisons Légales</h3>
              <p>
                Nous pouvons divulguer vos informations si requis par la loi, pour protéger nos droits,
                prévenir la fraude, ou assurer la sécurité de nos utilisateurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Géolocalisation</h2>
              <p>
                ConsoGab utilise la géolocalisation pour vous recommander des entreprises et produits à proximité.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Permission :</strong> Nous demandons votre autorisation explicite avant d'accéder à votre position</li>
                <li><strong>Précision :</strong> Nous utilisons la position GPS uniquement quand l'Application est ouverte</li>
                <li><strong>Désactivation :</strong> Vous pouvez désactiver la géolocalisation à tout moment dans les paramètres de votre appareil</li>
                <li><strong>Conservation :</strong> Nous ne conservons pas l'historique de vos déplacements</li>
                <li><strong>Partage :</strong> Votre position exacte n'est jamais partagée publiquement (seule la ville est visible)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Sécurité des Données</h2>
              <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                <li>Chiffrement des données au repos</li>
                <li>Authentification sécurisée avec mots de passe hachés</li>
                <li>Contrôles d'accès stricts (Row Level Security)</li>
                <li>Audits de sécurité réguliers</li>
                <li>Surveillance des accès non autorisés</li>
              </ul>
              <p className="mt-4">
                Cependant, aucun système n'est 100% sécurisé. Nous vous recommandons de choisir un mot de passe fort
                et de ne jamais le partager.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Conservation des Données</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte actif :</strong> Tant que votre compte est actif</li>
                <li><strong>Après suppression :</strong> 30 jours de rétention pour récupération éventuelle, puis suppression définitive</li>
                <li><strong>Données anonymisées :</strong> Conservées pour analyses statistiques (sans lien avec votre identité)</li>
                <li><strong>Obligations légales :</strong> Certaines données peuvent être conservées plus longtemps si requis par la loi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Vos Droits</h2>
              <p>Conformément aux lois sur la protection des données, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger les données inexactes ou incomplètes</li>
                <li><strong>Droit de suppression :</strong> Supprimer votre compte et vos données</li>
                <li><strong>Droit d'opposition :</strong> S'opposer au traitement de vos données pour des raisons spécifiques</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit de limitation :</strong> Restreindre le traitement de vos données dans certains cas</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <strong>privacy@consogab.ga</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Données des Mineurs</h2>
              <p>
                ConsoGab est destiné aux personnes âgées de 13 ans et plus. Nous ne collectons pas sciemment
                d'informations personnelles auprès d'enfants de moins de 13 ans. Si vous êtes parent et découvrez
                que votre enfant nous a fourni des informations, contactez-nous pour suppression.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Transferts Internationaux</h2>
              <p>
                Vos données peuvent être transférées et traitées dans des pays autres que le Gabon, notamment
                pour l'hébergement chez nos prestataires. Nous nous assurons que ces transferts respectent les
                normes de protection des données applicables.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Modifications de Cette Politique</h2>
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité. Nous vous informerons des changements
                importants via l'Application ou par email. La date de "Dernière mise à jour" en haut de cette page
                indique quand la politique a été modifiée pour la dernière fois.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
              <p>Pour toute question concernant cette politique de confidentialité, contactez-nous :</p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Email :</strong> privacy@consogab.ga</li>
                <li><strong>Support :</strong> support@consogab.ga</li>
                <li><strong>Adresse :</strong> Libreville, Gabon</li>
              </ul>
            </section>

            <section className="bg-muted p-4 rounded-lg mt-8">
              <p className="text-sm font-semibold mb-2">Consentement</p>
              <p className="text-sm">
                En utilisant ConsoGab, vous reconnaissez avoir lu et compris cette Politique de Confidentialité
                et vous consentez à la collecte, l'utilisation et le partage de vos informations comme décrit ci-dessus.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
