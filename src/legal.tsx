import { useEffect, type ReactNode } from "react";
import { Flame } from "lucide-react";

const SITE = "https://ang.mobeaucompany.com";
const MISSING = "[À compléter par l’entreprise]";

export const publicPages: Record<string, { title: string; description: string }> = {
  "/": { title: "ANG Thermique — Plombier chauffagiste en Île-de-France", description: "Plomberie, chauffage et pompe à chaleur en Île-de-France : installation, entretien et dépannage par ANG Thermique." },
  "/mentions-legales": { title: "Mentions légales — ANG Thermique", description: "Mentions légales du site ANG Thermique." },
  "/confidentialite": { title: "Politique de confidentialité — ANG Thermique", description: "Comment ANG Thermique traite les données personnelles sur ce site." },
  "/cgu": { title: "Conditions générales d’utilisation — ANG Thermique", description: "Conditions d’utilisation du site ANG Thermique." },
};

export function useHead(path: string, fallback?: { title: string; description: string }, index = true) {
  useEffect(() => {
    const p = publicPages[path] || fallback;
    if (!p) return;
    document.title = p.title;
    const set = (sel: string, attr: string, val: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(sel) as HTMLElement | null;
      if (!el) { el = create(); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', "content", p.description, () => Object.assign(document.createElement("meta"), { name: "description" }));
    set('meta[property="og:title"]', "content", p.title, () => { const m = document.createElement("meta"); m.setAttribute("property", "og:title"); return m; });
    set('meta[name="robots"]', "content", index ? "noindex,nofollow" : "noindex,nofollow", () => Object.assign(document.createElement("meta"), { name: "robots" }));
    const canon = document.head.querySelector('link[rel="canonical"]');
    if (publicPages[path]) set('link[rel="canonical"]', "href", SITE + path, () => Object.assign(document.createElement("link"), { rel: "canonical" }));
    else canon?.remove();
  }, [path]);
}

export function LegalFooter() {
  return (
    <footer className="landing-footer">
      <span><Flame size={15} /> ANG Thermique · Île-de-France</span>
      <span className="legal-links">
        <a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Confidentialité</a> · <a href="/cgu">CGU</a> · Imaginé par <b>Mobeau</b> · <a href="/dashboard">Accès professionnel</a>
      </span>
    </footer>
  );
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="landing">
      <header className="landing-header">
        <a className="landing-logo" href="/"><span><Flame /></span><strong>ANG<span>THERMIQUE</span></strong></a>
      </header>
      <main className="legal">
        <h1>{title}</h1>
        {children}
        <p><a className="landing-primary" href="/">Retour à l’accueil</a></p>
      </main>
      <LegalFooter />
    </div>
  );
}

const Draft = () => <p className="legal-note">Document provisoire : les informations marquées « {MISSING} » doivent être fournies par l’entreprise. Ce texte n’a pas fait l’objet d’une validation juridique.</p>;

export function LegalPage({ path }: { path: string }) {
  useHead(path);
  if (path === "/mentions-legales") return (
    <Shell title="Mentions légales">
      <Draft />
      <h2>Éditeur du site</h2>
      <p>ANG Thermique — plomberie, chauffage, pompe à chaleur, Île-de-France.<br />Téléphone : +33 6 68 41 58 73<br />Raison sociale et forme juridique : {MISSING}<br />Adresse du siège : {MISSING}<br />SIRET / RCS : {MISSING}<br />N° TVA intracommunautaire : {MISSING}<br />Directeur de la publication : {MISSING}<br />Email de contact : {MISSING}</p>
      <h2>Conception</h2>
      <p>Site imaginé et réalisé par Mobeau. Coordonnées légales de Mobeau : {MISSING}</p>
      <h2>Hébergement</h2>
      <p>Site hébergé via la plateforme Lovable. Raison sociale, adresse et téléphone de l’hébergeur : {MISSING}</p>
      <h2>Assurance professionnelle</h2>
      <p>Garantie décennale mentionnée sur le site. Assureur, numéro de contrat et couverture géographique : {MISSING}</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les contenus et visuels du site sont la propriété de leurs auteurs respectifs et ne peuvent être reproduits sans autorisation.</p>
    </Shell>
  );
  if (path === "/confidentialite") return (
    <Shell title="Politique de confidentialité">
      <Draft />
      <h2>Responsable du traitement</h2>
      <p>ANG Thermique — identité complète et contact dédié aux données personnelles : {MISSING}</p>
      <h2>Données traitées</h2>
      <p>La page publique ne comporte aucun formulaire : aucune donnée n’est collectée par ce site sur la page d’accueil. Si vous appelez le numéro affiché, les échanges relèvent de la relation commerciale directe avec l’entreprise.</p>
      <p>L’espace professionnel est une démonstration : les dossiers saisis restent dans le stockage local de votre navigateur et ne sont envoyés à aucun serveur. Vous pouvez les effacer en vidant les données du site dans votre navigateur.</p>
      <h2>Cookies et traceurs</h2>
      <p>Ce site n’utilise ni cookie publicitaire, ni outil de mesure d’audience. Seul un stockage local strictement nécessaire au fonctionnement de la démonstration est utilisé, ce qui ne requiert pas de consentement. Les polices de caractères sont chargées depuis Google Fonts, ce qui transmet votre adresse IP à Google.</p>
      <h2>Durées de conservation</h2>
      <p>Données de la démonstration : jusqu’à leur suppression par vous dans votre navigateur. Données liées à la relation client (devis, factures) : {MISSING}</p>
      <h2>Vos droits</h2>
      <p>Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité. Pour les exercer : {MISSING}. Vous pouvez aussi saisir la CNIL (www.cnil.fr).</p>
    </Shell>
  );
  return (
    <Shell title="Conditions générales d’utilisation">
      <Draft />
      <h2>Objet</h2>
      <p>Ce site présente les services d’ANG Thermique et propose une démonstration d’espace professionnel. Son utilisation implique l’acceptation des présentes conditions.</p>
      <h2>Démonstration</h2>
      <p>L’espace professionnel est fictif : aucun devis, accord ou paiement n’y a de valeur contractuelle et aucun encaissement réel n’est effectué. Les conditions générales de vente des prestations d’ANG Thermique sont : {MISSING}</p>
      <h2>Responsabilité</h2>
      <p>Les informations sont fournies à titre indicatif. L’éditeur s’efforce d’assurer leur exactitude sans pouvoir la garantir.</p>
      <h2>Droit applicable</h2>
      <p>Droit français. Médiateur de la consommation : {MISSING}</p>
    </Shell>
  );
}

export function NotFound() {
  useHead("/404", { title: "Page introuvable — ANG Thermique", description: "Cette page n’existe pas." });
  return (
    <Shell title="Page introuvable">
      <p>La page demandée n’existe pas ou a été déplacée.</p>
    </Shell>
  );
}
