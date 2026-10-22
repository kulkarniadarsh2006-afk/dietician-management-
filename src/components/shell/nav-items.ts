export interface NavItem {
  title: string;
  href: string;
  icon: "overview" | "clients" | "dietPlans" | "whatsapp" | "integrations" | "settings";
  badge?: string;
  description?: string;
}

export const navigationItems: NavItem[] = [
  {
    title: "Overview",
    href: "/",
    icon: "overview",
  },
  {
    title: "Clients",
    href: "/clients",
    icon: "clients",
  },
  {
    title: "Diet Plans",
    href: "/diet-plans",
    icon: "dietPlans",
  },
  {
    title: "WhatsApp Delivery",
    href: "/whatsapp",
    icon: "whatsapp",
    badge: "Cloud API",
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: "integrations",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "settings",
  },
];
