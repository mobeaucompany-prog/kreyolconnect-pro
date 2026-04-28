import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ActivityCard } from "@/components/ActivityCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

const TYPES = [
  { val: "", label: "Tout" },
  { val: "restaurant", label: "Restaurants" },
  { val: "sea_activity", label: "Mer" },
  { val: "land_activity", label: "Terre" },
];

const Explorer = () => {
  const [params, setParams] = useSearchParams();
  const type = params.get("type") ?? "";
  const q = params.get("q") ?? "";

  useEffect(() => { document.title = "Explorer · KreyolKwest"; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["activities", type, q],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select("*, businesses!inner(name, city, type)")
        .eq("is_published", true);
      if (type) query = query.eq("businesses.type", type as any);
      if (q) query = query.ilike("title", `%${q}%`);
      const { data } = await query.order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const setParam = (key: string, val: string) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="bg-gradient-tropical text-white py-16">
        <div className="container">
          <h1 className="font-display text-5xl md:text-6xl font-extrabold mb-3">Explore la Martinique</h1>
          <p className="text-lg opacity-95 mb-8">Trouve l'expérience parfaite pour ta prochaine sortie.</p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              defaultValue={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Rechercher une activité, un restaurant..."
              className="pl-12 h-14 rounded-full bg-white text-foreground border-0 shadow-glow"
            />
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {TYPES.map((t) => (
            <button
              key={t.val}
              onClick={() => setParam("type", t.val)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                type === t.val
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : data && data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => <ActivityCard key={a.id} activity={a as any} />)}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            Aucune activité trouvée. Essaie une autre recherche.
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Explorer;
