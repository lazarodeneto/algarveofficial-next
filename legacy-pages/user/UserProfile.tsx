import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Key,
  MapPin,
  Tags,
  Bell,
  Save,
  Loader2,
  Check,
  Mountain,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useFavoriteCategories } from "@/hooks/useFavoriteCategories";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Regions list synced with homepage RegionsSection
const regions = [
  { id: "golden-triangle", name: "Golden Triangle" },
  { id: "vilamoura-prestige", name: "Vilamoura Prestige" },
  { id: "carvoeiro-cliffs", name: "Carvoeiro Cliffs" },
  { id: "lagos-signature", name: "Lagos Signature" },
  { id: "tavira-heritage", name: "Tavira Heritage" },
  { id: "ria-formosa-reserve", name: "Ria Formosa Reserve" },
  { id: "monchique-retreats", name: "Monchique Retreats" },
  { id: "sagres-atlantic", name: "Sagres Atlantic" },
  { id: "portimao-prime", name: "Portimão Prime" },
  { id: "private-algarve", name: "Private Algarve" },
];

// Cities list synced with homepage CitiesSection
const cities = [
  { id: "almancil", name: "Almancil" },
  { id: "quinta-do-lago", name: "Quinta do Lago" },
  { id: "vale-do-lobo", name: "Vale do Lobo" },
  { id: "vilamoura", name: "Vilamoura" },
  { id: "quarteira", name: "Quarteira" },
  { id: "albufeira", name: "Albufeira" },
  { id: "gale", name: "Galé" },
  { id: "sao-rafael", name: "São Rafael" },
  { id: "lagoa", name: "Lagoa" },
  { id: "carvoeiro", name: "Carvoeiro" },
  { id: "ferragudo", name: "Ferragudo" },
  { id: "portimao", name: "Portimão" },
  { id: "praia-da-rocha", name: "Praia da Rocha" },
  { id: "alvor", name: "Alvor" },
  { id: "lagos", name: "Lagos" },
  { id: "sagres", name: "Sagres" },
  { id: "monchique", name: "Monchique" },
  { id: "tavira", name: "Tavira" },
  { id: "olhao", name: "Olhão" },
];

// Categories with proper display names synced with homepage
const categoryDisplayNames: Record<string, string> = {
  'Real Estate': 'Algarve Services',
};

export default function UserProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  // Use shared saved destinations hook
  const { savedCityIds, savedRegionIds, toggleCity, toggleRegion } = useSavedDestinations();
  
  // Use favorite categories hook
  const { favoriteCategoryIds, toggleFavorite: toggleCategoryFavorite } = useFavoriteCategories();
  
  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [messageNotifications, setMessageNotifications] = useState(true);
  
  // Fetch user profile from Supabase
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Fetch categories from Supabase
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });
  
  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);
  
  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refetchProfile();
      toast.success(t("dashboard.profile.profileUpdated"));
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t("dashboard.profile.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error(t("dashboard.profile.passwordsDontMatch"));
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error(t("dashboard.profile.passwordMinLength"));
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new
      });
      
      if (error) throw error;
      
      setPasswordForm({ current: '', new: '', confirm: '' });
      toast.success(t("dashboard.profile.passwordChanged"));
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || t("dashboard.profile.passwordChangeFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
          {t("dashboard.profile.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.profile.subtitle")}
        </p>
      </motion.div>

      {/* Profile Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("dashboard.profile.profileInformation")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.profile.updatePersonalInfo")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={fullName} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <p className="font-medium">{fullName || user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="mt-1 bg-primary/10 text-primary border-primary/20">
                {t("dashboard.profile.vipMember")}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("dashboard.profile.fullName")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("dashboard.profile.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {t("dashboard.profile.emailManagedByAuth")}
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("dashboard.profile.saveChanges")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("dashboard.profile.changePassword")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.profile.updateAccountPassword")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t("dashboard.profile.currentPassword")}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("dashboard.profile.newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("dashboard.profile.confirmNewPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleChangePassword} 
              disabled={isSaving || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
              variant="outline"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              {t("dashboard.profile.changePassword")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Destinations - Now synced with Saved Destinations */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("dashboard.profile.preferredDestinations")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.profile.selectFavoriteDestinations")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Regions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mountain className="h-4 w-4" />
              {t("dashboard.profile.luxuryRegions")} ({savedRegionIds.length} {t("dashboard.profile.selected")})
            </div>
            <div className="flex flex-wrap gap-2">
              {regions.map(region => (
                <button
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    savedRegionIds.includes(region.id)
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold border-transparent"
                      : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {savedRegionIds.includes(region.id) && (
                    <Check className="h-3 w-3 inline mr-1" />
                  )}
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Cities */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {t("dashboard.profile.cities")} ({savedCityIds.length} {t("dashboard.profile.selected")})
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map(city => (
                <button
                  key={city.id}
                  onClick={() => toggleCity(city.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    savedCityIds.includes(city.id)
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold border-transparent"
                      : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {savedCityIds.includes(city.id) && (
                    <Check className="h-3 w-3 inline mr-1" />
                  )}
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Categories */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            {t("dashboard.profile.preferredCategories")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.profile.selectInterests")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategoryFavorite(category.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    favoriteCategoryIds.includes(category.id)
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold border-transparent"
                      : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {favoriteCategoryIds.includes(category.id) && (
                    <Check className="h-3 w-3 inline mr-1" />
                  )}
                  {categoryDisplayNames[category.name] || category.name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("dashboard.profile.notifications")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.profile.manageNotifications")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("dashboard.profile.emailNotifications")}</p>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.profile.emailNotificationsDesc")}
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("dashboard.profile.marketingEmails")}</p>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.profile.marketingEmailsDesc")}
              </p>
            </div>
            <Switch 
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("dashboard.profile.messageNotifications")}</p>
              <p className="text-sm text-muted-foreground">
                {t("dashboard.profile.messageNotificationsDesc")}
              </p>
            </div>
            <Switch 
              checked={messageNotifications}
              onCheckedChange={setMessageNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
            <span>•</span>
            <span>Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
