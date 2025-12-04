import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRazorpay } from '@/hooks/useRazorpay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Bell, Image, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: unknown;
  is_active: boolean | null;
  max_images: number | null;
  bell_feature_enabled: boolean | null;
  plan_tier: number | null;
}

interface SubscriptionPlansProps {
  onSubscriptionSuccess?: () => void;
  compact?: boolean;
}

export const SubscriptionPlans = ({ onSubscriptionSuccess, compact = false }: SubscriptionPlansProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { initiatePayment, loading } = useRazorpay();

  useEffect(() => {
    fetchPlans();
  }, []);

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
      toast.error('Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    await initiatePayment(
      { planId, billingCycle },
      () => {
        setSelectedPlan(null);
        onSubscriptionSuccess?.();
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

  if (loadingPlans) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1 bg-muted/80 backdrop-blur rounded-full border border-border/50">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              -17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className={`grid gap-6 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 max-w-3xl mx-auto'}`}>
        {plans.map((plan, index) => {
          const isBasicPlus = plan.bell_feature_enabled || plan.plan_tier === 2;
          const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
          const isSelected = selectedPlan === plan.id;
          const monthlyEquivalent = billingCycle === 'yearly' && plan.price_yearly 
            ? Math.round(plan.price_yearly / 12) 
            : null;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                isBasicPlus
                  ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/20 border-2 border-amber-200/60 dark:border-amber-800/40 shadow-lg shadow-amber-500/10'
                  : 'bg-card border border-border hover:border-primary/30 hover:shadow-md'
              }`}
            >
              {/* Popular Badge */}
              {isBasicPlus && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md px-3">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isBasicPlus 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {isBasicPlus ? <Bell className="w-5 h-5" /> : <Image className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {plan.max_images} images{plan.bell_feature_enabled ? ' + Bell' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{formatPrice(price)}</span>
                  <span className="text-muted-foreground text-sm">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {monthlyEquivalent && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ {formatPrice(monthlyEquivalent)}/month
                  </p>
                )}
                {billingCycle === 'yearly' && plan.price_yearly && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                    Save {formatPrice((plan.price_monthly * 12) - plan.price_yearly)}/year
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {(plan.features as string[])?.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isBasicPlus ? 'bg-amber-500/20' : 'bg-primary/10'
                    }`}>
                      <Check className={`w-2.5 h-2.5 ${isBasicPlus ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className={`w-full h-11 rounded-xl font-medium transition-all ${
                  isBasicPlus
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isSelected && loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Get ${plan.name}`
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-6 pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secure Payment
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Cancel Anytime
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Razorpay Powered
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
