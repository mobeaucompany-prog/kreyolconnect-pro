import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, TrendingUp, Users } from "lucide-react";
import { useEffect } from "react";

const ProLanding = () => {
  useEffect(() => { document.title = "Espace Pro · KreyolKwest"; }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="bg-gradient-tropical text-white py-24">
        <div className="container max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4" /><span className="text-sm font-semibold">Pour les pros</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Remplis ton agenda.<br /><span className="text-accent">Simplement.</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-95">
            Ajoute ton restaurant ou ton activité, reçois des réservations en quelques clics. Tu payes seulement <strong className="text-accent">1€ par réservation effective</strong>.
          </p>
          <Button asChild variant="accent" size="xl"><Link to="/auth?mode=signup&type=pro">Créer mon compte pro</Link></Button>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Users, t: "Plus de visibilité", d: "Touche les locaux et les touristes en quête de bonnes adresses." },
            { icon: TrendingUp, t: "Aucun engagement", d: "Pas d'abonnement. Tu payes seulement quand tu reçois une vraie résa." },
            { icon: Check, t: "Interface ultra simple", d: "Suis tes réservations, mets à jour ton offre. En 2 clics." },
          ].map((b) => (
            <div key={b.t} className="rounded-3xl bg-card p-8 shadow-card border">
              <div className="h-12 w-12 rounded-2xl bg-gradient-sunset flex items-center justify-center mb-4 shadow-glow">
                <b.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{b.t}</h3>
              <p className="text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProLanding;
