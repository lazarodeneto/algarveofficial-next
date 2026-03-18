import {
  BookOpen,
  Binoculars,
  Calendar,
  Compass,
  ExternalLink,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Home,
  Info,
  Link as LinkIcon,
  List,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plane,
  Settings,
  Star,
  TrendingUp,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export const MENU_ICON_OPTIONS: Array<{ name: string; icon: LucideIcon }> = [
  { name: "Home", icon: Home },
  { name: "MapPin", icon: MapPin },
  { name: "List", icon: List },
  { name: "FileText", icon: FileText },
  { name: "Compass", icon: Compass },
  { name: "Globe", icon: Globe },
  { name: "Users", icon: Users },
  { name: "User", icon: User },
  { name: "Calendar", icon: Calendar },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Info", icon: Info },
  { name: "HelpCircle", icon: HelpCircle },
  { name: "Mail", icon: Mail },
  { name: "Phone", icon: Phone },
  { name: "Link", icon: LinkIcon },
  { name: "ExternalLink", icon: ExternalLink },
  { name: "BookOpen", icon: BookOpen },
  { name: "Binoculars", icon: Binoculars },
  { name: "MessageSquare", icon: MessageSquare },
  { name: "Plane", icon: Plane },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Settings", icon: Settings },
];

export function getMenuIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return LinkIcon;
  const found = MENU_ICON_OPTIONS.find((item) => item.name === iconName);
  return found?.icon ?? LinkIcon;
}
