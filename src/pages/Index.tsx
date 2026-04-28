import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ActivityCard } from "@/components/ActivityCard";
import hero from "@/assets/hero-martinique.jpg";
import catRestaurant from "@/assets/cat-restaurant.jpg";
import catSea from "@/assets/cat-sea.jpg";
import catLand from "@/assets/cat-land.jpg";
import { Search, Sparkles, Heart, Zap } from "lucide-react";

const Index = () => {
  useEffect(() => {
    document.title = "KreyolKwest — Réserve tes activités et restos en Martinique";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Découvre et réserve restaurants, activités mer et terre en Martinique. Sort. Découvre. Profite.");
  }, []);

  const { data: featured } = useQuery({
    queryKey: ["featured-activities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*, businesses(name, city, type)")
        .eq("is_published", true)
        .limit(6);
      return data ?? [];
    },
  });

  const categories = [
    { type: "restaurant", label: "Restaurants", img: catRestaurant, desc: "Saveurs créoles" },
    { type: "sea_activity", label: "Activités Mer", img: catSea, desc: "Catamaran, snorkeling, plongée" },
    { type: "land_activity", label: "Activités Terre", img: catLand, desc: "Rando, nature, culture" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <img src={hero} alt="Plage de Martinique au coucher du soleil" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1280} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 via-foreground/40 to-foreground/70" />
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-secondary/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="container relative z-10 py-24 text-white animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-2 mb-6 border border-white/20">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">La Martinique comme tu l'aimes</span>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-extrabold leading-[0.95] mb-6 max-w-4xl">
            Sort. <span className="text-accent">Découvre.</span><br />
            <span className="text-gradient-sunset bg-gradient-sunset bg-clip-text text-transparent">Profite.</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-10 opacity-95 font-light">
            Réserve les meilleurs restaurants, activités mer et terre de Martinique. Tout en un seul endroit.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="hero" size="xl">
              <Link to="/explorer"><Search className="h-5 w-5" /> Explorer maintenant</Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/20">
              <Link to="/auth?mode=signup&type=pro">Je suis un pro</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl">
            {[
              { n: "150+", l: "Partenaires" },
              { n: "100%", l: "Gratuit côté client" },
              { n: "1€", l: "Par résa pour les pros" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl md:text-4xl font-extrabold text-accent">{s.n}</div>
                <div className="text-sm opacity-85">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container py-24">
        <div className="text-center mb-14">
          <p className="text-primary font-display font-bold uppercase tracking-widest text-sm mb-3">Catégories</p>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold mb-4">Qu'est-ce qui te tente ?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Trois univers, mille expériences pour vivre la Martinique à fond.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((c, i) => (
            <Link
              key={c.type}
              to={`/explorer?type=${c.type}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card hover:shadow-glow transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <img src={c.img} alt={c.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 p-8 text-white">
                <h3 className="font-display text-3xl md:text-4xl font-extrabold mb-2">{c.label}</h3>
                <p className="opacity-90">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured && featured.length > 0 && (
        <section className="container pb-24">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-primary font-display font-bold uppercase tracking-widest text-sm mb-3">À l'honneur</p>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold">Coups de cœur du moment</h2>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link to="/explorer">Tout voir</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((a) => <ActivityCard key={a.id} activity={a as any} />)}
          </div>
        </section>
      )}

      {/* PRO BANNER */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-tropical p-12 md:p-16 text-white shadow-glow">
          <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 mb-6">
              <Zap className="h-4 w-4" /> <span className="text-sm font-semibold">Pour les pros</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              Plus de clients.<br />Zéro complication.
            </h2>
            <p className="text-lg mb-8 opacity-95">
              Inscris ton restaurant ou ton activité, gère tes réservations en temps réel.
              Tu ne payes que <strong className="text-accent">1€ par réservation effective</strong>. C'est tout.
            </p>
            <Button asChild variant="accent" size="xl">
              <Link to="/auth?mode=signup&type=pro"><Heart className="h-5 w-5" /> Devenir partenaire</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
