import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User as UserIcon, LayoutDashboard, Compass } from "lucide-react";

export const Navbar = () => {
  const { user, isPro, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-sunset shadow-glow">
            <Compass className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight">
            Kreyol<span className="text-primary">Kwest</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/explorer" className={({ isActive }) =>
            `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}`}>
            Explorer
          </NavLink>
          <NavLink to="/explorer?type=restaurant" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Restaurants
          </NavLink>
          <NavLink to="/explorer?type=sea_activity" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Mer
          </NavLink>
          <NavLink to="/explorer?type=land_activity" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Terre
          </NavLink>
          <NavLink to="/pro" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Espace Pro
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isPro ? (
                <Button variant="outline" size="sm" onClick={() => navigate("/pro/dashboard")}>
                  <LayoutDashboard className="h-4 w-4" />
                  Tableau de bord
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => navigate("/mes-reservations")}>
                  <UserIcon className="h-4 w-4" />
                  Mes réservations
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Déconnexion">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Connexion
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/auth?mode=signup")}>
                S'inscrire
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
