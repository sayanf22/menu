import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';

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
      // First get the subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;
      
      if (subData) {
        // Then get the plan details
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('name, price_monthly, price_yearly')
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
      month: 'long',
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      pending: { variant: 'secondary', label: 'Pending' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      expired: { variant: 'destructive', label: 'Expired' },
      paused: { variant: 'outline', label: 'Paused' },
      halted: { variant: 'destructive', label: 'Payment Failed' },
    };
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isExpiringSoon = () => {
    if (!subscription?.current_period_end) return false;
    const endDate = new Date(subscription.current_period_end);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (showPlans) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setShowPlans(false)}>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            No Active Subscription
          </CardTitle>
          <CardDescription>
            Subscribe to a plan to unlock all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowPlans(true)} className="w-full">
            View Subscription Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </div>
          {getStatusBadge(subscription.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Current Plan</span>
            <span className="font-semibold">{subscription.plan?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Billing Cycle</span>
            <span className="capitalize">{subscription.billing_cycle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-semibold">
              {subscription.plan && formatPrice(
                subscription.billing_cycle === 'yearly'
                  ? subscription.plan.price_yearly
                  : subscription.plan.price_monthly
              )}
              /{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
            </span>
          </div>
        </div>

        {/* Billing Period */}
        <div className="flex items-start gap-3 p-4 border rounded-lg">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Current Billing Period</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </p>
          </div>
        </div>

        {/* Expiring Soon Warning */}
        {isExpiringSoon() && subscription.status === 'active' && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Subscription Expiring Soon</p>
              <p className="text-sm text-yellow-700">
                Your subscription will expire on {formatDate(subscription.current_period_end)}.
                Renew now to avoid service interruption.
              </p>
            </div>
          </div>
        )}

        {/* Active Status */}
        {subscription.status === 'active' && !isExpiringSoon() && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Subscription Active</p>
              <p className="text-sm text-green-700">
                Your subscription is active until {formatDate(subscription.current_period_end)}.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowPlans(true)}>
            {subscription.status === 'active' ? 'Change Plan' : 'Renew Subscription'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
