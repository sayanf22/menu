import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2, Crown, ArrowRight, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { motion } from 'framer-motion';

interface Subscription {
  id: string;
  status: string;
  billing_cycle: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  plan: {
    name: string;
    price_monthly: number;
    price_yearly: number | null;
    max_images: number | null;
    bell_feature_enabled: boolean | null;
    plan_tier: number | null;
  } | null;
}

interface SubscriptionStatusProps {
  userId: string;
}

export const SubscriptionStatus = ({ userId }: SubscriptionStatusProps) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;
      
      if (subData) {
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('name, price_monthly, price_yearly, max_images, bell_feature_enabled, plan_tier')
          .eq('id', subData.plan_id)
          .single();

        setSubscription({
          ...subData,
          plan: planData || null
        });
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(paise / 100);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; label: string }> = {
      active: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Active' },
      pending: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending' },
      cancelled: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Cancelled' },
      expired: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Expired' },
      halted: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Payment Failed' },
    };
    return configs[status] || { color: 'text-gray-700', bg: 'bg-gray-100', label: status };
  };

  const getDaysRemaining = () => {
    if (!subscription?.current_period_end) return null;
    const endDate = new Date(subscription.current_period_end);
    const days = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const isBasicPlan = subscription?.plan?.plan_tier === 1 || !subscription?.plan?.bell_feature_enabled;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (showPlans) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setShowPlans(false)} className="mb-2">
          ← Back to Subscription
        </Button>
        <SubscriptionPlans
          onSubscriptionSuccess={() => {
            setShowPlans(false);
            fetchSubscription();
            toast.success('Subscription updated successfully!');
          }}
        />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Subscribe to a plan to unlock all features and make your menu visible to customers.
          </p>
          <Button onClick={() => setShowPlans(true)} size="lg" className="rounded-full px-8">
            View Plans
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = getStatusConfig(subscription.status);
  const daysRemaining = getDaysRemaining();

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </div>
            <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0`}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              subscription.plan?.bell_feature_enabled 
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                : 'bg-primary/10 text-primary'
            }`}>
              {subscription.plan?.bell_feature_enabled ? (
                <Bell className="w-6 h-6" />
              ) : (
                <CreditCard className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{subscription.plan?.name || 'Unknown Plan'}</h4>
              <p className="text-sm text-muted-foreground">
                {subscription.plan?.max_images} images
                {subscription.plan?.bell_feature_enabled && ' • Bell Feature'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {subscription.plan && formatPrice(
                  subscription.billing_cycle === 'yearly'
                    ? subscription.plan.price_yearly || 0
                    : subscription.plan.price_monthly
                )}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                /{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
              </p>
            </div>
          </div>

          {/* Billing Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Started</span>
              </div>
              <p className="font-medium">{formatDate(subscription.current_period_start!)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Expires</span>
              </div>
              <p className="font-medium">{formatDate(subscription.current_period_end!)}</p>
            </div>
          </div>

          {/* Days Remaining */}
          {daysRemaining !== null && subscription.status === 'active' && (
            <div className={`p-4 rounded-xl ${
              daysRemaining <= 7 
                ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800' 
                : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-center gap-3">
                {daysRemaining <= 7 ? (
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    daysRemaining <= 7 
                      ? 'text-orange-900 dark:text-orange-100' 
                      : 'text-green-900 dark:text-green-100'
                  }`}>
                    {daysRemaining <= 0 
                      ? 'Subscription expired' 
                      : `${daysRemaining} days remaining`}
                  </p>
                  <p className={`text-sm ${
                    daysRemaining <= 7 
                      ? 'text-orange-700 dark:text-orange-300' 
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {daysRemaining <= 7 && daysRemaining > 0
                      ? 'Renew soon to avoid service interruption'
                      : daysRemaining <= 0 
                        ? 'Please renew to continue using all features'
                        : 'Your subscription is active'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setShowPlans(true)}
            >
              {subscription.status === 'active' ? 'Change Plan' : 'Renew'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Card - Only show for Basic plan users */}
      {isBasicPlan && subscription.status === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/20 border-amber-200/60 dark:border-amber-800/40">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Upgrade to Basic Plus</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the Bell Calling feature and let customers call for service directly from their table.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge variant="secondary" className="bg-white/60 dark:bg-white/10">
                      <Bell className="w-3 h-3 mr-1" />
                      Bell Calling
                    </Badge>
                    <Badge variant="secondary" className="bg-white/60 dark:bg-white/10">
                      10 Images
                    </Badge>
                    <Badge variant="secondary" className="bg-white/60 dark:bg-white/10">
                      Priority Support
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => setShowPlans(true)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    Upgrade Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
