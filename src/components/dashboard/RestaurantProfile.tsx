import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Edit, Upload, X, Bell, BellOff, Crown, Lock, Sparkles } from "lucide-react";
import { compressImage, COMPRESSION_PRESETS, getCompressionStats } from "@/lib/image-compression";

interface RestaurantProfileProps {
    restaurantId: string;
    onProfileUpdate?: (profile: Record<string, unknown>) => void;
}

const RestaurantProfile = ({ restaurantId, onProfileUpdate }: RestaurantProfileProps) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [hasBellAccess, setHasBellAccess] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState({
        restaurant_name: "",
        restaurant_description: "",
        logo_url: "",
        bell_service_enabled: true,
    });
    const [bellServiceSaving, setBellServiceSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
        checkBellAccess();
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
                                        onClick={() => navigate('/pricing')}
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
        </div>
    );
};

export default RestaurantProfile;
