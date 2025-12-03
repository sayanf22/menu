import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRazorpay } from '@/hooks/useRazorpay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: unknown;
  is_active: boolean | null;
}

interface SubscriptionPlansProps {
  onSubscriptionSuccess?: () => void;
}

export const SubscriptionPlans = ({ onSubscriptionSuccess }: SubscriptionPlansProps) => {
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
        .order('name', { ascending: true }); // Basic comes before Premium alphabetically

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
        <div className="inline-flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">Save 17%</Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => {
          const isPremium = index === 1;
          const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`p-8 relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                isPremium
                  ? 'border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5'
                  : 'border-2 hover:border-primary/30'
              }`}
            >
              {isPremium && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isPremium ? 'bg-gradient-to-br from-primary to-accent' : 'bg-primary/10'
                }`}>
                  {isPremium ? (
                    <Crown className="w-6 h-6 text-white" />
                  ) : (
                    <Star className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{formatPrice(price)}</span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 mt-1">
                    Save {formatPrice((plan.price_monthly * 12) - plan.price_yearly)} per year
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {(plan.features as string[]).map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isPremium ? 'bg-primary/10' : 'bg-green-500/10'
                    }`}>
                      <Check className={`w-3 h-3 ${isPremium ? 'text-primary' : 'text-green-500'}`} />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className={`w-full h-12 rounded-full ${
                  isPremium
                    ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                    : ''
                }`}
              >
                {isSelected && loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
