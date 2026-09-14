import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Heart, TreePine, Users, BarChart3, Siren, UserRoundCheck, HeartPulse, HeartHandshake, Package, Radar } from "lucide-react";

const navigation = [
  { name: "Command Center", href: "/command-center", icon: Radar },
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Rescue Cases", href: "/rescue-cases", icon: Siren },
  { name: "Medical & Recovery", href: "/medical-recovery", icon: HeartPulse },
  { name: "Adoptions", href: "/adoptions", icon: HeartHandshake },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Volunteer Assignments", href: "/volunteers", icon: UserRoundCheck },
  { name: "Donations", href: "/donations", icon: Heart },
  { name: "Campaigns", href: "/campaigns", icon: TreePine },
  { name: "Donors", href: "/donors", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <TreePine className="mr-2 h-6 w-6 text-primary" />
        <span className="font-serif text-lg font-bold tracking-tight">Wild Haven</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-sidebar-foreground/50")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/50">
        Operations Control
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const [location] = useLocation();
  return (
    <nav aria-label="Mobile operations navigation" className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b bg-background/95 p-2 backdrop-blur lg:hidden">
      {navigation.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        return <Link key={item.name} href={item.href} className={cn("flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><item.icon className="h-3.5 w-3.5" />{item.name}</Link>;
      })}
    </nav>
  );
}
