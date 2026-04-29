"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useLocalePath } from '@/hooks/useLocalePath';
import { buildAbsoluteAppUrl } from '@/lib/authRedirect';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError(t('auth.emailRequired'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAbsoluteAppUrl(l("/auth/reset-password")),
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href={l("/")} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-sans">{t('auth.backToHome')}</span>
          </Link>
          
          <div className="space-y-6">
            <h1 className="font-serif text-hero font-medium text-foreground leading-tight">
              {t('auth.resetYour')}<br />
              <span className="text-gradient-gold">{t('auth.password')}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              {t('auth.forgotPasswordSubtitle')}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">{t('auth.securityTips')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t('auth.securityTip1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t('auth.securityTip2')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t('auth.securityTip3')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile back link */}
          <Link 
            href={l("/login")} 
            className="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('auth.backToLogin')}</span>
          </Link>

          <Card className="premium-card border-border/50">
            <CardHeader className="space-y-1 pb-6">
              <div className="lg:hidden mb-4">
                <h1 className="font-serif text-2xl text-gradient-gold">AlgarveOfficial</h1>
              </div>
              <CardTitle className="font-serif text-2xl">{t('auth.forgotPassword')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('auth.forgotPasswordDescription')}
              </CardDescription>
            </CardHeader>
            
            {success ? (
              <CardContent className="space-y-4">
                <Alert className="border-primary/50 bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-foreground">
                    {t('auth.resetEmailSent')}
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                  {t('auth.checkEmailInstructions')}
                </p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href={l("/login")}>{t('auth.backToLogin')}</Link>
                </Button>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-background border-border focus:border-primary"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.sending')}
                      </>
                    ) : (
                      t('auth.sendResetLink')
                    )}
                  </Button>
                  
                  <p className="text-sm text-center text-muted-foreground">
                    {t('auth.rememberPassword')}{' '}
                    <Link href={l("/login")} className="text-primary hover:underline font-medium">
                      {t('auth.signIn')}
                    </Link>
                  </p>
                </CardFooter>
              </form>
            )}
          </Card>
        </m.div>
      </div>
    </div>
  );
}
