import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Edit, Upload, X, Bell, BellOff, Crown, Lock, Sparkles, Check, KeyRound, Eye, EyeOff } from "lucide-react";
import { compressImage, COMPRESSION_PRESETS, getCompressionStats } from "@/lib/image-compression";
import { useRazorpay } from "@/hooks/useRazorpay";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface RestaurantProfileProps {
    restaurantId: string;
    onProfileUpdate?: (profile: Record<string, unknown>) => void;
}

interface BasicPlusPlan {
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
}

const RestaurantProfile = ({ restaurantId, onProfileUpdate }: RestaurantProfileProps) => {
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
    const [basicPlusPlan, setBasicPlusPlan] = useState<BasicPlusPlan | null>(null);
    const { initiatePayment, loading: paymentLoading } = useRazorpay();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState({
        restaurant_name: "",
        restaurant_description: "",
        logo_url: "",
        bell_service_enabled: true,
    });
    const [bellServiceSaving, setBellServiceSaving] = useState(false);
    
    // Password change states
    const [showPasswordChange, setShowPasswordChange] = useState(false);
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
        fetchBasicPlusPlan();
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

    const fetchBasicPlusPlan = async () => {
        try {
            const { data } = await supabase
                .from("subscription_plans")
                .select("id, name, price_monthly, price_yearly")
                .eq("bell_feature_enabled", true)
                .eq("is_active", true)
                .single();
            if (data) {
                setBasicPlusPlan(data as BasicPlusPlan);
            }
        } catch (error) {
            console.error("Error fetching Basic Plus plan:", error);
        }
    };

    const handleUpgrade = async (billingCycle: 'monthly' | 'yearly') => {
        if (!basicPlusPlan) {
            toast.error("Plan not found. Please try again.");
            return;
        }
        
        await initiatePayment(
            { planId: basicPlusPlan.id, billingCycle },
            () => {
                setShowUpgradeDialog(false);
                setHasBellAccess(true);
                toast.success("Upgraded to Basic Plus! Bell feature is now available.");
                // Refresh the page to update all components
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
                .select("restaurant_name, restaurant_description, logo_url, bell_service_enabled")
                .eq("id", restaurantId)
                .single();

            if (error) {
                if (error.message?.includes("logo_url") || error.message?.includes("column")) {
                    const { data: basicData, error: basicError } = await supabase
                        .from("profiles")
                        .select("restaurant_name, restaurant_description")
                        .eq("id", restaurantId)
                        .single();

                    if (basicError) throw basicError;

                    if (basicData) {
                        setProfile({
                            restaurant_name: (basicData as Record<string, unknown>).restaurant_name as string || "",
                            restaurant_description: (basicData as Record<string, unknown>).restaurant_description as string || "",
                            logo_url: "",
                            bell_service_enabled: true,
                        });
                    }
                    return;
                }
                throw error;
            }

            if (data) {
                const profileData = data as Record<string, unknown>;
                setProfile({
                    restaurant_name: profileData.restaurant_name as string || "",
                    restaurant_description: profileData.restaurant_description as string || "",
                    logo_url: profileData.logo_url as string || "",
                    bell_service_enabled: profileData.bell_service_enabled !== false,
                });
                if (profileData.logo_url) {
                    setLogoPreview(profileData.logo_url as string);
                }
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
                console.error("Upload error:", uploadError);
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
            };

            if (logoUrl !== null) {
                updateData.logo_url = logoUrl;
            }

            const { error } = await supabase
                .from("profiles")
                .update(updateData)
                .eq("id", restaurantId);

            if (error) {
                if (error.message?.includes("logo_url") || error.message?.includes("column")) {
                    const { error: retryError } = await supabase
                        .from("profiles")
                        .update({
                            restaurant_name: profile.restaurant_name.trim(),
                            restaurant_description: profile.restaurant_description.trim() || null,
                        })
                        .eq("id", restaurantId);

                    if (retryError) throw retryError;
                } else {
                    throw error;
                }
            }

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
            toast.error("Upgrade to Basic Plus to use Bell Service");
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

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setChangingPassword(true);

        try {
            // First verify current password by re-authenticating
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                toast.error("Unable to verify user. Please try again.");
                return;
            }

            // Verify current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                toast.error("Current password is incorrect");
                return;
            }

            // Update to new password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                throw updateError;
            }

            toast.success("Password changed successfully!");
            setShowPasswordChange(false);
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

    const handleCancelPasswordChange = () => {
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
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
            setShowPasswordChange(false);
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
            {/* Restaurant Profile Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Restaurant Profile</CardTitle>
                            <CardDescription>
                                Manage your restaurant information that appears on your menu
                            </CardDescription>
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
                            {/* Logo Upload */}
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
                                        <p className="text-xs text-muted-foreground mt-2">Max 2MB, auto-compressed</p>
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

                            {/* Restaurant Name */}
                            <div className="space-y-2">
                                <Label htmlFor="restaurant_name">Restaurant Name <span className="text-destructive">*</span></Label>
                                <Input id="restaurant_name" placeholder="Your Restaurant Name" value={profile.restaurant_name} onChange={(e) => setProfile({ ...profile, restaurant_name: e.target.value })} required />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="restaurant_description">Description</Label>
                                <Textarea id="restaurant_description" placeholder="Brief description (optional)" value={profile.restaurant_description} onChange={(e) => setProfile({ ...profile, restaurant_description: e.target.value })} rows={3} />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">Cancel</Button>
                                <Button type="submit" disabled={saving || uploading} className="flex-1">
                                    {(saving || uploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {uploading ? "Uploading..." : "Save"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {profile.restaurant_name === "New Restaurant" ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-xl">
                                    <h3 className="text-lg font-semibold mb-2">Welcome!</h3>
                                    <p className="text-muted-foreground mb-4">Set up your restaurant profile</p>
                                    <Button onClick={() => setEditing(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Set Up Profile
                                    </Button>
                                </div>
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
                                            <p className="font-semibold text-lg">{profile.restaurant_name}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-xl">
                                            <p className="text-xs text-muted-foreground mb-1">Description</p>
                                            <p className="text-sm">{profile.restaurant_description || "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bell Service Settings Card - Separate Card */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Bell Service
                    </CardTitle>
                    <CardDescription>
                        Allow customers to call for service from their table
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {hasBellAccess ? (
                        /* User has Bell Access - Show Toggle */
                        <div className={`p-5 rounded-xl border-2 transition-all ${
                            profile.bell_service_enabled 
                                ? "bg-primary/5 border-primary/30" 
                                : "bg-muted/30 border-muted"
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                        profile.bell_service_enabled 
                                            ? "bg-primary text-primary-foreground" 
                                            : "bg-muted text-muted-foreground"
                                    }`}>
                                        {profile.bell_service_enabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold flex items-center gap-2">
                                            {profile.bell_service_enabled ? "Enabled" : "Disabled"}
                                            {profile.bell_service_enabled && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 font-medium">Active</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {profile.bell_service_enabled 
                                                ? "Customers can tap the bell icon to call you" 
                                                : "Bell button is hidden from customers"}
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
                        /* User doesn't have Bell Access - Show Upgrade */
                        <div className="p-5 rounded-xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-700">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                    <Lock className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold">Upgrade Required</h4>
                                        <Crown className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Bell Service is available with Basic Plus plan. Let customers call for service directly from their table.
                                    </p>
                                    <Button 
                                        onClick={() => setShowUpgradeDialog(true)}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Upgrade to Basic Plus
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Account Security Card */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5" />
                        Account Security
                    </CardTitle>
                    <CardDescription>
                        Manage your password and account security
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {showPasswordChange ? (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="px-0 text-xs h-auto text-primary"
                                        onClick={handleSendResetEmail}
                                        disabled={sendingResetEmail}
                                    >
                                        {sendingResetEmail ? (
                                            <>
                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Forgot password?"
                                        )}
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="current-password"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-new-password"
                                        type={showConfirmNewPassword ? "text" : "password"}
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                    >
                                        {showConfirmNewPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleCancelPasswordChange}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={changingPassword}
                                    className="flex-1"
                                >
                                    {changingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Lock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Password</p>
                                        <p className="text-sm text-muted-foreground">Last changed: Unknown</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowPasswordChange(true)}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Change
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upgrade Dialog */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-500" />
                            Upgrade to Basic Plus
                        </DialogTitle>
                        <DialogDescription>
                            Unlock the Bell Calling feature and more benefits.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {/* Features */}
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                    <Bell className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Basic Plus Features</h4>
                                    <p className="text-sm text-muted-foreground">Everything you need</p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    Bell Calling Feature
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    10 Menu Images (vs 5)
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    Priority Support
                                </li>
                            </ul>
                        </div>

                        {/* Pricing Options */}
                        {basicPlusPlan && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => handleUpgrade('monthly')}
                                    disabled={paymentLoading}
                                    variant="outline"
                                    className="h-auto py-4 flex-col"
                                >
                                    {paymentLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-xl font-bold">{formatPrice(basicPlusPlan.price_monthly)}</span>
                                            <span className="text-xs text-muted-foreground">/month</span>
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleUpgrade('yearly')}
                                    disabled={paymentLoading}
                                    className="h-auto py-4 flex-col bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                >
                                    {paymentLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-xl font-bold">{formatPrice(basicPlusPlan.price_yearly)}</span>
                                            <span className="text-xs opacity-90">/year (Save 17%)</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        <p className="text-xs text-center text-muted-foreground">
                            Secure payment powered by Razorpay
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RestaurantProfile;
