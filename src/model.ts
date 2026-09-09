export type Line = { label: string; qty: number; price: number };
export type Job = {
  id: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  status: string;
  date: string;
  lines: Line[];
  mentions: string;
  count: number;
  paid: number;
  signed: boolean;
  notes: string;
  photos: string[];
  paymentMode?: "single" | "installments";
  paymentLink?: string;
  signatureData?: string;
  signedDocument?: string;
};
export const statuses = [
  "Nouvelle demande",
  "Visite planifiée",
  "Devis préparé",
  "Accord simulé",
  "Intervention terminée",
];
export const services = [
  "Pompe à chaleur",
  "Chauffage",
  "Plomberie",
  "Rénovation sanitaire",
];
export const money = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    n / 100,
  );
export function total(lines: Line[]) {
  return lines.reduce((s, l) => s + Math.round(l.price * l.qty), 0);
}
export function schedule(amount: number, count: number) {
  if (
    !Number.isSafeInteger(amount) ||
    amount < 0 ||
    amount > 100000000 ||
    ![1, 3, 4, 6].includes(count)
  )
    throw Error("Montant ou échéancier invalide.");
  return Array.from(
    { length: count },
    (_, i) => Math.floor(amount / count) + (i < amount % count ? 1 : 0),
  );
}
export function validJob(j: unknown): j is Job {
  if (!j || typeof j !== "object") return false;
  const p = j as Job;
  return (
    [
      "id",
      "name",
      "city",
      "email",
      "phone",
      "service",
      "description",
      "status",
      "date",
      "mentions",
      "notes",
    ].every((k) => typeof p[k as keyof Job] === "string") &&
    statuses.includes(p.status) &&
    Array.isArray(p.lines) &&
    p.lines.length <= 30 &&
    p.lines.every(
      (l) =>
        l &&
        typeof l.label === "string" &&
        l.label.length <= 300 &&
        Number.isInteger(l.qty) &&
        l.qty > 0 &&
        l.qty <= 1000 &&
        Number.isSafeInteger(l.price) &&
        l.price >= 0 &&
        l.price <= 10000000,
    ) &&
    total(p.lines) <= 100000000 &&
    [1, 3, 4, 6].includes(p.count) &&
    Number.isInteger(p.paid) &&
    p.paid >= 0 &&
    p.paid <= p.count &&
    typeof p.signed === "boolean" &&
    Array.isArray(p.photos) &&
    p.photos.length <= 3 &&
    p.photos.every(
      (x) => typeof x === "string" && /^data:image\/jpeg;base64,/.test(x),
    ) &&
    (!p.paymentMode || p.paymentMode === "single" || p.paymentMode === "installments") &&
    (!p.paymentLink || (typeof p.paymentLink === "string" && p.paymentLink.length <= 300)) &&
    (!p.signatureData || (typeof p.signatureData === "string" && /^data:image\/png;base64,/.test(p.signatureData))) &&
    (!p.signedDocument || (typeof p.signedDocument === "string" && /^(data:application\/pdf|data:image\/(jpeg|png));base64,/.test(p.signedDocument)))
  );
}
export const mentions =
  "Proposition de démonstration, sans engagement. Les prestations, la TVA applicable, les délais et les modalités de règlement sont à confirmer après visite. Aucun paiement réel ni signature contractuelle dans cette démo.";
export function seeds(): Job[] {
  return [
    [
      "ANG-024",
      "Sarah M.",
      "Noisy-le-Grand",
      "Pompe à chaleur",
      "Remplacer le chauffage existant par une pompe à chaleur air/eau.",
      "Nouvelle demande",
      840000,
    ],
    [
      "ANG-023",
      "Julien D.",
      "Montfermeil",
      "Chauffage",
      "Remplacement d’une chaudière et mise en service.",
      "Visite planifiée",
      420000,
    ],
    [
      "ANG-022",
      "Fatou B.",
      "Drancy",
      "Plomberie",
      "Recherche de fuite et remplacement d’une robinetterie.",
      "Devis préparé",
      68000,
    ],
    [
      "ANG-021",
      "Marc L.",
      "Paris",
      "Rénovation sanitaire",
      "Rénovation des équipements sanitaires de la salle de bain.",
      "Accord simulé",
      360000,
    ],
  ].map((r, i) => ({
    id: String(r[0]),
    name: String(r[1]),
    city: String(r[2]),
    service: String(r[3]),
    description: String(r[4]),
    status: String(r[5]),
    email: `client${i + 1}@example.com`,
    phone: "",
    date: "",
    lines: [
      {
        label: String(r[3]) + " — fourniture et installation (exemple)",
        qty: 1,
        price: Number(r[6]),
      },
    ],
    mentions,
    count: i === 2 ? 1 : 3,
    paid: i === 3 ? 1 : 0,
    signed: i === 3,
    notes: "",
    photos: [],
  }));
}
export async function photo(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5000000
  )
    throw Error("Choisissez une photo JPG, PNG ou WebP de moins de 5 Mo.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const ratio = Math.min(1, 900 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * ratio);
    canvas.height = Math.round(img.height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("Photo indisponible.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  } finally {
    URL.revokeObjectURL(url);
  }
}
