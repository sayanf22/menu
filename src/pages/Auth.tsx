import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Check, Crown, Star, ArrowRight, ArrowLeft, CreditCard, Shield, User } from "lucide-react";
import { sanitizeInput, isValidEmail, resetRateLimit, checkRateLimit, RATE_LIMITS, validatePasswordStrength } from "@/lib/security";
import { useRazorpay } from "@/hooks/useRazorpay";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: unknown;
  max_images: number | null;
  bell_feature_enabled: boolean | null;
  plan_tier: number | null;
}

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpStep, setSignUpStep] = useState<'details' | 'plan'>('details');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  const { initiateRegistrationPayment, loading: paymentLoading } = useRazorpay();

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    restaurantName: "",
    restaurantDescription: "",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Check URL for recovery indicators and redirect to reset-password page
  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for recovery indicators in URL - redirect to dedicated reset page
    const hasRecoveryInHash = hash && (hash.includes('type=recovery') || hash.includes('type%3Drecovery'));
    const hasRecoveryInParams = urlParams.get('type') === 'recovery';
    
    if (hasRecoveryInHash || hasRecoveryInParams) {
      console.log('Recovery mode detected, redirecting to reset-password page');
      // Redirect to reset-password page with the same URL params/hash
      navigate('/reset-password' + window.location.search + window.location.hash);
      return;
    }
  }, [navigate]);

  // Main initialization effect - handles auth state and session check
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('Auth event:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        // Redirect to dedicated reset password page
        console.log('PASSWORD_RECOVERY event detected, redirecting to reset-password');
        navigate("/reset-password");
      } else if (event === 'SIGNED_IN') {
        console.log('SIGNED_IN, redirecting to dashboard');
        navigate("/dashboard");
      } else if (event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });
    
    const initialize = async () => {
      // Check for existing session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };
    
    initialize();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Check for plan parameter from pricing page
  useEffect(() => {
    const planId = searchParams.get('plan');
    const cycle = searchParams.get('cycle') as 'monthly' | 'yearly';
    
    if (planId) {
      setSelectedPlan(planId);
      if (cycle) setBillingCycle(cycle);
      // Auto switch to signup tab and fetch plans
      fetchPlans();
    }
  }, [searchParams]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('plan_tier', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setPlans([
        {
          id: 'basic',
          name: 'Basic',
          description: 'Perfect for small restaurants',
          price_monthly: 24900,
          price_yearly: 273900,
          features: ["Digital Menu with QR Code", "5 Menu Image Uploads", "Basic Analytics", "Email Support"],
          max_images: 5,
          bell_feature_enabled: false,
          plan_tier: 1
        },
        {
          id: 'standard',
          name: 'Standard',
          description: 'For growing restaurants with bell service',
          price_monthly: 39900,
          price_yearly: 438900,
          features: ["Everything in Basic", "15 Menu Image Uploads", "Bell Calling Feature", "Priority Support"],
          max_images: 15,
          bell_feature_enabled: true,
          plan_tier: 2
        }
      ]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const validateSignUpDetails = () => {
    if (!signUpData.email || !signUpData.password || !signUpData.restaurantName) {
      toast.error("Please fill in all required fields");
      return false;
    }

    if (!isValidEmail(signUpData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password strength validation
    const strength = validatePasswordStrength(signUpData.password);
    if (!strength.isStrong) {
      toast.error(`Weak password: ${strength.feedback.slice(0, 2).join(', ')}`);
      return false;
    }

    if (signUpData.restaurantName.length > 200) {
      toast.error("Restaurant name is too long (max 200 characters)");
      return false;
    }

    return true;
  };

  const handleContinueToPlans = async () => {
    if (!validateSignUpDetails()) return;

    setLoading(true);
    await fetchPlans();
    setSignUpStep('plan');
    setLoading(false);
  };

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    
    const sanitizedRestaurantName = sanitizeInput(signUpData.restaurantName);
    const sanitizedDescription = sanitizeInput(signUpData.restaurantDescription);

    // Reset rate limit before payment attempt
    resetRateLimit('signup');

    await initiateRegistrationPayment(
      {
        email: signUpData.email,
        password: signUpData.password,
        restaurantName: sanitizedRestaurantName,
        restaurantDescription: sanitizedDescription,
        planId: planId,
        billingCycle: billingCycle
      },
      () => {
        setSelectedPlan(null);
        toast.success("Account created successfully!");
        navigate('/dashboard');
      },
      (error) => {
        setSelectedPlan(null);
        console.error('Payment error:', error);
      }
    );
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(signInData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Rate limit check
    if (!checkRateLimit('login', RATE_LIMITS.login.maxRequests, RATE_LIMITS.login.windowMs)) {
      toast.error("Too many login attempts. Please wait a few minutes.");
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Rate limit check for password reset
    if (!checkRateLimit('passwordReset', RATE_LIMITS.passwordReset.maxRequests, RATE_LIMITS.passwordReset.windowMs)) {
      toast.error("Too many reset attempts. Please wait 10 minutes.");
      return;
    }
    
    setLoading(true);

    try {
      await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      toast.success("If an account exists, you'll receive a password reset link.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch {
      toast.success("If an account exists, you'll receive a password reset link.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(paise / 100);
  };

  if (loading && signUpStep === 'details' && !searchParams.get('plan')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/40 via-background to-amber-50/30 dark:from-slate-950 dark:via-background dark:to-orange-950/10 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className={`w-full shadow-2xl border border-border/50 rounded-3xl transition-all duration-300 ${signUpStep === 'plan' ? 'max-w-lg' : 'max-w-md'}`}>
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-amber-400/30 rounded-2xl blur-lg" />
              <img src="/favicon.png" alt="AddMenu Logo" className="relative w-14 h-14 rounded-2xl" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">AddMenu</CardTitle>
          <CardDescription>
            {signUpStep === 'plan' 
              ? 'Pick a plan that fits your business' 
              : 'Create your digital menu'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {signUpStep === 'plan' ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSignUpStep('details')}
                  className="-ml-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-full px-3 py-1.5">
                  <User className="w-3 h-3" />
                  <span className="font-medium text-foreground/80 truncate max-w-[160px]">{signUpData.email}</span>
                </div>
              </div>

              {/* Billing Toggle - segmented control */}
              <div className="flex justify-center">
                <div className="inline-flex items-center bg-muted rounded-full p-1 relative">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      billingCycle === 'monthly'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      billingCycle === 'yearly'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Yearly
                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>

              {loadingPlans ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading plans...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => {
                    const isStandard = plan.name.toLowerCase() === 'standard' || plan.name.toLowerCase().includes('plus') || plan.plan_tier === 2;
                    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
                    const monthlyEquivalent = billingCycle === 'yearly' && plan.price_yearly ? Math.round(plan.price_yearly / 12) : null;
                    const isSelected = selectedPlan === plan.id;
                    const features = (plan.features as string[]) || [];

                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                          isStandard
                            ? 'border-orange-300 dark:border-orange-700/60 shadow-lg shadow-orange-500/10 ring-1 ring-orange-200/50 dark:ring-orange-800/30'
                            : 'border-border hover:border-orange-200 dark:hover:border-orange-800/50 hover:shadow-md'
                        }`}
                      >
                        {isStandard && (
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-semibold text-center py-1 flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 fill-white" />
                            MOST POPULAR
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isStandard ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md' : 'bg-primary/10 text-primary'
                              }`}>
                                {isStandard ? <Crown className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                              </div>
                              <div>
                                <h3 className="font-bold text-base leading-tight">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {plan.max_images} images{plan.bell_feature_enabled ? ' · Bell service' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-baseline gap-0.5 justify-end">
                                <span className="text-2xl font-bold tracking-tight">{formatPrice(price || 0)}</span>
                                <span className="text-xs text-muted-foreground font-medium">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                              </div>
                              {monthlyEquivalent && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">≈ {formatPrice(monthlyEquivalent)}/mo</p>
                              )}
                            </div>
                          </div>

                          {billingCycle === 'yearly' && plan.price_yearly && (
                            <div className="flex items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400 font-medium mb-3 bg-green-50 dark:bg-green-950/30 rounded-lg px-2.5 py-1.5">
                              <Check className="w-3 h-3" />
                              1 month free — pay for 11, get 12
                            </div>
                          )}

                          <div className="space-y-2 mb-4">
                            {features.slice(0, 4).map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={() => !paymentLoading && handleSelectPlan(plan.id)}
                            className={`w-full rounded-xl h-11 font-semibold transition-all duration-300 ${
                              isStandard
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg'
                                : 'bg-foreground text-background hover:bg-foreground/90'
                            }`}
                            disabled={paymentLoading}
                          >
                            {isSelected && paymentLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Choose {plan.name}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pro plans available on the full platform */}
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">Need more power?</p>
                      <p className="text-[11px] text-muted-foreground">Categories, unlimited items & order management</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs flex-shrink-0"
                      onClick={() => window.open('https://addmenu.site/?mode=signup', '_blank')}
                    >
                      Pro Plans
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Secure via Razorpay
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span>7-day refund guarantee</span>
              </div>
            </div>
          ) : (
            <Tabs defaultValue={searchParams.get('plan') ? 'signup' : 'signin'} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                {!showForgotPassword ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@restaurant.com"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 text-xs h-auto"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showSignInPassword ? "text" : "password"}
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                        >
                          {showSignInPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@restaurant.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a password reset link
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Link
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={(e) => { e.preventDefault(); handleContinueToPlans(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-restaurant">Restaurant Name *</Label>
                    <Input
                      id="signup-restaurant"
                      placeholder="Your Restaurant"
                      value={signUpData.restaurantName}
                      onChange={(e) => setSignUpData({ ...signUpData, restaurantName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-description">Description</Label>
                    <Input
                      id="signup-description"
                      placeholder="Fine dining experience... (optional)"
                      value={signUpData.restaurantDescription}
                      onChange={(e) => setSignUpData({ ...signUpData, restaurantDescription: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@restaurant.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By signing up, you agree to our{" "}
                    <a href="/terms" className="underline hover:text-primary">Terms</a> and{" "}
                    <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate('/')} className="text-xs text-muted-foreground">
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
