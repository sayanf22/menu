import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    restaurantName: "",
    restaurantDescription: "",
    signupCode: "",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.email || !signUpData.password || !signUpData.restaurantName || !signUpData.signupCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (signUpData.signupCode.length !== 12) {
      toast.error("Signup code must be exactly 12 characters (10 digits + 2 letters)");
      return;
    }

    if (!/^[A-Z0-9]{12}$/.test(signUpData.signupCode.toUpperCase())) {
      toast.error("Signup code must contain only numbers and letters");
      return;
    }

    setLoading(true);

    try {
      // First validate the signup code BEFORE creating the account
      const { data: validateData, error: validateError } = await supabase.functions.invoke(
        'validate-signup',
        {
          body: { signupCode: signUpData.signupCode.toUpperCase() }
        }
      );

      if (validateError || !validateData?.valid) {
        toast.error("Invalid signup code. Please check your code and try again.");
        setLoading(false);
        return;
      }

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("Failed to create user");

      // If email confirmation is disabled, the user will be signed in immediately
      // If email confirmation is enabled, we need to wait for confirmation
      if (authData.session) {
        // User is signed in immediately, create profile using the function
        const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: authData.user.id,
          restaurant_name: signUpData.restaurantName,
          restaurant_description: signUpData.restaurantDescription || ""
        });

        if (profileError || !profileResult?.success) {
          console.error('Profile creation error:', profileError || profileResult);
          
          // Try to sign out the user if profile creation failed
          await supabase.auth.signOut();
          
          const errorMessage = profileResult?.error || profileError?.message || "Unknown error";
          toast.error(`Failed to create restaurant profile: ${errorMessage}`);
          setLoading(false);
          return;
        }

        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        // Email confirmation required - show instructions
        toast.success("Account created! Please check your email to confirm your account, then return to sign in.");
        
        // Clear the form
        setSignUpData({
          email: "",
          password: "",
          restaurantName: "",
          restaurantDescription: "",
          signupCode: "",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.error(error.message || "Error signing in");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Error sending reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--gradient-hero)] p-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">MenuQR</CardTitle>
          <CardDescription className="text-center">
            Create your digital menu in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
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
                        className="px-0 text-sm"
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
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
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
                    We'll send you a link to reset your password
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
                      Send Reset Link
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-restaurant">Restaurant Name</Label>
                  <Input
                    id="signup-restaurant"
                    placeholder="Your Restaurant"
                    value={signUpData.restaurantName}
                    onChange={(e) => setSignUpData({ ...signUpData, restaurantName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-description">Description (Optional)</Label>
                  <Input
                    id="signup-description"
                    placeholder="Fine dining experience..."
                    value={signUpData.restaurantDescription}
                    onChange={(e) =>
                      setSignUpData({ ...signUpData, restaurantDescription: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
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
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignUpPassword ? "text" : "password"}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                <div className="space-y-2">
                  <Label htmlFor="signup-code">
                    Signup Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="signup-code"
                    type="text"
                    placeholder="Enter your 12-character code"
                    value={signUpData.signupCode}
                    onChange={(e) => setSignUpData({ ...signUpData, signupCode: e.target.value.replace(/[^A-Z0-9]/gi, '').slice(0, 12).toUpperCase() })}
                    maxLength={12}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact us to receive your signup code
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
