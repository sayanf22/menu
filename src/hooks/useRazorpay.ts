import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Force module reload

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://owibhiiwghyznptfgfcr.supabase.co";
// Use anon key (JWT format) for Edge Functions that have verify_jwt: true
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // FOR NEW USER REGISTRATION - payment before account creation
  const initiateRegistrationPayment = useCallback(async (
    params: {
      email: string;
      password: string;
      restaurantName: string;
      restaurantDescription?: string;
      planId: string;
      billingCycle: "monthly" | "yearly";
    },
    onSuccess?: (data: any) => void,
    onFailure?: (error: any) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway");

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-registration-subscription`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          },
          body: JSON.stringify({
            email: params.email,
            password: params.password,
            restaurant_name: params.restaurantName,
            restaurant_description: params.restaurantDescription || "",
            plan_id: params.planId,
            billing_cycle: params.billingCycle,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Failed to create subscription");

      const rzp = new window.Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: "AddMenu",
        description: `${data.plan_name} Plan`,
        prefill: { name: params.restaurantName, email: params.email },
        theme: { color: "#f97316" },
        handler: async (res: RazorpayResponse) => {
          try {
            const verifyResponse = await fetch(
              `${SUPABASE_URL}/functions/v1/verify-registration-payment`,
              {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json", 
                  "apikey": SUPABASE_KEY,
                  "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({
                  razorpay_subscription_id: res.razorpay_subscription_id,
                  razorpay_payment_id: res.razorpay_payment_id,
                  razorpay_signature: res.razorpay_signature,
                  email: params.email,
                  password: params.password,
                }),
              }
            );
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || verifyData.error) throw new Error(verifyData.error || "Verification failed");
            if (verifyData.session) await supabase.auth.setSession(verifyData.session);
            toast.success("Account created!");
            onSuccess?.(verifyData);
          } catch (err: any) {
            toast.error(err.message);
            onFailure?.(err);
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => { setLoading(false); toast.info("Payment cancelled"); } },
      });
      rzp.on("payment.failed", (res: any) => { setLoading(false); toast.error(res.error.description); onFailure?.(res.error); });
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      onFailure?.(err);
      setLoading(false);
    }
  }, []);


  // FOR EXISTING USERS - subscription payment
  const initiatePayment = useCallback(async (
    params: { planId: string; billingCycle: "monthly" | "yearly" },
    onSuccess?: (data: any) => void,
    onFailure?: (error: any) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please login to continue");

      const response = await supabase.functions.invoke("create-razorpay-subscription", {
        body: { plan_id: params.planId, billing_cycle: params.billingCycle },
      });
      if (response.error) throw new Error(response.error.message);
      const data = response.data;

      const rzp = new window.Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: "AddMenu",
        description: `${data.plan_name} Plan`,
        prefill: { name: data.user_name || "", email: data.user_email || "" },
        theme: { color: "#f97316" },
        handler: async (res: RazorpayResponse) => {
          try {
            const verifyRes = await supabase.functions.invoke("verify-razorpay-subscription", {
              body: {
                razorpay_subscription_id: res.razorpay_subscription_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
                plan_id: params.planId,
                billing_cycle: params.billingCycle,
              },
            });
            if (verifyRes.error) throw new Error(verifyRes.error.message);
            toast.success("Subscription activated!");
            onSuccess?.(verifyRes.data);
          } catch (err: any) {
            toast.error(err.message);
            onFailure?.(err);
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.on("payment.failed", (res: any) => { setLoading(false); toast.error(res.error.description); onFailure?.(res.error); });
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      onFailure?.(err);
      setLoading(false);
    }
  }, []);

  return { initiateRegistrationPayment, initiatePayment, loading, error };
}
