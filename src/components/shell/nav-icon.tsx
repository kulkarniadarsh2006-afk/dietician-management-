import React from "react";
import {
  LayoutDashboard,
  Users,
  Utensils,
  MessageSquare,
  Boxes,
  Settings,
  type LucideProps,
} from "lucide-react";

interface NavIconProps extends LucideProps {
  name: "overview" | "clients" | "dietPlans" | "whatsapp" | "integrations" | "settings";
}

export function NavIcon({ name, ...props }: NavIconProps) {
  switch (name) {
    case "overview":
      return <LayoutDashboard {...props} />;
    case "clients":
      return <Users {...props} />;
    case "dietPlans":
      return <Utensils {...props} />;
    case "whatsapp":
      return <MessageSquare {...props} />;
    case "integrations":
      return <Boxes {...props} />;
    case "settings":
      return <Settings {...props} />;
    default:
      return <LayoutDashboard {...props} />;
  }
}
