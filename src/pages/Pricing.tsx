import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowRight, MessageCircle, Sparkles, Star, Zap, Shield, Users, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRazorpay } from "@/hooks/useRazorpay";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  max_images: number | null;
  bell_feature_enabled: boolean | null;
  plan_tier: number | null;
}

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const { initiatePayment, loading } = useRazorpay();

  useEffect(() => {
    fetchPlans();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    
    if (session?.user) {
      // Check if user has active subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();
      
      setHasActiveSubscription(!!subscription);
    }
  };

  const fetchPlans = async () => {
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
          price_yearly: 249000,
          features: ["Digital Menu with QR Code", "5 Menu Image Uploads", "Basic Analytics Dashboard", "Customer Feedback Collection", "Social Media Links", "Unlimited Menu Updates", "Email Support"],
          max_images: 5,
          bell_feature_enabled: false,
          plan_tier: 1
        },
        {
          id: 'basic-plus',
          name: 'Basic Plus',
          description: 'For growing restaurants with bell service',
          price_monthly: 36900,
          price_yearly: 369000,
          features: ["Everything in Basic", "10 Menu Image Uploads", "Bell Calling Feature", "Priority Customer Support", "Advanced Analytics", "Custom Branding Options"],
          max_images: 10,
          bell_feature_enabled: true,
          plan_tier: 2
        }
      ]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    // If not logged in, redirect to auth with plan info
    if (!user) {
      navigate(`/auth?plan=${planId}&cycle=${billingCycle}`);
      return;
    }

    // If already has active subscription
    if (hasActiveSubscription) {
      toast.info('You already have an active subscription');
      navigate('/dashboard');
      return;
    }

    // Existing user without subscription - initiate payment
    setSelectedPlan(planId);
    await initiatePayment(
      { planId, billingCycle },
      () => {
        setSelectedPlan(null);
        toast.success('Subscription activated!');
        setTimeout(() => navigate('/dashboard'), 1500);
      },
      () => setSelectedPlan(null)
    );
  };

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <>
      <Helmet>
        <title>AddMenu Pricing | Digital Menu QR Code Subscription Plans</title>
        <meta name="description" content="Choose the perfect AddMenu subscription plan. Affordable pricing for restaurants. 7-day money-back guarantee. Start your digital menu today!" />
        <meta name="keywords" content="addmenu pricing, digital menu pricing, QR menu cost, restaurant menu pricing, addmenu subscription" />
        <link rel="canonical" href="https://addmenu.in/pricing" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 px-4 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent/10 to-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
            </div>
            
            <div className="container mx-auto max-w-4xl text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Simple & Transparent Pricing
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Choose Your <span className="text-primary">Plan</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Start with any plan. 7-day money-back guarantee. Cancel anytime.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center bg-muted rounded-full p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">Save 17%</Badge>
                </button>
              </div>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="py-12 px-4 relative">
            <div className="container mx-auto max-w-4xl">
              {loadingPlans ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {plans.map((plan) => {
                    const isBasicPlus = plan.name.toLowerCase().includes('plus') || plan.plan_tier === 2;
                    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
                    const isSelected = selectedPlan === plan.id;
                    const features = (plan.features as string[]) || [];

                    return (
                      <Card
                        key={plan.id}
                        className={`p-6 border-2 relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg ${
                          isBasicPlus
                            ? 'border-primary bg-gradient-to-br from-primary/5 via-background to-accent/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        {isBasicPlus && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Bell Feature
                            </Badge>
                          </div>
                        )}

                        <div className="relative">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isBasicPlus ? 'bg-gradient-to-br from-primary to-accent' : 'bg-primary/10'
                            }`}>
                              {isBasicPlus ? (
                                <Crown className="w-5 h-5 text-white" />
                              ) : (
                                <Star className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{plan.name}</h3>
                              <p className="text-sm text-muted-foreground">{plan.max_images} images{plan.bell_feature_enabled ? ' + Bell Calling' : ''}</p>
                            </div>
                          </div>

                          <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold">{formatPrice(price || 0)}</span>
                              <span className="text-muted-foreground">
                                /{billingCycle === 'yearly' ? 'year' : 'month'}
                              </span>
                            </div>
                            {billingCycle === 'yearly' && plan.price_yearly && plan.price_monthly && (
                              <p className="text-sm text-green-600 mt-1">
                                Save {formatPrice((plan.price_monthly * 12) - plan.price_yearly)} per year
                              </p>
                            )}
                          </div>

                          <div className="space-y-3 mb-6">
                            {features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isBasicPlus ? 'bg-primary/10' : 'bg-green-500/10'
                                }`}>
                                  <Check className={`w-2.5 h-2.5 ${isBasicPlus ? 'text-primary' : 'text-green-500'}`} />
                                </div>
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={loading}
                            className={`w-full rounded-full h-11 shadow-md transition-all duration-300 ${
                              isBasicPlus
                                ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                                : 'bg-primary hover:bg-primary/90'
                            }`}
                          >
                            {isSelected && loading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Get Started
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Features Comparison */}
          <section className="py-12 px-4 bg-muted/30">
            <div className="container mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-center mb-8">
                Compare <span className="text-primary">Features</span>
              </h2>
              
              <div className="bg-card rounded-2xl border overflow-hidden">
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 font-semibold text-sm">
                  <div>Feature</div>
                  <div className="text-center">Basic</div>
                  <div className="text-center text-primary">Basic Plus</div>
                </div>
                
                {[
                  { feature: "Digital QR Menu", basic: true, basicPlus: true },
                  { feature: "Menu Image Uploads", basic: "5", basicPlus: "10" },
                  { feature: "Basic Analytics", basic: true, basicPlus: true },
                  { feature: "Customer Feedback", basic: true, basicPlus: true },
                  { feature: "Social Media Links", basic: true, basicPlus: true },
                  { feature: "Unlimited Updates", basic: true, basicPlus: true },
                  { feature: "Bell Calling Feature", basic: false, basicPlus: true },
                  { feature: "Advanced Analytics", basic: false, basicPlus: true },
                  { feature: "Custom Branding", basic: false, basicPlus: true },
                  { feature: "Priority Support", basic: false, basicPlus: true },
                ].map((row, i) => (
                  <div key={i} className={`grid grid-cols-3 gap-4 p-3 text-sm ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <div>{row.feature}</div>
                    <div className="text-center">
                      {typeof row.basic === 'string' ? (
                        <span className="font-medium">{row.basic}</span>
                      ) : row.basic ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="text-center">
                      {typeof row.basicPlus === 'string' ? (
                        <span className="font-medium text-primary">{row.basicPlus}</span>
                      ) : row.basicPlus ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold text-center mb-8">
                Why Choose <span className="text-primary">AddMenu</span>?
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Zap, title: "Quick Setup", desc: "Under 5 minutes" },
                  { icon: Shield, title: "Secure", desc: "Razorpay powered" },
                  { icon: Users, title: "Support", desc: "Local assistance" },
                  { icon: Star, title: "Guarantee", desc: "7-day refund" },
                ].map((item, i) => (
                  <Card key={i} className="p-4 text-center hover:shadow-lg transition-all duration-300 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 px-4 mx-4 bg-gradient-to-r from-primary to-accent rounded-2xl my-6">
            <div className="container mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-white">Ready to Get Started?</h2>
              <p className="text-white/80 mb-6">
                Join restaurants using AddMenu
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg" 
                  className="h-12 px-6 rounded-full bg-white text-primary hover:bg-white/90"
                  onClick={() => window.open('https://wa.me/917005832798', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="h-12 px-6 rounded-full border-2 border-white text-white hover:bg-white/10">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
