import { Link } from "react-router-dom";
import { Clock, Users, MapPin, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  activity: {
    id: string;
    title: string;
    image_url: string | null;
    price_cents: number;
    duration_minutes: number | null;
    max_capacity: number;
    online_payment_enabled: boolean;
    businesses?: { name: string; city: string; type: string } | null;
  };
}

const typeLabel: Record<string, string> = {
  restaurant: "Restaurant",
  sea_activity: "Mer",
  land_activity: "Terre",
};

export const ActivityCard = ({ activity }: Props) => {
  const price = (activity.price_cents / 100).toFixed(0);
  return (
    <Link
      to={`/activite/${activity.id}`}
      className="group relative block overflow-hidden rounded-3xl bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {activity.image_url ? (
          <img
            src={activity.image_url}
            alt={activity.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-tropical" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {activity.businesses?.type && (
            <Badge className="bg-background/95 text-foreground border-0 font-semibold">
              {typeLabel[activity.businesses.type]}
            </Badge>
          )}
          {activity.online_payment_enabled && (
            <Badge className="bg-accent text-accent-foreground border-0 font-semibold">
              <CreditCard className="h-3 w-3 mr-1" /> Paiement en ligne
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-background px-4 py-1.5 font-display font-extrabold text-foreground shadow-soft">
          {activity.price_cents === 0 ? "Gratuit" : `${price}€`}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-bold leading-tight line-clamp-2 mb-2">
          {activity.title}
        </h3>
        {activity.businesses && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-3.5 w-3.5" />
            {activity.businesses.name} · {activity.businesses.city}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {activity.duration_minutes && (
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {activity.duration_minutes} min</span>
          )}
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {activity.max_capacity} max</span>
        </div>
      </div>
    </Link>
  );
};
