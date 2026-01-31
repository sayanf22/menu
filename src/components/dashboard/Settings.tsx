import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Edit, Upload, X, Bell, BellOff, Crown, Lock, KeyRound, Eye, EyeOff, Phone, PhoneOff, User, Shield } from "lucide-react";
import { compressImage, COMPRESSION_PRESETS, getCompressionStats } from "@/lib/image-compression";
import { useRazorpay } from "@/hooks/useRazorpay";
import { checkRateLimit, RATE_LIMITS, validatePasswordStrength } from "@/lib/security";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SettingsProps {
  restaurantId: string;
  onProfileUpdate?: (profile: Record<string, unknown>) => void;
}

interface StandardPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
}

const Settings = ({ restaurantId, onProfileUpdate }: SettingsProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [hasBellAccess, setHasBellAccess] = useState<boolean | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [standardPlan, setStandardPlan] = useState<StandardPlan | null>(null);
  const { initiatePayment, loading: paymentLoading } = useRazorpay();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    restaurant_name: "",
    restaurant_description: "",
    logo_url: "",
    bell_service_enabled: true,
    call_service_enabled: false,
    call_phone_number: "",
    business_type: "restaurant" as "hotel" | "restaurant",
  });
  
  const [bellServiceSaving, setBellServiceSaving] = useState(false);
  const [callServiceSaving, setCallServiceSaving] = useState(false);
  const [phoneNumberSaving, setPhoneNumberSaving] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkBellAccess();
    fetchStandardPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const checkBellAccess = async () => {
    try {
      const { data, error } = await supabase.rpc("check_bell_feature_access", {
        p_user_id: restaurantId
      });
      setHasBellAccess(error ? false : data === true);
    } catch {
      setHasBellAccess(false);
    }
  };

  const fetchStandardPlan = async () => {
    try {
      const { data } = await supabase
        .from("subscription_plans")
        .select("id, name, price_monthly, price_yearly")
        .eq("bell_feature_enabled", true)
        .eq("is_active", true)
        .single();
      if (data) {
        setStandardPlan(data as StandardPlan);
      }
    } catch (error) {
      console.error("Error fetching Standard plan:", error);
    }
  };

  const handleUpgrade = async (billingCycle: 'monthly' | 'yearly') => {
    if (!standardPlan) {
      toast.error("Plan not found. Please try again.");
      return;
    }
    
    await initiatePayment(
      { planId: standardPlan.id, billingCycle },
      () => {
        setShowUpgradeDialog(false);
        setHasBellAccess(true);
        toast.success("Upgraded to Standard! Bell feature is now available.");
        window.location.reload();
      },
      () => {
        toast.error("Payment failed. Please try again.");
      }
    );
  };

  const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("restaurant_name, restaurant_description, logo_url, bell_service_enabled, call_service_enabled, call_phone_number, business_type")
        .eq("id", restaurantId)
        .single();

      if (error) throw error;

      if (data) {
        const profileData = data as Record<string, unknown>;
        setProfile({
          restaurant_name: profileData.restaurant_name as string || "",
          restaurant_description: profileData.restaurant_description as string || "",
          logo_url: profileData.logo_url as string || "",
          bell_service_enabled: profileData.bell_service_enabled !== false,
          call_service_enabled: profileData.call_service_enabled === true,
          call_phone_number: profileData.call_phone_number as string || "",
          business_type: (profileData.business_type as "hotel" | "restaurant") || "restaurant",
        });
        if (profileData.logo_url) {
          setLogoPreview(profileData.logo_url as string);
        }
        setTempPhoneNumber(profileData.call_phone_number as string || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo must be less than 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return profile.logo_url || null;

    setUploading(true);
    try {
      if (logoFile.size > 150 * 1024) {
        setCompressing(true);
        setCompressionProgress(0);
      }
      
      const compressionResult = await compressImage(logoFile, {
        ...COMPRESSION_PRESETS.logo,
        onProgress: (progress) => setCompressionProgress(Math.round(progress)),
      });
      
      setCompressing(false);
      setCompressionProgress(100);
      
      if (compressionResult.wasCompressed) {
        toast.success(getCompressionStats(compressionResult), { duration: 3000 });
      }
      
      const compressedFile = compressionResult.file;
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${restaurantId}/logo-${Date.now()}.${fileExt}`;

      if (profile.logo_url) {
        try {
          const oldPath = profile.logo_url.split("/").slice(-2).join("/");
          await supabase.storage.from("restaurant-logos").remove([oldPath]);
        } catch (deleteError) {
          console.warn("Could not delete old logo:", deleteError);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("restaurant-logos")
        .upload(fileName, compressedFile, { upsert: true });

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("restaurant-logos")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error uploading logo");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.restaurant_name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    setSaving(true);

    try {
      await supabase.rpc('ensure_profile_exists', { user_id: restaurantId });
      const logoUrl = await uploadLogo();

      const updateData: Record<string, unknown> = {
        restaurant_name: profile.restaurant_name.trim(),
        restaurant_description: profile.restaurant_description.trim() || null,
        business_type: profile.business_type,
      };

      if (logoUrl !== null) {
        updateData.logo_url = logoUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", restaurantId);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditing(false);
      setLogoFile(null);
      setProfile(prev => ({ ...prev, logo_url: logoUrl || "" }));

      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, logo_url: logoUrl });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setLogoFile(null);
    setLogoPreview(profile.logo_url || null);
    fetchProfile();
  };

  const handleBellServiceToggle = async (enabled: boolean) => {
    if (!hasBellAccess) {
      setShowUpgradeDialog(true);
      return;
    }
    
    setBellServiceSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bell_service_enabled: enabled })
        .eq("id", restaurantId);

      if (error) throw error;

      setProfile(prev => ({ ...prev, bell_service_enabled: enabled }));
      toast.success(enabled ? "Bell service enabled" : "Bell service disabled");
      
      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, bell_service_enabled: enabled });
      }
    } catch (error) {
      console.error("Error updating bell service:", error);
      toast.error("Failed to update bell service setting");
    } finally {
      setBellServiceSaving(false);
    }
  };

  const handleCallServiceToggle = async (enabled: boolean) => {
    // If enabling, check if phone number exists
    if (enabled && !profile.call_phone_number) {
      toast.error("Please add a phone number first");
      setEditingPhone(true);
      return;
    }
    
    setCallServiceSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ call_service_enabled: enabled })
        .eq("id", restaurantId);

      if (error) throw error;

      setProfile(prev => ({ ...prev, call_service_enabled: enabled }));
      toast.success(enabled ? "Call service enabled" : "Call service disabled");
      
      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, call_service_enabled: enabled });
      }
    } catch (error) {
      console.error("Error updating call service:", error);
      toast.error("Failed to update call service setting");
    } finally {
      setCallServiceSaving(false);
    }
  };

  const handleSavePhoneNumber = async () => {
    // Validate phone number (basic validation)
    const cleanedNumber = tempPhoneNumber.replace(/\s/g, '');
    if (cleanedNumber && !/^\+?[0-9]{10,15}$/.test(cleanedNumber)) {
      toast.error("Please enter a valid phone number (10-15 digits)");
      return;
    }
    
    setPhoneNumberSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ call_phone_number: cleanedNumber || null })
        .eq("id", restaurantId);

      if (error) throw error;

      setProfile(prev => ({ ...prev, call_phone_number: cleanedNumber }));
      setEditingPhone(false);
      toast.success("Phone number saved");
      
      // If phone number is removed, disable call service
      if (!cleanedNumber && profile.call_service_enabled) {
        await handleCallServiceToggle(false);
      }
    } catch (error) {
      console.error("Error saving phone number:", error);
      toast.error("Failed to save phone number");
    } finally {
      setPhoneNumberSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit('passwordChange', RATE_LIMITS.passwordChange.maxRequests, RATE_LIMITS.passwordChange.windowMs)) {
      toast.error("Too many password change attempts. Please wait 10 minutes.");
      return;
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isStrong) {
      toast.error(`Weak password: ${strength.feedback.slice(0, 2).join(', ')}`);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setChangingPassword(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Unable to verify user. Please try again.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    setSendingResetEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Unable to get user email. Please try again.");
        return;
      }

      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      toast.success("Password reset link sent to your email!");
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setSendingResetEmail(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Restaurant Profile Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Restaurant Profile</CardTitle>
                <CardDescription>Your restaurant information</CardDescription>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label>Restaurant Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="relative">
                      <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-cover rounded-xl border-2" />
                      <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={handleRemoveLogo}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Max 2MB</p>
                  </div>
                </div>
                {compressing && (
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Compressing...</span>
                      <span>{compressionProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${compressionProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurant_name">Restaurant Name <span className="text-destructive">*</span></Label>
                <Input id="restaurant_name" placeholder="Your Restaurant Name" value={profile.restaurant_name} onChange={(e) => setProfile({ ...profile, restaurant_name: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurant_description">Description</Label>
                <Textarea id="restaurant_description" placeholder="Brief description (optional)" value={profile.restaurant_description} onChange={(e) => setProfile({ ...profile, restaurant_description: e.target.value })} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type</Label>
                <select
                  id="business_type"
                  value={profile.business_type}
                  onChange={(e) => setProfile({ ...profile, business_type: e.target.value as "hotel" | "restaurant" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {profile.business_type === "hotel" 
                    ? "Bell service will show 'Room Number' for hotels" 
                    : "Bell service will show 'Table Number' for restaurants"}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={saving || uploading} className="flex-1">
                  {(saving || uploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4">
              {profile.logo_url && (
                <div className="flex items-center gap-4">
                  <img src={profile.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded-xl border" />
                  <div>
                    <p className="text-xs text-muted-foreground">Restaurant Logo</p>
                    <p className="font-medium">Uploaded</p>
                  </div>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Restaurant Name</p>
                  <p className="font-semibold">{profile.restaurant_name}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{profile.restaurant_description || "Not provided"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bell Service Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>Bell Service</CardTitle>
              <CardDescription>Let customers call for service</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasBellAccess ? (
            <div className={`p-4 rounded-xl border-2 transition-all ${
              profile.bell_service_enabled 
                ? "bg-amber-500/5 border-amber-500/30" 
                : "bg-muted/30 border-muted"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    profile.bell_service_enabled 
                      ? "bg-amber-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {profile.bell_service_enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {profile.bell_service_enabled ? "Enabled" : "Disabled"}
                      {profile.bell_service_enabled && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">Active</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.bell_service_enabled 
                        ? "Customers can tap bell to call you" 
                        : "Bell button hidden from menu"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bellServiceSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Switch 
                    checked={profile.bell_service_enabled}
                    onCheckedChange={handleBellServiceToggle}
                    disabled={bellServiceSaving}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">Upgrade Required</h4>
                    <Crown className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Bell Service is available with Standard plan.
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => setShowUpgradeDialog(true)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Service Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle>Call Service</CardTitle>
              <CardDescription>Let customers call your restaurant directly</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phone Number Input */}
          <div className="p-4 rounded-xl bg-muted/30 border">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Phone Number</Label>
              {!editingPhone && profile.call_phone_number && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingPhone(true); setTempPhoneNumber(profile.call_phone_number); }}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {editingPhone || !profile.call_phone_number ? (
              <div className="space-y-3">
                <Input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={tempPhoneNumber}
                  onChange={(e) => setTempPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Include country code (e.g., +91 for India)</p>
                <div className="flex gap-2">
                  {profile.call_phone_number && (
                    <Button variant="outline" size="sm" onClick={() => { setEditingPhone(false); setTempPhoneNumber(profile.call_phone_number); }}>
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSavePhoneNumber} disabled={phoneNumberSaving}>
                    {phoneNumberSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="font-medium">{profile.call_phone_number}</p>
            )}
          </div>

          {/* Enable/Disable Toggle */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            profile.call_service_enabled 
              ? "bg-green-500/5 border-green-500/30" 
              : "bg-muted/30 border-muted"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  profile.call_service_enabled 
                    ? "bg-green-500 text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {profile.call_service_enabled ? <Phone className="h-5 w-5" /> : <PhoneOff className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {profile.call_service_enabled ? "Enabled" : "Disabled"}
                    {profile.call_service_enabled && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">Active</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.call_service_enabled 
                      ? "Call icon visible on menu" 
                      : "Call icon hidden from menu"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {callServiceSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <Switch 
                  checked={profile.call_service_enabled}
                  onCheckedChange={handleCallServiceToggle}
                  disabled={callServiceSaving || !profile.call_phone_number}
                />
              </div>
            </div>
          </div>
          
          {!profile.call_phone_number && (
            <p className="text-xs text-muted-foreground text-center">Add a phone number to enable call service</p>
          )}
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Min 8 chars with uppercase, lowercase, number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                >
                  {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Change Password
              </Button>
              <Button type="button" variant="outline" onClick={handleSendResetEmail} disabled={sendingResetEmail}>
                {sendingResetEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset via Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Upgrade to Standard
            </DialogTitle>
            <DialogDescription>
              Unlock Bell Service and more features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-primary" />
                <span>Bell Calling Feature</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-4 w-4 flex items-center justify-center text-primary font-medium">10</span>
                <span>Menu Image Uploads</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-4 w-4 text-primary">★</span>
                <span>Priority Support</span>
              </div>
            </div>
            
            {standardPlan && (
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button
                  onClick={() => handleUpgrade('monthly')}
                  disabled={paymentLoading}
                  variant="outline"
                  className="flex flex-col h-auto py-3"
                >
                  <span className="text-lg font-bold">{formatPrice(standardPlan.price_monthly)}</span>
                  <span className="text-xs text-muted-foreground">/month</span>
                </Button>
                <Button
                  onClick={() => handleUpgrade('yearly')}
                  disabled={paymentLoading}
                  className="flex flex-col h-auto py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <span className="text-lg font-bold">{formatPrice(standardPlan.price_yearly)}</span>
                  <span className="text-xs">/year (1 month free)</span>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
