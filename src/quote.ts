import { jsPDF } from "jspdf";
import { type Job, total, schedule, money } from "./model";
export function quotePdf(j: Job) {
  const doc = new jsPDF();
  let y = 20;
  const clean = (s: string) =>
    s
      .replace(/[\u202f\u00a0]/g, " ")
      .replace(/€/g, "EUR")
      .replace(/[–—]/g, "-")
      .replace(/[’]/g, "'");
  const header = () => {
    doc.setFillColor(23, 43, 55);
    doc.rect(0, 0, 210, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ANG THERMIQUE", 18, 18);
    doc.setFontSize(10);
    doc.text("PLOMBERIE  /  CHAUFFAGE  /  POMPE À CHALEUR", 18, 27);
    doc.setTextColor(23, 43, 55);
    y = 48;
  };
  header();
  const write = (text: string, size = 11) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(clean(text), 174) as string[];
    if (
      lines.length * size * 0.5 < 210 &&
      y + lines.length * size * 0.5 > 268
    ) {
      doc.addPage();
      header();
      doc.setFontSize(size);
    }
    for (const line of lines) {
      if (y > 268) {
        doc.addPage();
        header();
        doc.setFontSize(size);
      }
      doc.text(line, 18, y);
      y += size * 0.5;
    }
    y += 4;
  };
  write("DEVIS INDICATIF · " + j.id, 18);
  write("Démonstration Mobeau - document non contractuel", 9);
  write(j.name + " | " + j.city);
  write(j.email + " " + j.phone);
  write("Projet : " + j.service);
  write(j.description);
  write("DÉTAIL DES PRESTATIONS", 13);
  for (const l of j.lines)
    write(
      l.label +
        "\n" +
        l.qty +
        " × " +
        money(l.price) +
        " = " +
        money(l.qty * l.price),
    );
  write("TOTAL INDICATIF : " + money(total(j.lines)), 17);
  write("Montants de démonstration ; détail HT / TVA à confirmer.", 9);
  write("ÉCHÉANCIER ILLUSTRATIF", 13);
  schedule(total(j.lines), j.count).forEach((p, i) =>
    write((i === 0 ? "À la validation" : `Mois ${i}`) + " : " + money(p)),
  );
  write("MENTIONS", 13);
  write(j.mentions, 10);
  j.photos.forEach((p, i) => {
    doc.addPage();
    header();
    write("PHOTO DU PROJET " + (i + 1), 14);
    const prop = doc.getImageProperties(p);
    const ratio = Math.min(174 / prop.width, 190 / prop.height);
    doc.addImage(p, "JPEG", 18, y, prop.width * ratio, prop.height * ratio);
  });
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(`ANG Thermique - Démo Mobeau | ${p} / ${pages}`, 18, 286);
  }
  return doc;
}
