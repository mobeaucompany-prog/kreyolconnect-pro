import { describe, it, expect } from "vitest";
import { schedule, seeds, total, validJob } from "./model";
describe("Dossiers et échéanciers ANG", () => {
  it("conserve chaque centime pour tous les rythmes", () => {
    for (const n of [1, 3, 4, 6])
      for (const amount of [0, 1, 10001, 840000, 100000000])
        expect(schedule(amount, n).reduce((a, b) => a + b, 0)).toBe(amount);
  });
  it("refuse les montants et paiements incohérents", () => {
    expect(() => schedule(-1, 3)).toThrow();
    expect(() => schedule(100, 0)).toThrow();
    expect(validJob({ ...seeds()[0], paid: 99 })).toBe(false);
    expect(validJob({ ...seeds()[0], photos: [null] })).toBe(false);
    expect(
      validJob({
        ...seeds()[0],
        lines: [{ label: "PAC", qty: 2, price: Infinity }],
      }),
    ).toBe(false);
  });
  it("accepte la sauvegarde des lignes éditées", () => {
    const j = seeds()[0];
    j.lines.push({ label: "Déplacement", qty: 2, price: 12550 });
    expect(validJob(JSON.parse(JSON.stringify(j)))).toBe(true);
    expect(total(j.lines)).toBe(865100);
  });
});
