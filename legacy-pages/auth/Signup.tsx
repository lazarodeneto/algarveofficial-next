"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, Lock, User, CheckCircle, Globe } from 'lucide-react';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocalePath } from '@/hooks/useLocalePath';

export default function Signup() {
  const { t } = useTranslation();
  const { signup, loginWithGoogle, isLoading, isAuthenticated, user, getDashboardPath } = useAuth();
  const router = useRouter();
  const l = useLocalePath();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignup = async () => {
    setError('');
    setSuccessMessage('');
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();
    // Don't set isGoogleLoading to false - OAuth will redirect
    if (!result.success && result.error) {
      setIsGoogleLoading(false);
      setError(result.error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [getDashboardPath, isAuthenticated, router, user]);

  if (isAuthenticated && user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!firstName || !lastName || !email || !password) {
      setError(t('common.fillRequiredFields'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }
    
    setIsSubmitting(true);
    const result = await signup(email, password, firstName, lastName);
    setIsSubmitting(false);
    
    if (!result.success && result.error) {
      setError(result.error);
    } else if (result.success && result.error) {
      // Success with message (e.g., email confirmation required)
      setSuccessMessage(result.error);
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
              {t('auth.join')}<br />
              <span className="text-gradient-gold">AlgarveOfficial</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              {t('auth.signUpHeroSubtitle')}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">{t('auth.memberBenefits')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t('auth.benefit1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t('auth.benefit2')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t('auth.benefit3')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t('auth.benefit4')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile back link */}
          <Link 
            href={l("/")} 
            className="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('auth.backToHome')}</span>
          </Link>

          <Card className="premium-card border-border/50">
            <CardHeader className="space-y-1 pb-6">
              <div className="lg:hidden mb-4">
                <h1 className="font-serif text-2xl text-gradient-gold">AlgarveOfficial</h1>
              </div>
              <CardTitle className="font-serif text-2xl">{t('auth.createAccount')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('auth.signUpSubtitle')}
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="border-primary/50 bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-foreground">{successMessage}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">{t('auth.firstName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder={t('auth.firstNamePlaceholder')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10 bg-background border-border focus:border-primary"
                        disabled={isSubmitting || isGoogleLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">{t('auth.lastName')}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t('auth.lastNamePlaceholder')}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                      disabled={isSubmitting || isGoogleLoading}
                    />
                  </div>
                </div>
                
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
                      disabled={isSubmitting || isGoogleLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-background border-border focus:border-primary"
                      disabled={isSubmitting || isGoogleLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('auth.passwordReq1')}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">{t('auth.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-background border-border focus:border-primary"
                      disabled={isSubmitting || isGoogleLoading}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={isSubmitting || isGoogleLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.signingUp')}
                    </>
                  ) : (
                    t('auth.createAccount')
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('auth.orContinueWith')}</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-border hover:bg-accent"
                  onClick={handleGoogleSignup}
                  disabled={isLoading || isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="mr-2 h-4 w-4" />
                  )}
                  {t('auth.continueWithGoogle')}
                </Button>
                
                <p className="text-sm text-center text-muted-foreground">
                  {t('auth.haveAccount')}{' '}
                  <Link href={l("/login")} className="text-primary hover:underline font-medium">
                    {t('auth.signIn')}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </m.div>
      </div>
    </div>
  );
}
