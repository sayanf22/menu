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
import { Loader2, Eye, EyeOff, Check, Crown, Star, ArrowRight, ArrowLeft, CreditCard } from "lucide-react";
import { sanitizeInput, isValidEmail, resetRateLimit } from "@/lib/security";
import { useRazorpay } from "@/hooks/useRazorpay";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: any;
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
  
  const razorpayHook = useRazorpay();
  console.log("useRazorpay returned:", razorpayHook);
  const { initiateRegistrationPayment, loading: paymentLoading } = razorpayHook;

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

  useEffect(() => {
    const checkSession = async () => {
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
    checkSession();
  }, [navigate]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true }); // Basic comes before Premium alphabetically

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setPlans([
        {
          id: 'basic',
          name: 'Basic',
          description: 'Perfect for small restaurants',
          price_monthly: 200,
          price_yearly: 2000,
          features: ["Digital Menu with QR Code", "Upload Menu Images", "Basic Analytics", "Email Support"]
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'For growing businesses',
          price_monthly: 200,
          price_yearly: 2000,
          features: ["Everything in Basic", "Online Ordering", "WhatsApp Integration", "Priority Support"]
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

    if (signUpData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
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
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
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
    
    setLoading(true);

    try {
      await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      toast.success("If an account exists, you'll receive a password reset link.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center mb-4">
            <img src="/favicon.png" alt="AddMenu Logo" className="w-14 h-14" />
          </div>
          <CardTitle className="text-2xl font-bold">AddMenu</CardTitle>
          <CardDescription>
            {signUpStep === 'plan' ? 'Select a plan to continue' : 'Create your digital menu'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {signUpStep === 'plan' ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSignUpStep('details')}
                className="mb-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-center">
                  <span className="text-muted-foreground">Account: </span>
                  <span className="font-medium">{signUpData.email}</span>
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center bg-muted rounded-full p-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                      billingCycle === 'yearly'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Yearly
                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">-17%</Badge>
                  </button>
                </div>
              </div>

              {loadingPlans ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan, index) => {
                    const isPremium = plan.name.toLowerCase() === 'premium' || index === 1;
                    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
                    const isSelected = selectedPlan === plan.id;
                    const features = (plan.features as string[]) || [];

                    return (
                      <div
                        key={plan.id}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                          isPremium 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        } ${isSelected && paymentLoading ? 'opacity-75' : ''}`}
                        onClick={() => !paymentLoading && handleSelectPlan(plan.id)}
                      >
                        {isPremium && (
                          <Badge className="absolute -top-2 right-3 bg-primary text-[10px]">
                            Popular
                          </Badge>
                        )}
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isPremium ? 'bg-primary' : 'bg-primary/10'
                            }`}>
                              {isPremium ? (
                                <Crown className="w-4 h-4 text-white" />
                              ) : (
                                <Star className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">{plan.name}</h3>
                              <p className="text-xs text-muted-foreground">{plan.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatPrice(price || 0)}</div>
                            <div className="text-xs text-muted-foreground">
                              /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {features.slice(0, 4).map((feature, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className={`w-full ${isPremium ? '' : 'bg-primary/90'}`}
                          size="sm"
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
                              Pay & Create Account
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground pt-2">
                🔒 Secure payment via Razorpay • 7-day refund guarantee
              </p>
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
