"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Construction, Mail, Crown } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function Maintenance() {
  if (typeof window === "undefined") {
    return null;
  }
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('site_name, maintenance_message')
        .eq('id', 'default')
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center space-y-4">
          <BrandLogo size="lg" asLink={false} className="flex-col" />
        </div>

        {/* Maintenance Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Construction className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-xl md:text-2xl font-medium text-foreground">
            We'll Be Back Soon
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {settings?.maintenance_message || 'We are currently performing scheduled maintenance. Please check back soon.'}
          </p>
        </div>

        {/* Contact */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            Need assistance? Contact us at{' '}
            <a href="mailto:info@algarveofficial.com" className="text-primary hover:underline">
              info@algarveofficial.com
            </a>
          </p>
        </div>

        {/* Decorative Element */}
        <div className="flex items-center justify-center gap-4 text-muted-foreground/30">
          <div className="h-px w-16 bg-current" />
          <Crown className="h-4 w-4" />
          <div className="h-px w-16 bg-current" />
        </div>
      </div>
    </div>
  );
}
