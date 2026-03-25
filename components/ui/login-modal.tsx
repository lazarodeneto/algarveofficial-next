"use client";

import { useState } from "react";
import Link from "next/link";
import { LocalizedLink } from "@/components/navigation/LocalizedLink";
import { Heart, Mail, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/ui/google-icon";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      toast.success(t('auth.welcomeBack'));
      onOpenChange(false);
    } else {
      toast.error(result.error || t('auth.loginFailed'));
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    
    if (result.success) {
      toast.success(t('auth.welcome'));
      onOpenChange(false);
    } else {
      toast.error(result.error || t('auth.googleLoginFailed'));
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif">{t('auth.saveToFavorites')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('auth.signInToSave')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="modal-email">{t('auth.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="modal-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-password">{t('auth.password')}</Label>
              <LocalizedLink
                href="/forgot-password"
                onClick={() => onOpenChange(false)}
                className="text-xs text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </LocalizedLink>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="modal-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            {t('auth.or')}
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          {t('auth.continueWithGoogle')}
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {t('auth.noAccount')}{" "}
          <LocalizedLink
            href="/signup"
            onClick={() => onOpenChange(false)}
            className="text-primary hover:underline font-medium"
          >
            {t('auth.createOne')}
          </LocalizedLink>
        </p>
      </DialogContent>
    </Dialog>
  );
}
