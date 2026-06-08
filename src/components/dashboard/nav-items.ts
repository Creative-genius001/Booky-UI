import {
  BarChart3,
  CalendarClock,
  CalendarX2,
  LayoutDashboard,
  Scissors,
  Settings,
  Clock,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/dashboard/services", label: "Services", icon: Scissors },
  { href: "/dashboard/business-hours", label: "Business Hours", icon: Clock },
  { href: "/dashboard/blocked-dates", label: "Blocked Dates", icon: CalendarX2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
