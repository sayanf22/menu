import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRazorpay } from '@/hooks/useRazorpay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Bell, Sparkles, Zap, Rocket, ExternalLink, Crown, Star, ArrowRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

// Full-screen loading overlay component for payment gateway
const PaymentLoadingOverlay = ({ isVisible, planName }: { isVisible: boolean; planName: string }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
          >
            {/* Animated payment icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              {/* Pulsing ring animation */}
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-orange-500/30 animate-ping" />
            </div>

            {/* Loading spinner */}
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>

            {/* Text content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Preparing Payment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Loading secure payment gateway for <span className="font-semibold text-orange-500">{planName}</span> plan...
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-orange-500"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-orange-500"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-orange-500"
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Please wait, do not close this window
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  max_images: number | null;
  bell_feature_enabled: boolean;
  plan_tier: number;
  isExternal?: boolean;
  externalUrl?: string;
  highlight?: boolean;
  icon: "star" | "zap" | "bell" | "rocket";
  gradientClass?: string;
}

const ALL_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for small restaurants",
    price_monthly: 24900,
    price_yearly: 273900, // 11 months price (1 month free)
    features: ["Digital Menu with QR Code", "5 Menu Image Uploads", "Basic Analytics", "Customer Feedback", "Social Media Links"],
    max_images: 5,
    bell_feature_enabled: false,
    plan_tier: 1,
    icon: "star"
  },
  {
    id: "standard",
    name: "Standard",
    description: "With bell service",
    price_monthly: 39900,
    price_yearly: 438900, // 11 months price (1 month free)
    features: ["Everything in Basic", "15 Menu Images", "Bell Calling Feature", "Call Service Feature", "Priority Support", "Advanced Analytics"],
    max_images: 15,
    bell_feature_enabled: true,
    plan_tier: 2,
    highlight: true,
    icon: "bell",
    gradientClass: "from-amber-500 to-orange-500"
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Menu with categories",
    price_monthly: 59900,
    price_yearly: 658900, // 11 months price (1 month free)
    features: ["Menu categories", "100 menu items", "Toggle availability", "Advanced Bell", "Dark/Light mode"],
    max_images: 100,
    bell_feature_enabled: true,
    plan_tier: 3,
    isExternal: true,
    externalUrl: "https://addmenu.site/?mode=signup&plan=advanced",
    icon: "zap",
    gradientClass: "from-blue-500 to-cyan-500"
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete ordering system",
    price_monthly: 99900,
    price_yearly: 1098900, // 11 months price (1 month free)
    features: ["Everything in Advanced", "Unlimited items", "Order management", "Order notifications", "Priority support"],
    max_images: null,
    bell_feature_enabled: true,
    plan_tier: 4,
    isExternal: true,
    externalUrl: "https://addmenu.site/?mode=signup&plan=premium",
    highlight: true,
    icon: "rocket",
    gradientClass: "from-purple-500 to-pink-500"
  }
];

interface SubscriptionPlansProps {
  showTitle?: boolean;
  compact?: boolean;
}

export const SubscriptionPlans = ({ showTitle = true, compact = false }: SubscriptionPlansProps) => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [dbPlans, setDbPlans] = useState<Map<string, string>>(new Map());
  const [dbPlanPrices, setDbPlanPrices] = useState<Map<string, { monthly: number; yearly: number | null }>>(new Map());
  const { initiatePayment, loading } = useRazorpay();

  useEffect(() => {
    checkUser();
    fetchDbPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();
      setHasActiveSubscription(!!subscription);
    }
  };

  const fetchDbPlans = async () => {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('id, name, price_monthly, price_yearly')
        .eq('is_active', true);
      if (data) {
        const planMap = new Map<string, string>();
        const priceMap = new Map<string, { monthly: number; yearly: number | null }>();
        data.forEach(p => {
          const nameLower = p.name.toLowerCase();
          if (nameLower === 'basic') {
            planMap.set('basic', p.id);
            priceMap.set('basic', { monthly: p.price_monthly, yearly: p.price_yearly });
          } else if (nameLower === 'standard' || nameLower.includes('plus')) {
            planMap.set('standard', p.id);
            priceMap.set('standard', { monthly: p.price_monthly, yearly: p.price_yearly });
          }
        });
        setDbPlans(planMap);
        setDbPlanPrices(priceMap);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (plan.isExternal && plan.externalUrl) {
      window.open(plan.externalUrl, '_blank');
      return;
    }
    const dbPlanId = dbPlans.get(plan.id);
    if (!dbPlanId) {
      toast.error('Plan not available');
      return;
    }
    if (!user) {
      navigate(`/auth?plan=${dbPlanId}&cycle=${billingCycle}`);
      return;
    }
    if (hasActiveSubscription) {
      toast.info('You already have an active subscription');
      navigate('/dashboard');
      return;
    }
    setSelectedPlan(plan.id);
    await initiatePayment(
      { planId: dbPlanId, billingCycle },
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

  const getIcon = (icon: string, className: string) => {
    switch (icon) {
      case "star": return <Star className={className} />;
      case "bell": return <Bell className={className} />;
      case "zap": return <Zap className={className} />;
      case "rocket": return <Rocket className={className} />;
      default: return <Star className={className} />;
    }
  };

  const getGradientStyle = (gradientClass?: string) => {
    if (!gradientClass) return {};
    if (gradientClass.includes("amber")) return { background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.05))' };
    if (gradientClass.includes("blue")) return { background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.05))' };
    if (gradientClass.includes("purple")) return { background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.05))' };
    return {};
  };

  // Get the selected plan name for the loading overlay
  const selectedPlanName = selectedPlan ? ALL_PLANS.find(p => p.id === selectedPlan)?.name || 'Selected' : '';

  return (
    <div className="w-full">
      {/* Full-screen loading overlay for payment gateway */}
      <PaymentLoadingOverlay isVisible={loading && !!selectedPlan} planName={selectedPlanName} />

      {showTitle && (
        <div className="text-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Choose Your Plan
          </motion.div>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">1 Month Free</Badge>
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {ALL_PLANS.map((plan, index) => {
          // Use database price if available, otherwise use hardcoded price
          const dbPrice = dbPlanPrices.get(plan.id);
          const price = billingCycle === 'yearly' 
            ? (dbPrice?.yearly || plan.price_yearly) 
            : (dbPrice?.monthly || plan.price_monthly);
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-5 h-full flex flex-col border-2 relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  plan.highlight ? 'border-transparent' : 'border-border hover:border-primary/30'
                }`}
                style={plan.highlight ? getGradientStyle(plan.gradientClass) : {}}
              >
                {plan.highlight && (
                  <div className="absolute top-3 right-3">
                    <Badge className={`text-xs text-white border-0 ${
                      plan.gradientClass?.includes("purple") 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}>
                      {plan.plan_tier === 4 ? <Rocket className="w-3 h-3 mr-1" /> : <Crown className="w-3 h-3 mr-1" />}
                      {plan.plan_tier === 4 ? 'Best Value' : 'Popular'}
                    </Badge>
                  </div>
                )}

                {plan.isExternal && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.gradientClass 
                        ? `bg-gradient-to-br ${plan.gradientClass} text-white`
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {getIcon(plan.icon, "w-5 h-5")}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{formatPrice(price || 0)}</span>
                      <span className="text-muted-foreground text-sm">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-500/10">
                          <Check className="w-2.5 h-2.5 text-green-500" />
                        </div>
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading && isSelected}
                  className={`w-full rounded-xl h-10 text-sm font-medium shadow-md transition-all duration-300 ${
                    plan.gradientClass
                      ? `bg-gradient-to-r ${plan.gradientClass} hover:opacity-90 text-white`
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isSelected && loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : plan.isExternal ? (
                    <>
                      Get {plan.name}
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
