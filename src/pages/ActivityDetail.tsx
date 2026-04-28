import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Users, MapPin, Phone, CreditCard, Loader2, ArrowLeft } from "lucide-react";

const bookingSchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().max(30).optional(),
  booking_date: z.string().min(1),
  booking_time: z.string().optional(),
  party_size: z.number().int().min(1).max(50),
  notes: z.string().max(500).optional(),
});

const ActivityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { data: activity, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*, businesses(*)")
        .eq("id", id!)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (activity) document.title = `${activity.title} · KreyolKwest`;
  }, [activity]);

  const handleBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Connecte-toi pour réserver");
      navigate("/auth");
      return;
    }
    if (!activity) return;
    const fd = new FormData(e.currentTarget);
    const parsed = bookingSchema.safeParse({
      customer_name: fd.get("customer_name"),
      customer_email: fd.get("customer_email"),
      customer_phone: fd.get("customer_phone") || undefined,
      booking_date: fd.get("booking_date"),
      booking_time: fd.get("booking_time") || undefined,
      party_size: parseInt(fd.get("party_size") as string, 10),
      notes: (fd.get("notes") as string) || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const total = activity.price_cents * parsed.data.party_size;
    const { error } = await supabase.from("bookings").insert({
      activity_id: activity.id,
      customer_id: user.id,
      ...parsed.data,
      total_cents: total,
      payment_status: activity.online_payment_enabled && total > 0 ? "pending" : "not_required",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Réservation envoyée ! Le pro va te confirmer.");
      navigate("/mes-reservations");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  );
  if (!activity) return (
    <div className="min-h-screen flex items-center justify-center">Activité introuvable.</div>
  );

  const price = (activity.price_cents / 100).toFixed(0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-muted shadow-card mb-6">
              {activity.image_url && <img src={activity.image_url} alt={activity.title} className="h-full w-full object-cover" />}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {activity.online_payment_enabled && (
                <Badge className="bg-accent text-accent-foreground border-0"><CreditCard className="h-3 w-3 mr-1" /> Paiement en ligne</Badge>
              )}
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-2">{activity.title}</h1>
            {activity.businesses && (
              <p className="text-muted-foreground flex items-center gap-1 mb-6">
                <MapPin className="h-4 w-4" /> {activity.businesses.name} — {activity.businesses.city}
              </p>
            )}

            <div className="flex flex-wrap gap-6 mb-8 text-sm">
              {activity.duration_minutes && (
                <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {activity.duration_minutes} min</span>
              )}
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Jusqu'à {activity.max_capacity}</span>
              {activity.businesses?.phone && (
                <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {activity.businesses.phone}</span>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{activity.description}</p>
            </div>
          </div>

          {/* Booking form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl bg-card p-6 shadow-card border">
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-display text-3xl font-extrabold">
                  {activity.price_cents === 0 ? "Gratuit" : `${price}€`}
                </span>
                {activity.price_cents > 0 && <span className="text-sm text-muted-foreground">/ personne</span>}
              </div>

              <form onSubmit={handleBook} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="customer_name">Nom</Label>
                  <Input id="customer_name" name="customer_name" required defaultValue={user?.user_metadata?.full_name ?? ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customer_email">Email</Label>
                  <Input id="customer_email" name="customer_email" type="email" required defaultValue={user?.email ?? ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="customer_phone">Téléphone</Label>
                  <Input id="customer_phone" name="customer_phone" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="booking_date">Date</Label>
                    <Input id="booking_date" name="booking_date" type="date" required min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="booking_time">Heure</Label>
                    <Input id="booking_time" name="booking_time" type="time" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="party_size">Nb personnes</Label>
                  <Input id="party_size" name="party_size" type="number" min={1} max={activity.max_capacity} defaultValue={2} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="notes">Notes (option.)</Label>
                  <Textarea id="notes" name="notes" rows={2} maxLength={500} />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> :
                    activity.online_payment_enabled && activity.price_cents > 0 ? "Réserver et payer" : "Réserver"}
                </Button>
                {!user && <p className="text-xs text-center text-muted-foreground">Tu seras invité à te connecter</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ActivityDetail;
