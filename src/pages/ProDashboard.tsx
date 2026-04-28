import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Building2, CalendarCheck, TrendingUp, Euro } from "lucide-react";

const bizSchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: z.enum(["restaurant", "sea_activity", "land_activity"]),
  city: z.string().trim().min(2).max(60),
  description: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(30).optional(),
  image_url: z.string().trim().url().or(z.literal("")).optional(),
});

const actSchema = z.object({
  business_id: z.string().uuid(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  price_cents: z.number().int().min(0),
  duration_minutes: z.number().int().min(0).optional(),
  max_capacity: z.number().int().min(1).max(500),
  image_url: z.string().trim().url().or(z.literal("")).optional(),
  online_payment_enabled: z.boolean(),
});

const ProDashboard = () => {
  const { user, isPro, loading } = useAuth();
  const qc = useQueryClient();
  const [openBiz, setOpenBiz] = useState(false);
  const [openAct, setOpenAct] = useState(false);

  useEffect(() => { document.title = "Tableau de bord Pro · KreyolKwest"; }, []);

  const { data: businesses } = useQuery({
    queryKey: ["pro-biz", user?.id],
    enabled: !!user && isPro,
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user!.id);
      return data ?? [];
    },
  });

  const { data: activities } = useQuery({
    queryKey: ["pro-act", user?.id],
    enabled: !!user && isPro,
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*, businesses!inner(name, owner_id)")
        .eq("businesses.owner_id", user!.id);
      return data ?? [];
    },
  });

  const { data: bookings } = useQuery({
    queryKey: ["pro-bookings", user?.id],
    enabled: !!user && isPro,
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, activities!inner(title, businesses!inner(name, owner_id))")
        .eq("activities.businesses.owner_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isPro) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container py-20 text-center flex-1">
        <h1 className="font-display text-3xl font-bold mb-4">Espace réservé aux pros</h1>
        <p className="text-muted-foreground mb-6">Crée un compte pro pour gérer tes activités.</p>
        <Button asChild variant="hero" size="lg"><Link to="/auth?mode=signup&type=pro">Créer un compte pro</Link></Button>
      </div>
      <Footer />
    </div>
  );

  const handleBiz = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = bizSchema.safeParse({
      name: fd.get("name"),
      type: fd.get("type"),
      city: fd.get("city"),
      description: (fd.get("description") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      image_url: (fd.get("image_url") as string) || undefined,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    const { error } = await supabase.from("businesses").insert([{ ...(parsed.data as any), owner_id: user.id }]);
    if (error) toast.error(error.message);
    else { toast.success("Établissement créé !"); setOpenBiz(false); qc.invalidateQueries({ queryKey: ["pro-biz"] }); }
  };

  const handleAct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = actSchema.safeParse({
      business_id: fd.get("business_id"),
      title: fd.get("title"),
      description: (fd.get("description") as string) || undefined,
      price_cents: Math.round(parseFloat(fd.get("price") as string || "0") * 100),
      duration_minutes: parseInt(fd.get("duration_minutes") as string || "0", 10) || undefined,
      max_capacity: parseInt(fd.get("max_capacity") as string, 10),
      image_url: (fd.get("image_url") as string) || undefined,
      online_payment_enabled: fd.get("online_payment_enabled") === "on",
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    const { error } = await supabase.from("activities").insert([parsed.data as any]);
    if (error) toast.error(error.message);
    else { toast.success("Activité créée !"); setOpenAct(false); qc.invalidateQueries({ queryKey: ["pro-act"] }); }
  };

  const updateBookingStatus = async (id: string, status: "confirmed" | "cancelled" | "completed") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Mis à jour"); qc.invalidateQueries({ queryKey: ["pro-bookings"] }); }
  };

  const totalRevenue = bookings?.filter((b: any) => b.status !== "cancelled").reduce((s: number, b: any) => s + b.total_cents, 0) ?? 0;
  const pendingCount = bookings?.filter((b: any) => b.status === "pending").length ?? 0;
  const commissionDue = (bookings?.filter((b: any) => b.status === "confirmed" || b.status === "completed").length ?? 0) * 100; // 1€ = 100c

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="container py-10 flex-1">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold">Tableau de bord</h1>
            <p className="text-muted-foreground">Pilote ton activité en un clin d'œil.</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <KPI icon={Building2} label="Établissements" value={businesses?.length ?? 0} />
          <KPI icon={CalendarCheck} label="Réservations" value={bookings?.length ?? 0} />
          <KPI icon={TrendingUp} label="En attente" value={pendingCount} accent />
          <KPI icon={Euro} label="Commission due" value={`${(commissionDue / 100).toFixed(0)}€`} sub="1€ par résa confirmée" />
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-6">
            <TabsTrigger value="bookings">Réservations</TabsTrigger>
            <TabsTrigger value="activities">Mes activités</TabsTrigger>
            <TabsTrigger value="businesses">Mes établissements</TabsTrigger>
          </TabsList>

          {/* BOOKINGS */}
          <TabsContent value="bookings">
            <div className="rounded-2xl bg-card shadow-card border overflow-hidden">
              {bookings && bookings.length > 0 ? (
                <div className="divide-y">
                  {bookings.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-4 flex-wrap gap-3">
                      <div className="flex-1 min-w-[240px]">
                        <div className="font-semibold">{b.activities?.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {b.customer_name} · {b.party_size} pers. · {new Date(b.booking_date).toLocaleDateString("fr-FR")} {b.booking_time?.slice(0,5)}
                        </div>
                        <div className="text-xs text-muted-foreground">{b.customer_email} · {b.customer_phone}</div>
                      </div>
                      <Badge className="border-0">{b.status}</Badge>
                      <div className="flex gap-2">
                        {b.status === "pending" && (
                          <>
                            <Button size="sm" variant="hero" onClick={() => updateBookingStatus(b.id, "confirmed")}>Confirmer</Button>
                            <Button size="sm" variant="ghost" onClick={() => updateBookingStatus(b.id, "cancelled")}>Refuser</Button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "completed")}>Marquer terminée</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">Aucune réservation pour le moment.</div>
              )}
            </div>
          </TabsContent>

          {/* ACTIVITIES */}
          <TabsContent value="activities">
            <div className="flex justify-end mb-4">
              <Dialog open={openAct} onOpenChange={setOpenAct}>
                <DialogTrigger asChild>
                  <Button variant="hero" disabled={!businesses?.length}><Plus className="h-4 w-4" /> Nouvelle activité</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Créer une activité</DialogTitle></DialogHeader>
                  <form onSubmit={handleAct} className="space-y-3">
                    <div className="space-y-1">
                      <Label>Établissement</Label>
                      <Select name="business_id" required>
                        <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                        <SelectContent>
                          {businesses?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Titre</Label><Input name="title" required maxLength={120} /></div>
                    <div className="space-y-1"><Label>Description</Label><Textarea name="description" rows={3} maxLength={2000} /></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label>Prix (€)</Label><Input name="price" type="number" step="0.01" min={0} defaultValue={0} /></div>
                      <div className="space-y-1"><Label>Durée (min)</Label><Input name="duration_minutes" type="number" min={0} /></div>
                      <div className="space-y-1"><Label>Capacité</Label><Input name="max_capacity" type="number" min={1} defaultValue={10} required /></div>
                    </div>
                    <div className="space-y-1"><Label>Image (URL)</Label><Input name="image_url" type="url" placeholder="https://..." /></div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <Label htmlFor="online_payment_enabled" className="font-semibold">Paiement en ligne</Label>
                        <p className="text-xs text-muted-foreground">Le client peut payer directement sur le site</p>
                      </div>
                      <Switch id="online_payment_enabled" name="online_payment_enabled" />
                    </div>
                    <DialogFooter><Button type="submit" variant="hero">Créer</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-3">
              {activities?.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card border">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden">
                      {a.image_url && <img src={a.image_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.businesses?.name} · {(a.price_cents/100).toFixed(0)}€</div>
                    </div>
                  </div>
                  {a.online_payment_enabled && <Badge className="bg-accent text-accent-foreground border-0">Paiement online</Badge>}
                </div>
              ))}
              {(!activities || activities.length === 0) && (
                <div className="py-16 text-center text-muted-foreground rounded-2xl bg-card border">
                  {businesses?.length ? "Pas encore d'activité. Crées-en une !" : "Crée d'abord un établissement."}
                </div>
              )}
            </div>
          </TabsContent>

          {/* BUSINESSES */}
          <TabsContent value="businesses">
            <div className="flex justify-end mb-4">
              <Dialog open={openBiz} onOpenChange={setOpenBiz}>
                <DialogTrigger asChild><Button variant="hero"><Plus className="h-4 w-4" /> Nouvel établissement</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Créer un établissement</DialogTitle></DialogHeader>
                  <form onSubmit={handleBiz} className="space-y-3">
                    <div className="space-y-1"><Label>Nom</Label><Input name="name" required maxLength={100} /></div>
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <Select name="type" required defaultValue="restaurant">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="sea_activity">Activité Mer</SelectItem>
                          <SelectItem value="land_activity">Activité Terre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label>Ville</Label><Input name="city" required maxLength={60} placeholder="Fort-de-France" /></div>
                      <div className="space-y-1"><Label>Téléphone</Label><Input name="phone" maxLength={30} /></div>
                    </div>
                    <div className="space-y-1"><Label>Description</Label><Textarea name="description" rows={3} maxLength={1000} /></div>
                    <div className="space-y-1"><Label>Image (URL)</Label><Input name="image_url" type="url" /></div>
                    <DialogFooter><Button type="submit" variant="hero">Créer</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {businesses?.map((b) => (
                <div key={b.id} className="rounded-2xl bg-card p-5 shadow-card border">
                  <div className="font-display text-lg font-bold">{b.name}</div>
                  <div className="text-sm text-muted-foreground">{b.city} · {b.type}</div>
                  {b.description && <p className="text-sm mt-2 line-clamp-2">{b.description}</p>}
                </div>
              ))}
              {(!businesses || businesses.length === 0) && (
                <div className="py-16 text-center text-muted-foreground rounded-2xl bg-card border col-span-full">
                  Aucun établissement. Commence par en créer un !
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

const KPI = ({ icon: Icon, label, value, sub, accent }: any) => (
  <div className={`rounded-2xl p-5 shadow-card border ${accent ? "bg-gradient-sunset text-white border-0" : "bg-card"}`}>
    <div className="flex items-center justify-between mb-2">
      <span className={`text-sm font-medium ${accent ? "opacity-90" : "text-muted-foreground"}`}>{label}</span>
      <Icon className="h-5 w-5 opacity-70" />
    </div>
    <div className="font-display text-3xl font-extrabold">{value}</div>
    {sub && <div className={`text-xs mt-1 ${accent ? "opacity-80" : "text-muted-foreground"}`}>{sub}</div>}
  </div>
);

export default ProDashboard;
