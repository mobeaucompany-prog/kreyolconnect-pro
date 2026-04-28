import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users } from "lucide-react";
import { Navigate } from "react-router-dom";

const statusColor: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  confirmed: "bg-teal text-teal-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
  completed: "bg-muted text-foreground",
};
const statusLabel: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const MyBookings = () => {
  const { user, loading } = useAuth();
  useEffect(() => { document.title = "Mes réservations · KreyolKwest"; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, activities(title, image_url, businesses(name, city))")
        .eq("customer_id", user!.id)
        .order("booking_date", { ascending: false });
      return data ?? [];
    },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-12 flex-1">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-2">Mes réservations</h1>
        <p className="text-muted-foreground mb-8">Retrouve toutes tes sorties en un coup d'œil.</p>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {data.map((b: any) => (
              <div key={b.id} className="flex gap-4 rounded-2xl bg-card p-4 shadow-card border">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {b.activities?.image_url && <img src={b.activities.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                    <div>
                      <h3 className="font-display text-lg font-bold">{b.activities?.title}</h3>
                      <p className="text-sm text-muted-foreground">{b.activities?.businesses?.name} · {b.activities?.businesses?.city}</p>
                    </div>
                    <Badge className={`${statusColor[b.status]} border-0`}>{statusLabel[b.status]}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(b.booking_date).toLocaleDateString("fr-FR")} {b.booking_time?.slice(0, 5)}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.party_size} pers.</span>
                    {b.total_cents > 0 && <span className="font-semibold text-foreground">{(b.total_cents / 100).toFixed(2)}€</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground">
            Aucune réservation pour l'instant. <a href="/explorer" className="text-primary font-semibold">Explore les activités →</a>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;
