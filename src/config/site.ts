export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  description?: string;
}

export const siteConfig = {
  name: "NutriCare Clinical Platform",
  shortName: "NutriCare",
  description:
    "Enterprise-grade clinical management system for clinical dietitians and nutritionists.",
  navItems: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard",
    },
    {
      title: "Patients",
      href: "/patients",
      icon: "Users",
    },
    {
      title: "Diet Plans",
      href: "/diet-plans",
      icon: "Salad",
    },
    {
      title: "Appointments",
      href: "/appointments",
      icon: "Calendar",
    },
    {
      title: "Messages (WhatsApp)",
      href: "/messages",
      icon: "MessageSquare",
      badge: "Cloud API",
    },
    {
      title: "Intake Forms",
      href: "/forms",
      icon: "FileSpreadsheet",
      badge: "Google",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "Settings",
    },
  ] as const satisfies readonly NavItem[],
};
