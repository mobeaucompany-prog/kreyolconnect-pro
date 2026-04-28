import { Compass } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/40 bg-foreground text-background mt-24">
    <div className="container py-12 grid gap-8 md:grid-cols-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-sunset">
            <Compass className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-extrabold">KreyolKwest</span>
        </div>
        <p className="text-sm opacity-70">Sort. Découvre. Profite. La Martinique comme tu l'aimes.</p>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3 text-accent">Explorer</h4>
        <ul className="space-y-2 text-sm opacity-80">
          <li>Restaurants</li><li>Activités mer</li><li>Activités terre</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3 text-accent">Pros</h4>
        <ul className="space-y-2 text-sm opacity-80">
          <li>Devenir partenaire</li><li>Tarification</li><li>Support</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-bold mb-3 text-accent">Légal</h4>
        <ul className="space-y-2 text-sm opacity-80">
          <li>CGU</li><li>Confidentialité</li><li>Contact</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-background/10 py-4 text-center text-xs opacity-60">
      © 2026 KreyolKwest — Made with ❤️ in Martinique
    </div>
  </footer>
);
