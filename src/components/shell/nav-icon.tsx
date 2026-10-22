import React from "react";
import {
  LayoutDashboard,
  Users,
  Utensils,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  Settings,
  type LucideProps,
} from "lucide-react";

interface NavIconProps extends LucideProps {
  name:
    | "dashboard"
    | "patients"
    | "dietPlans"
    | "appointments"
    | "messages"
    | "forms"
    | "settings";
}

export function NavIcon({ name, ...props }: NavIconProps) {
  switch (name) {
    case "dashboard":
      return <LayoutDashboard {...props} />;
    case "patients":
      return <Users {...props} />;
    case "dietPlans":
      return <Utensils {...props} />;
    case "appointments":
      return <Calendar {...props} />;
    case "messages":
      return <MessageSquare {...props} />;
    case "forms":
      return <FileSpreadsheet {...props} />;
    case "settings":
      return <Settings {...props} />;
    default:
      return <LayoutDashboard {...props} />;
  }
}
