import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
  Flame,
  LayoutDashboard,
  FolderOpen,
  FileText,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Search,
  Bell,
  X,
  Download,
  Check,
  Mail,
  MessageCircle,
  CalendarDays,
  Droplets,
  Wrench,
  Wind,
  ChevronRight,
  Menu,
  Trash2,
  Pencil,
  Upload,
  RotateCcw,
  Copy,
} from "lucide-react";
import {
  type Job,
  services,
  statuses,
  seeds,
  total,
  money,
  schedule,
  validJob,
  mentions,
  photo,
} from "./model";
import { quotePdf } from "./quote";
const key = "ang-thermique-demo-v1";
const tabs = [
  "Vue d’ensemble",
  "Dossiers clients",
  "Devis & signatures",
  "Paiements",
];
const icons = [LayoutDashboard, FolderOpen, FileText, Wallet];
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon" aria-label="Fermer" onClick={close}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return Array.isArray(v) && v.every(validJob) ? v : seeds();
    } catch {
      return seeds();
    }
  });
  const [tab, setTab] = useState(0),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Tous"),
    [mobile, setMobile] = useState(false),
    [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string | null>(null),
    [draft, setDraft] = useState<Job | null>(null),
    [newOpen, setNewOpen] = useState(false),
    [reminders, setReminders] = useState(false),
    [accepted, setAccepted] = useState(false),
    [sharing, setSharing] = useState(false),
    [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw"),
    [signatureName, setSignatureName] = useState(""),
    [checkoutId, setCheckoutId] = useState(() => new URLSearchParams(window.location.search).get("paiement")),
    [checkoutDone, setCheckoutDone] = useState(false);
  const signatureCanvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const active = jobs.find((j) => j.id === selected);
  const checkoutJob = jobs.find((j) => j.id === checkoutId);
  function save(next: Job[]) {
    if (!next.every(validJob)) {
      setNotice("Vérifiez les montants et les champs du dossier.");
      return false;
    }
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setJobs(next);
      return true;
    } catch {
      setNotice("Stockage plein : réduisez les photos avant d’enregistrer.");
      return false;
    }
  }
  function update(j: Job) {
    return save(jobs.map((x) => (x.id === j.id ? j : x)));
  }
  function edit(j: Job) {
    setNotice("");
    setDraft(structuredClone(j));
    setSelected(null);
    setAccepted(false);
    setSignatureMode("draw");
    setSignatureName("");
  }
  function persistQuote() {
    if (!draft) return false;
    const old = jobs.find((j) => j.id === draft.id);
    if (
      old &&
      (old.paid > 0 || old.signed) &&
      JSON.stringify(old.lines) !== JSON.stringify(draft.lines)
    ) {
      setNotice("Le montant est verrouillé après accord ou règlement simulé.");
      return false;
    }
    const done = update({
      ...draft,
      status: draft.signed ? "Accord simulé" : "Devis préparé",
    });
    if (done) setNotice("Devis enregistré dans ce navigateur.");
    return done;
  }
  function startSignature(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = signatureCanvas.current;
    if (!canvas || draft?.signed) return;
    drawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * (canvas.width / rect.width), (e.clientY - rect.top) * (canvas.height / rect.height));
  }
  function drawSignature(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = signatureCanvas.current;
    const rect = canvas?.getBoundingClientRect();
    const ctx = canvas?.getContext("2d");
    if (!canvas || !rect || !ctx) return;
    ctx.lineTo((e.clientX - rect.left) * (canvas.width / rect.width), (e.clientY - rect.top) * (canvas.height / rect.height));
    ctx.stroke();
  }
  function finishSignature() {
    drawing.current = false;
  }
  function resetSignature() {
    const ctx = signatureCanvas.current?.getContext("2d");
    if (ctx && signatureCanvas.current) ctx.clearRect(0, 0, signatureCanvas.current.width, signatureCanvas.current.height);
    if (draft) setDraft({ ...draft, signatureData: undefined, signed: false, status: "Devis préparé" });
  }
  function saveDrawnSignature() {
    if (!draft || !signatureCanvas.current) return;
    const signatureData = signatureCanvas.current.toDataURL("image/png");
    if (signatureData.length < 1500) {
      setNotice("Dessinez la signature avant de la valider.");
      return;
    }
    setDraft({ ...draft, signatureData, signed: true, status: "Accord simulé" });
    setNotice("Signature dessinée enregistrée dans la démo.");
  }
  function uploadSignedQuote(file: File) {
    if (!draft || (!file.type.includes("pdf") && !file.type.startsWith("image/")) || file.size > 8_000_000) {
      setNotice("Importez un PDF ou une image signée de moins de 8 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const signedDocument = String(reader.result);
      setDraft({ ...draft, signedDocument, signed: true, status: "Accord simulé" });
      setSignatureName(file.name);
      setNotice("Document signé importé dans la démo.");
    };
    reader.readAsDataURL(file);
  }
  function generatePaymentLink() {
    if (!draft) return;
    const mode = draft.paymentMode ?? (draft.count === 1 ? "single" : "installments");
    setDraft({
      ...draft,
      paymentMode: mode,
      count: mode === "single" ? 1 : Math.max(3, draft.count),
      paymentLink: `${window.location.origin}/?paiement=${draft.id}`,
    });
    setNotice("Lien de paiement interne généré. Aucun paiement ne sera encaissé.");
  }
  function openCheckout(id: string) {
    window.history.pushState({}, "", `/?paiement=${id}`);
    setCheckoutDone(false);
    setCheckoutId(id);
  }
  function closeCheckout() {
    window.history.pushState({}, "", "/");
    setCheckoutId(null);
    setCheckoutDone(false);
  }
  function sharePaymentLink() {
    if (!draft?.paymentLink) return;
    const text = `Bonjour ${draft.name}, voici votre espace de paiement ANG Thermique pour votre projet : ${draft.paymentLink} (interface de démonstration).`;
    const digits = draft.phone.replace(/\D/g, "");
    const target = digits.length >= 8 ? `https://wa.me/${digits}` : "https://wa.me/";
    window.open(`${target}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
  function download(j: Job) {
    quotePdf(j).save(`devis-${j.id}.pdf`);
  }
  async function share(j: Job) {
    const file = new File([quotePdf(j).output("blob")], `devis-${j.id}.pdf`, {
      type: "application/pdf",
    });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Devis ANG Thermique",
          text: "Votre proposition ANG Thermique (démonstration).",
        });
      } catch (e) {
        if ((e as Error).name !== "AbortError")
          setNotice(
            "Partage indisponible. Téléchargez le PDF pour le joindre manuellement.",
          );
      }
    } else {
      download(j);
      setSharing(true);
    }
  }
  const shown = jobs.filter(
    (j) =>
      (filter === "Tous" || j.status === filter) &&
      [j.name, j.city, j.service, j.id]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pending = jobs
    .filter((j) => !j.signed)
    .reduce((s, j) => s + total(j.lines), 0);
  const paid = jobs.reduce(
    (s, j) =>
      s +
      schedule(total(j.lines), j.count)
        .slice(0, j.paid)
        .reduce((a, b) => a + b, 0),
    0,
  );
  return (
    <div className="app">
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            closeCheckout();
            setTab(0);
            setQuery("");
            setFilter("Tous");
            setMobile(false);
          }}
        >
          <span>
            <Flame />
          </span>
          <div>
            ANG<span>THERMIQUE</span>
          </div>
        </a>
        <div className="workspace">
          <div className="workspace-icon">A</div>
          <div>
            Mon entreprise<small>Espace professionnel</small>
          </div>
          <ChevronRight size={15} />
        </div>
        <div className="nav-label">PILOTER MON ACTIVITÉ</div>
        <nav>
          {tabs.map((t, i) => {
            const Icon = icons[i];
            return (
              <button
                key={t}
                className={tab === i ? "active" : ""}
                onClick={() => {
                  setTab(i);
                  setMobile(false);
                }}
              >
                <Icon size={19} />
                {t}
                {i === 1 && <b>{jobs.length}</b>}
              </button>
            );
          })}
          <button
            onClick={() => {
              setReminders(true);
              setMobile(false);
            }}
          >
            <Bell size={19} />
            Relances clients<span className="soon">Démo</span>
          </button>
        </nav>
        <div className="sidebar-card">
          <div className="spark">✧</div>
          <strong>
            Moins d’administratif.
            <br />
            Plus de chantiers.
          </strong>
          <p>Vos demandes, devis et règlements, au même endroit.</p>
          <button onClick={() => setNewOpen(true)}>
            Tester le parcours client <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="profile">
          <span className="avatar">AM</span>
          <div>
            Amadou<small>ANG Thermique</small>
          </div>
          <span className="online" />
        </div>
      </aside>
      <div className="main">
        <header>
          <button
            className="icon mobile-menu"
            aria-label="Ouvrir le menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Mon espace <ChevronRight size={13} />
            <strong>{tabs[tab]}</strong>
          </div>
          <div className="demo-pill">
            <span />
            Démonstration Mobeau
          </div>
          <button
            className="icon"
            aria-label="Voir les relances"
            onClick={() => setReminders(true)}
          >
            <Bell size={20} />
          </button>
          <span className="avatar small-avatar">AM</span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <span className="eyebrow">VOTRE ACTIVITÉ, EN TOUTE CLARTÉ</span>
              <h1>{tab === 0 ? "Bonjour Amadou 👋" : tabs[tab]}</h1>
              <p>
                {tab === 0
                  ? "Vos projets avancent. Gardez une longueur d’avance."
                  : "Du premier échange à la réalisation, chaque détail compte."}
              </p>
            </div>
            <button className="primary" onClick={() => setNewOpen(true)}>
              <Plus size={18} />
              Nouvelle demande
            </button>
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button
                className="icon"
                aria-label="Masquer le message"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          <div className="stats">
            {[
              [
                FolderOpen,
                "Dossiers à suivre",
                String(jobs.length),
                "Plomberie, chauffage & PAC",
              ],
              [
                FileText,
                "Devis en préparation",
                money(pending),
                "Volume indicatif à confirmer",
              ],
              [
                Check,
                "Accords simulés",
                String(jobs.filter((j) => j.signed).length),
                "Votre pipeline de projets",
              ],
              [
                Wallet,
                "Règlements simulés",
                money(paid),
                "Aucun encaissement réel",
              ],
            ].map(([Icon, label, value, sub], i) => {
              const C = Icon as typeof Wallet;
              return (
                <article key={String(label)}>
                  <div>
                    <span>{String(label)}</span>
                    <C size={18} />
                  </div>
                  <strong>{String(value)}</strong>
                  <small>
                    <span className={"stat-dot dot-" + i} />
                    {String(sub)}
                  </small>
                </article>
              );
            })}
          </div>
          {tab === 3 && (
            <section className="payment-spotlight">
              <div><span className="eyebrow">PARCOURS DE RÈGLEMENT</span><h2>Le client choisit son rythme.<br />Vous gardez le contrôle.</h2><p>Proposez un paiement en une fois ou un échéancier mensuel. Le lien ouvre une interface de paiement intégrée à votre espace, partageable par WhatsApp ou par email.</p></div>
              <div className="payment-steps"><div><span>01</span><strong>Choisir le montant</strong><small>Une fois ou échéances</small></div><div><span>02</span><strong>Générer le lien</strong><small>Interface intégrée au site</small></div><div><span>03</span><strong>Suivre les règlements</strong><small>Relances et historique</small></div></div>
              <p className="demo-note">Démonstration : aucun encaissement réel et aucun financement activé. Les conditions d’éligibilité, frais et reversement seront définis avec le prestataire.</p>
            </section>
          )}
          {tab === 0 && (
            <div className="hero">
              <div>
                <span className="eyebrow">PLOMBERIE · CHAUFFAGE · POMPE À CHALEUR</span>
                <h2>Plombier chauffagiste<br />en région Île-de-France</h2>
                <p>Votre satisfaction est notre priorité. ANG Thermique vous accompagne pour vos installations, dépannages et rénovations.</p>
                <div className="hero-actions"><button onClick={() => setNewOpen(true)}>Obtenir un devis <ArrowRight size={17} /></button><button className="hero-link" onClick={() => setTab(2)}>Espace devis <ArrowUpRight size={16} /></button></div>
                <div className="trust-row"><span><Check size={14} /> +500 clients</span><span><Check size={14} /> 10 ans d’expérience</span><span><Check size={14} /> 24h/24 · 6j/7</span></div>
              </div>
              <div className="hero-art">
                <div className="orb" />
                <div className="art-card">
                  <Flame size={30} />
                  <span>ANG THERMIQUE</span><strong>Des solutions fiables<br />pour votre confort.</strong>
                  <div className="service-chips"><span><Droplets /> Plomberie</span><span><Wind /> PAC</span><span><Wrench /> Chauffage</span></div>
                </div>
                <div className="floating">
                  <Check size={16} />
                  <span>
                    Artisan de confiance
                    <small>Qualigaz · Décennale</small>
                  </span>
                </div>
              </div>
            </div>
          )}
          {tab === 0 && <section className="vitrine-services"><div><span className="eyebrow">NOS PRINCIPALES PRESTATIONS</span><h2>Nous vous aidons à réaliser vos travaux.</h2></div><div className="service-grid"><article><Droplets /><strong>Plomberie</strong><p>Débouchage, sanitaires, recherche et réparation de fuites.</p></article><article><Wind /><strong>Pompe à chaleur</strong><p>Installation, entretien et dépannage air/air ou air/eau.</p></article><article><Flame /><strong>Chauffage</strong><p>Chaudières, radiateurs et interventions rapides.</p></article></div></section>}
          <div className="content-grid">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    {tab === 3
                      ? "Suivi des règlements"
                      : tab === 2
                        ? "Vos devis à faire avancer"
                        : "Vos derniers dossiers"}
                  </h2>
                  <p>Des exemples fictifs, prêts à être explorés.</p>
                </div>
                <span className="counter">{shown.length} dossiers</span>
              </div>
              <div className="filters">
                <label>
                  <Search size={17} />
                  <input
                    aria-label="Rechercher un dossier"
                    placeholder="Rechercher un client, une ville…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Filtrer par statut"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {["Tous", ...statuses].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="table-head">
                <span>CLIENT / PROJET</span>
                <span>STATUT</span>
                <span>MONTANT</span>
                <span />
              </div>
              {shown.map((j, i) => (
                <button
                  className="job-row"
                  key={j.id}
                  onClick={() => (tab === 2 ? edit(j) : setSelected(j.id))}
                >
                  <span className="client-cell">
                    <span className={"avatar pastel-" + (i % 3)}>
                      {j.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <strong>{j.name}</strong>
                      <small>
                        {j.service} · {j.city}
                      </small>
                    </span>
                  </span>
                  <span className={"badge badge-" + statuses.indexOf(j.status)}>
                    {tab === 3
                      ? `${j.paid}/${j.count} échéances simulées`
                      : j.status}
                  </span>
                  <strong className="amount">{money(total(j.lines))}</strong>
                  <ChevronRight size={17} />
                </button>
              ))}
              {shown.length === 0 && (
                <p className="empty">
                  Aucun dossier ne correspond à votre recherche.
                </p>
              )}
              <div className="panel-footer">
                <span>Informations fictives · sauvegarde sur cet appareil</span>
                <button
                  onClick={() => {
                    setQuery("");
                    setFilter("Tous");
                  }}
                >
                  Tout afficher <ArrowRight size={14} />
                </button>
              </div>
            </section>
            <aside className="right-column">
              <section className="panel next-actions">
                <span className="eyebrow">VOTRE PROCHAINE ÉTAPE</span>
                <h2>À vous de jouer.</h2>
                {jobs
                  .filter((j) => !j.signed)
                  .slice(0, 3)
                  .map((j, i) => (
                    <button key={j.id} onClick={() => edit(j)}>
                      <span className="step-number">0{i + 1}</span>
                      <span>
                        <strong>
                          {i === 0
                            ? "Préparer la proposition"
                            : "Reprendre le dossier"}
                        </strong>
                        <small>
                          {j.name} · {j.service}
                        </small>
                      </span>
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
              </section>
              <section className="finance-card">
                <span className="icon-tile">
                  <Wallet size={20} />
                </span>
                <h2>
                  Le projet avance.
                  <br />
                  Le paiement s’adapte.
                </h2>
                <p>
                  Explorez le règlement en plusieurs fois et le suivi des
                  échéances.
                </p>
                <button
                  onClick={() => {
                    setTab(3);
                    setSelected(jobs[0]?.id ?? null);
                  }}
                >
                  Découvrir les possibilités <ArrowRight size={16} />
                </button>
                <small>Simulation · conditions à valider</small>
              </section>
            </aside>
          </div>
          <footer>
            <span>
              <Flame size={14} /> ANG Thermique · Plomberie, chauffage & PAC
            </span>
            <span>
              Île-de-France · Imaginé par <b>Mobeau</b>
            </span>
          </footer>
          <p className="demo-note">
            Démo locale avec données fictives. Les messages nécessitent votre
            envoi manuel. Les paiements, accords et relances automatiques
            présentés ne sont pas des opérations réelles.
          </p>
        </main>
      </div>
      {active && (
        <Modal
          title={active.name + " · " + active.service}
          close={() => setSelected(null)}
        >
          <p className="muted">
            {active.id} · {active.city}
          </p>
          <p>{active.description}</p>
          <div className="field-grid">
            <label>
              Avancement
              <select
                value={active.status}
                onChange={(e) => update({ ...active, status: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Visite prévue
              <input
                type="date"
                value={active.date}
                onChange={(e) => update({ ...active, date: e.target.value })}
              />
            </label>
          </div>
          <label>
            Notes de suivi
            <textarea
              value={active.notes}
              maxLength={2000}
              onChange={(e) => update({ ...active, notes: e.target.value })}
            />
          </label>
          {active.photos.length > 0 && (
            <div className="photos">
              {active.photos.map((src, i) => (
                <img src={src} key={i} alt={"Photo du projet " + (i + 1)} />
              ))}
            </div>
          )}
          <button className="primary" onClick={() => edit(active)}>
            <FileText size={17} />
            Préparer le devis
          </button>
          <hr />
          <h3>Un règlement adapté au projet</h3>
          <p className="muted">
            Encaissement en une fois envisagé pour les dossiers éligibles, sous
            réserve de validation d’un prestataire et de ses frais. Sinon, un
            échéancier direct est organisé avec votre client. Aucun financement
            n’est accordé dans cette démo.
          </p>
          <label>
            Échéancier illustratif
            <select
              disabled={active.paid > 0 || active.signed}
              value={active.count}
              onChange={(e) =>
                update({ ...active, count: Number(e.target.value) })
              }
            >
              {[1, 3, 4, 6].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "En une fois" : n + " règlements mensuels"}
                </option>
              ))}
            </select>
          </label>
          <div className="schedule">
            {schedule(total(active.lines), active.count).map((p, i) => (
              <div key={i}>
                <span>{i === 0 ? "À la validation" : `Mois ${i}`}</span>
                <b>{money(p)}</b>
                <span className={i < active.paid ? "green" : "muted"}>
                  {i < active.paid ? "Réglé en simulation" : "À venir"}
                </span>
              </div>
            ))}
          </div>
          <div className="actions">
            <button
              className="primary"
              disabled={
                active.paid >= active.count || total(active.lines) === 0
              }
              onClick={() => {
                if (update({ ...active, paid: active.paid + 1 }))
                  setNotice("Échéance simulée. Aucun débit effectué.");
              }}
            >
              Simuler la prochaine échéance
            </button>
            <button className="secondary" onClick={() => setReminders(true)}>
              Aperçu des relances
            </button>
          </div>
        </Modal>
      )}
      {draft && (
        <Modal
          title="Préparer votre devis"
          close={() => {
            setDraft(null);
            setSharing(false);
          }}
        >
          <div className="quote-paper">
            <div className="quote-brand">
              <Flame />
              <strong>ANG THERMIQUE</strong>
              <span>DEVIS INDICATIF</span>
            </div>
            <p>
              {draft.id} · {draft.name} · {draft.city}
            </p>
            <h3>{draft.service}</h3>
            <p>{draft.description}</p>
            <small>
              Prix indicatifs de démonstration, TVA à confirmer avant émission
              définitive.
            </small>
            <div className="line-labels">
              PRESTATION / QUANTITÉ / PRIX UNITAIRE (€)
            </div>
            {draft.lines.map((l, i) => (
              <div className="quote-line" key={i}>
                <input
                  aria-label={"Prestation " + (i + 1)}
                  maxLength={300}
                  disabled={draft.paid > 0 || draft.signed}
                  value={l.label}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      lines: draft.lines.map((x, n) =>
                        n === i ? { ...x, label: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  aria-label={"Quantité " + (i + 1)}
                  type="number"
                  min="1"
                  max="1000"
                  disabled={draft.paid > 0 || draft.signed}
                  value={l.qty}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      lines: draft.lines.map((x, n) =>
                        n === i
                          ? {
                              ...x,
                              qty: Math.min(
                                1000,
                                Math.max(1, Math.round(Number(e.target.value))),
                              ),
                            }
                          : x,
                      ),
                    })
                  }
                />
                <input
                  aria-label={"Prix " + (i + 1)}
                  type="number"
                  min="0"
                  max="100000"
                  step="0.01"
                  disabled={draft.paid > 0 || draft.signed}
                  value={l.price / 100}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      lines: draft.lines.map((x, n) =>
                        n === i
                          ? {
                              ...x,
                              price: Math.min(
                                10000000,
                                Math.max(
                                  0,
                                  Math.round(Number(e.target.value) * 100),
                                ),
                              ),
                            }
                          : x,
                      ),
                    })
                  }
                />
                <button
                  className="icon"
                  disabled={
                    draft.lines.length === 1 || draft.paid > 0 || draft.signed
                  }
                  aria-label={"Supprimer la ligne " + (i + 1)}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      lines: draft.lines.filter((_, n) => n !== i),
                    })
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              className="text-button"
              disabled={
                draft.lines.length >= 30 || draft.paid > 0 || draft.signed
              }
              onClick={() =>
                setDraft({
                  ...draft,
                  lines: [
                    ...draft.lines,
                    { label: "Nouvelle prestation", qty: 1, price: 0 },
                  ],
                })
              }
            >
              <Plus size={15} />
              Ajouter une ligne
            </button>
            <div className="quote-total">
              Total indicatif <strong>{money(total(draft.lines))}</strong>
            </div>
            <label>
              Mentions personnalisées
              <textarea
                maxLength={3000}
                rows={4}
                value={draft.mentions}
                onChange={(e) =>
                  setDraft({ ...draft, mentions: e.target.value })
                }
              />
            </label>
            <p className="muted">
              {draft.count} règlement(s) :{" "}
              {schedule(Math.min(100000000, total(draft.lines)), draft.count)
                .map(money)
                .join(" / ")}
            </p>
            <div className="payment-choice">
              <div className="section-title"><Wallet size={17} /><strong>Choisir le règlement</strong><span>Interface de démonstration</span></div>
              <div className="choice-grid">
                <button className={draft.paymentMode === "single" ? "selected" : ""} type="button" onClick={() => setDraft({ ...draft, paymentMode: "single", count: 1, paymentLink: undefined })}>
                  <strong>En une fois</strong><small>{money(total(draft.lines))} · lien unique</small>
                </button>
                <button className={draft.paymentMode !== "single" ? "selected" : ""} type="button" onClick={() => setDraft({ ...draft, paymentMode: "installments", count: draft.count === 1 ? 3 : draft.count, paymentLink: undefined })}>
                  <strong>En plusieurs fois</strong><small>{draft.count === 1 ? 3 : draft.count} règlements mensuels</small>
                </button>
              </div>
              {draft.paymentMode !== "single" && <label>Nombre d’échéances<select value={draft.count} onChange={e => setDraft({ ...draft, count: Number(e.target.value) })}>{[3, 4, 6].map(n => <option key={n} value={n}>{n} échéances mensuelles</option>)}</select></label>}
              <div className="payment-schedule">{schedule(Math.min(100000000, total(draft.lines)), draft.count).map((amount, i) => <div key={i}><span>{i === 0 ? "À la validation" : `Mois ${i}`}</span><strong>{money(amount)}</strong></div>)}</div>
              <button className="primary" type="button" onClick={generatePaymentLink} disabled={total(draft.lines) === 0}><Wallet size={16} /> Générer le lien de paiement interne</button>
              {draft.paymentLink && <div className="generated-link"><code>{draft.paymentLink}</code><button className="secondary" type="button" onClick={() => openCheckout(draft.id)}><ArrowUpRight size={15} /> Ouvrir l’interface</button><button className="icon" type="button" aria-label="Copier le lien de paiement" onClick={() => navigator.clipboard?.writeText(draft.paymentLink ?? "")}><Copy size={15} /></button><button className="secondary" type="button" onClick={sharePaymentLink}><MessageCircle size={15} /> Préparer WhatsApp</button></div>}
              <small className="muted">Le lien reste sur le site ANG Thermique. Stripe sera connecté dans la version finale ; aucun débit réel n’est effectué dans cette démo.</small>
            </div>
          </div>
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
          <div className="actions">
            <button
              className="primary"
              disabled={!validJob(draft)}
              onClick={persistQuote}
            >
              <Check size={16} />
              Enregistrer le devis
            </button>
            <button
              className="secondary"
              disabled={!validJob(draft)}
              onClick={() => download(draft)}
            >
              <Download size={16} />
              Télécharger le PDF
            </button>
            <button
              className="secondary"
              disabled={!validJob(draft)}
              onClick={() => share(draft)}
            >
              <MessageCircle size={16} />
              Partager le PDF
            </button>
            <a
              className="secondary"
              href={
                "mailto:?subject=" +
                encodeURIComponent("Devis ANG Thermique " + draft.id) +
                "&body=" +
                encodeURIComponent(
                  "Bonjour, voici votre proposition ANG Thermique. Le PDF sera joint à cet email avant envoi.",
                )
              }
            >
              <Mail size={16} />
              Préparer un email
            </a>
          </div>
          <p className="muted">
            Email : téléchargez puis joignez le PDF. Partage mobile : choisissez
            WhatsApp dans la feuille de partage si disponible.
          </p>
          {sharing && (
            <div className="notice">
              PDF téléchargé. Joignez-le dans votre conversation avant
              d’envoyer.
              <a href="https://wa.me/" target="_blank" rel="noreferrer">
                Ouvrir WhatsApp ↗
              </a>
            </div>
          )}
          <details open={!draft.signed}>
            <summary>Faire signer le devis au client</summary>
            <p>Le client peut dessiner sa signature, importer un devis signé ou télécharger le PDF pour le signer hors ligne. Cette signature est simulée dans la démo.</p>
            <div className="signature-tabs"><button type="button" className={signatureMode === "draw" ? "active" : ""} onClick={() => setSignatureMode("draw")}><Pencil size={15} /> Dessiner</button><button type="button" className={signatureMode === "upload" ? "active" : ""} onClick={() => setSignatureMode("upload")}><Upload size={15} /> Importer un signé</button></div>
            {signatureMode === "draw" ? <div className="signature-box"><canvas ref={signatureCanvas} width={700} height={180} onPointerDown={startSignature} onPointerMove={drawSignature} onPointerUp={finishSignature} onPointerLeave={finishSignature} /><div><button className="secondary" type="button" onClick={resetSignature}><RotateCcw size={15} /> Effacer</button><button className="primary" type="button" disabled={draft.signed} onClick={saveDrawnSignature}><Check size={15} /> Valider la signature</button></div></div> : <label className="upload-signature"><Upload size={18} />Importer un PDF ou une image signée<input type="file" accept="application/pdf,image/jpeg,image/png" onChange={e => { const file = e.target.files?.[0]; if (file) uploadSignedQuote(file); }} />{signatureName && <small>{signatureName} importé</small>}</label>}
            {draft.signatureData && <p className="signed-status"><Check size={15} /> Signature dessinée enregistrée</p>}
            {draft.signedDocument && <p className="signed-status"><Check size={15} /> Document signé importé</p>}
            <label className="check"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />Je confirme que ce parcours est une simulation.</label>
            <button className="secondary" type="button" disabled={!accepted || !validJob(draft) || draft.signed} onClick={() => { const j = { ...draft, signed: true, status: "Accord simulé" }; if (update(j)) { setDraft(j); setNotice("Accord simulé enregistré."); } }}>Confirmer l’accord simulé</button>
          </details>
        </Modal>
      )}
      {checkoutJob && (
        <Modal title="Paiement ANG Thermique" close={closeCheckout}>
          {!checkoutDone ? (
            <div className="checkout-page">
              <div className="checkout-brand"><span><Flame size={19} /></span><strong>ANG THERMIQUE</strong><em>Démo sécurisée</em></div>
              <div className="checkout-summary">
                <div><small>Paiement pour</small><strong>{checkoutJob.name}</strong><span>{checkoutJob.service} · {checkoutJob.city}</span></div>
                <strong className="checkout-total">{money(total(checkoutJob.lines))}</strong>
              </div>
              <div className="checkout-options">
                <div className="checkout-option selected"><span className="radio-dot" /><div><strong>{checkoutJob.paymentMode === "single" || checkoutJob.count === 1 ? "Paiement en une fois" : `Paiement en ${checkoutJob.count} fois`}</strong><small>{checkoutJob.count === 1 ? money(total(checkoutJob.lines)) + " aujourd’hui" : `${money(schedule(total(checkoutJob.lines), checkoutJob.count)[0])} aujourd’hui puis chaque mois`}</small></div></div>
              </div>
              {checkoutJob.count > 1 && <div className="checkout-schedule">{schedule(total(checkoutJob.lines), checkoutJob.count).map((amount, i) => <div key={i}><span>{i === 0 ? "Aujourd’hui" : `Mois ${i}`}</span><strong>{money(amount)}</strong></div>)}</div>}
              <div className="checkout-card">
                <label>Numéro de carte<input inputMode="numeric" placeholder="4242 4242 4242 4242" maxLength={19} /></label>
                <div className="field-grid"><label>Expiration<input placeholder="MM / AA" maxLength={7} /></label><label>CVC<input placeholder="123" maxLength={4} /></label></div>
              </div>
              <div className="checkout-lock"><span>⌁</span><p>Simulation uniquement : aucune carte n’est vérifiée et aucun paiement n’est encaissé.</p></div>
              <button className="primary checkout-submit" type="button" onClick={() => { setCheckoutDone(true); update({ ...checkoutJob, paid: Math.min(checkoutJob.count, Math.max(1, checkoutJob.paid + 1)), status: "Accord simulé" }); }}>Simuler le paiement · {money(schedule(total(checkoutJob.lines), checkoutJob.count)[Math.min(checkoutJob.paid, checkoutJob.count - 1)] || total(checkoutJob.lines))}</button>
              <button className="text-button checkout-back" type="button" onClick={closeCheckout}>Retour au devis</button>
            </div>
          ) : (
            <div className="checkout-success"><div className="success-icon"><Check /></div><h3>Paiement simulé enregistré</h3><p>Le règlement a été ajouté au suivi du dossier de {checkoutJob.name}. Dans la version finale, cette étape sera reliée au prestataire de paiement.</p><button className="primary" type="button" onClick={closeCheckout}>Retour à l’espace ANG</button></div>
          )}
        </Modal>
      )}
      {newOpen && (
        <Request
          close={() => setNewOpen(false)}
          add={(j) => {
            if (save([j, ...jobs])) {
              setNewOpen(false);
              setSelected(j.id);
              setNotice("Nouvelle demande enregistrée sur cet appareil.");
            }
          }}
        />
      )}
      {reminders && (
        <Modal
          title="Relances clients · aperçu"
          close={() => setReminders(false)}
        >
          <span className="badge">Fonctionnement envisagé</span>
          <h3>Le bon rappel, au bon moment.</h3>
          <div className="reminder">
            <CalendarDays />
            <div>
              <b>Avant l’échéance</b>
              <p>Un rappel de la date et du montant à régler.</p>
            </div>
          </div>
          <div className="reminder">
            <MessageCircle />
            <div>
              <b>WhatsApp & email</b>
              <p>
                Bonjour, votre prochaine échéance ANG Thermique approche.
                Retrouvez les modalités convenues dans votre devis.
              </p>
            </div>
          </div>
          <div className="reminder">
            <Bell />
            <div>
              <b>En cas de retard</b>
              <p>Suivi dans le dossier et relance adaptée à la situation.</p>
            </div>
          </div>
          <p className="notice">
            Aucune relance programmée ni envoyée dans la démo. L’automatisation
            nécessitera une configuration email/WhatsApp et l’accord du client.
          </p>
        </Modal>
      )}
    </div>
  );
}

function Landing() {
  const [activeService, setActiveService] = useState(0);
  const landingServices = [
    { title: "Plomberie", image: "https://angthermique.com/wp-content/uploads/2024/04/lavabo.jpg", icon: Droplets, intro: "Des installations sanitaires propres et durables.", details: ["Débouchage", "Installation et rénovation sanitaires", "Recherche et réparation de fuites"] },
    { title: "Pompe à chaleur", image: "https://angthermique.com/wp-content/uploads/2024/04/pompe_a_chaleur_appartement-.jpg", icon: Wind, intro: "Améliorez votre confort et maîtrisez votre consommation.", details: ["Installation air/air et air/eau", "Entretien de votre équipement", "Dépannage et mise en service"] },
    { title: "Chauffage", image: "https://angthermique.com/wp-content/uploads/2024/04/chauffage-5.jpg", icon: Flame, intro: "Une chaleur fiable, du conseil à la mise en service.", details: ["Installation et entretien de chaudières", "Remplacement de robinetterie et radiateurs", "Dépannage rapide"] },
  ];
  const selectedService = landingServices[activeService];
  const ServiceIcon = selectedService.icon;
  return (
    <div className="landing">
      <header className="landing-header">
        <a className="landing-logo" href="/"><span><Flame /></span><strong>ANG<span>THERMIQUE</span></strong></a>
        <nav className="landing-nav"><a href="#prestations">Prestations</a><a href="#engagements">Nos engagements</a><a href="tel:+33668415873">+33 6 68 41 58 73</a><a className="landing-cta" href="/dashboard">Espace professionnel <ArrowUpRight size={15} /></a></nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy"><span className="eyebrow">PLOMBERIE · CHAUFFAGE · POMPE À CHALEUR</span><h1>Plombier chauffagiste<br /><em>en région Île-de-France</em></h1><p>Votre satisfaction est notre priorité. ANG Thermique vous accompagne dans vos installations, dépannages et rénovations.</p><div className="landing-actions"><a className="landing-primary" href="/dashboard"><FileText size={17} /> Obtenir un devis</a><a className="landing-secondary" href="#prestations">Découvrir nos services <ArrowRight size={16} /></a></div><div className="landing-proof"><span><Check size={15} /> Plus de 500 clients</span><span><Check size={15} /> 10 ans d’expérience</span><span><Check size={15} /> 24h/24 · 6j/7</span></div></div>
          <div className="landing-visual"><div className="landing-glow" /><div className="landing-photo"><img src="https://angthermique.com/wp-content/uploads/2024/04/2en1-removebg-preview.png" alt="Installation de plomberie et chauffage ANG Thermique" /></div><div className="landing-card"><Flame size={34} /><small>ANG THERMIQUE</small><strong>Le confort<br />bien installé.</strong><div><span><Droplets /> Plomberie</span><span><Wind /> Pompe à chaleur</span><span><Wrench /> Chauffage</span></div></div><div className="landing-float"><Check size={17} /><span>Artisan de confiance<small>Qualigaz · Garantie décennale</small></span></div></div>
        </section>
        <section className="landing-services" id="prestations"><div className="landing-section-head"><div><span className="eyebrow">NOS PRINCIPALES PRESTATIONS</span><h2>Des solutions fiables pour vos travaux.</h2></div><div className="carousel-controls"><button aria-label="Prestation précédente" onClick={() => setActiveService((activeService + landingServices.length - 1) % landingServices.length)}><ChevronRight className="flip" size={18} /></button><button aria-label="Prestation suivante" onClick={() => setActiveService((activeService + 1) % landingServices.length)}><ChevronRight size={18} /></button></div></div><div className="service-carousel">{landingServices.map((item, index) => { const Icon = item.icon; return <button type="button" className={"service-tile " + (index === activeService ? "active" : "")} key={item.title} onClick={() => setActiveService(index)}><img src={item.image} alt={item.title} /><span className="tile-shade" /><span className="tile-copy"><Icon size={19} /><strong>{item.title}</strong><small>En savoir plus <ArrowUpRight size={13} /></small></span></button>; })}</div><div className="service-detail"><div><ServiceIcon /><span className="eyebrow">{selectedService.title.toUpperCase()}</span><h3>{selectedService.intro}</h3></div><ul>{selectedService.details.map(detail => <li key={detail}><Check size={15} />{detail}</li>)}</ul><a className="landing-primary" href="/dashboard">Demander un devis <ArrowRight size={15} /></a></div></section>
        <section className="landing-engagements" id="engagements"><div><span className="eyebrow">POURQUOI NOUS CHOISIR ?</span><h2>Un accompagnement clair,<br />du devis à l’intervention.</h2><p>ANG Thermique intervient auprès des particuliers et des professionnels en Île-de-France avec une expertise solide et des solutions durables.</p><a className="landing-primary" href="/dashboard">Préparer mon projet <ArrowRight size={16} /></a></div><div className="landing-badges"><div><strong>24/7</strong><span>Disponibilité<br />6 jours sur 7</span></div><div><strong>10+</strong><span>Années<br />d’expérience</span></div><div><strong>500+</strong><span>Clients<br />satisfaits</span></div></div></section>
      </main>
      <footer className="landing-footer"><span><Flame size={15} /> ANG Thermique · Île-de-France</span><span>Imaginé par <b>Mobeau</b> · <a href="/dashboard">Accès professionnel</a></span></footer>
    </div>
  );
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path === "/dashboard" || new URLSearchParams(window.location.search).has("paiement") ? <Dashboard /> : <Landing />;
}
function Request({ close, add }: { close: () => void; add: (j: Job) => void }) {
  const [images, setImages] = useState<string[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <Modal title="Préparer une demande client" close={close}>
      <p className="muted">
        Un formulaire à intégrer à votre site pour recevoir des demandes mieux
        renseignées. Utilisez des coordonnées fictives.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          add({
            id: "ANG-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
            name: String(f.get("name")).trim(),
            city: String(f.get("city")).trim(),
            email: String(f.get("email")),
            phone: String(f.get("phone")),
            service: String(f.get("service")),
            description: String(f.get("description")),
            date: "",
            status: statuses[0],
            lines: [
              {
                label: String(f.get("service")) + " — à chiffrer",
                qty: 1,
                price: 0,
              },
            ],
            mentions,
            count: 3,
            paid: 0,
            signed: false,
            notes: "",
            photos: images,
          });
        }}
      >
        <div className="field-grid">
          <label>
            Nom du client
            <input name="name" required maxLength={100} />
          </label>
          <label>
            Ville d’intervention
            <input name="city" required maxLength={100} />
          </label>
          <label>
            Email
            <input name="email" type="email" required maxLength={150} />
          </label>
          <label>
            Téléphone (facultatif)
            <input name="phone" type="tel" maxLength={25} />
          </label>
        </div>
        <label>
          Votre besoin
          <select name="service">
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Décrivez le projet
          <textarea
            name="description"
            rows={3}
            required
            maxLength={2000}
            placeholder="Équipement actuel, type de logement, surface, problème rencontré…"
          />
        </label>
        <label>
          Photos du projet · 3 maximum
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (files.length + images.length > 3) {
                setError("3 photos maximum.");
                return;
              }
              setBusy(true);
              setError("");
              try {
                const p = await Promise.all(files.map(photo));
                setImages((v) => [...v, ...p]);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        <div className="photos">
          {images.map((src, i) => (
            <button
              type="button"
              key={i}
              aria-label={"Retirer la photo " + (i + 1)}
              onClick={() => setImages(images.filter((_, n) => n !== i))}
            >
              <img src={src} alt={"Photo " + (i + 1)} />×
            </button>
          ))}
        </div>
        {error && <p role="alert">{error}</p>}
        <label className="check">
          <input type="checkbox" required />
          J’utilise des informations fictives pour explorer cette démonstration.
        </label>
        <button className="primary" disabled={busy}>
          {busy
            ? "Préparation des photos…"
            : "Créer le dossier de démonstration"}
          <ArrowRight size={16} />
        </button>
      </form>
    </Modal>
  );
}
