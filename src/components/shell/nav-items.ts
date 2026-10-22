export interface NavItem {
  title: string;
  href: string;
  icon:
    | "dashboard"
    | "patients"
    | "dietPlans"
    | "appointments"
    | "messages"
    | "forms"
    | "settings";
  badge?: string;
  description?: string;
}

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    title: "Patients",
    href: "/patients",
    icon: "patients",
  },
  {
    title: "Diet Plans",
    href: "/diet-plans",
    icon: "dietPlans",
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: "appointments",
  },
  {
    title: "WhatsApp",
    href: "/messages",
    icon: "messages",
    badge: "Cloud API",
  },
  {
    title: "Intake Forms",
    href: "/forms",
    icon: "forms",
    badge: "Google",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "settings",
  },
];
