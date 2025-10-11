import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Edit, Upload, X } from "lucide-react";

interface RestaurantProfileProps {
    restaurantId: string;
    onProfileUpdate?: (profile: any) => void;
}

const RestaurantProfile = ({ restaurantId, onProfileUpdate }: RestaurantProfileProps) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState({
        restaurant_name: "",
        restaurant_description: "",
        logo_url: "",
    });

    useEffect(() => {
        fetchProfile();
    }, [restaurantId]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("restaurant_name, restaurant_description, logo_url")
                .eq("id", restaurantId)
                .single();

            if (error) {
                // Check if error is due to missing logo_url column
                if (error.message?.includes("logo_url") || error.message?.includes("column")) {
                    console.warn("Logo column not found - migration may not be applied yet");
                    // Fetch without logo_url
                    const { data: basicData, error: basicError } = await supabase
                        .from("profiles")
                        .select("restaurant_name, restaurant_description")
                        .eq("id", restaurantId)
                        .single();

                    if (basicError) throw basicError;

                    if (basicData) {
                        setProfile({
                            restaurant_name: (basicData as any).restaurant_name || "",
                            restaurant_description: (basicData as any).restaurant_description || "",
                            logo_url: "",
                        });
                    }
                    return;
                }
                throw error;
            }

            if (data) {
                setProfile({
                    restaurant_name: (data as any).restaurant_name || "",
                    restaurant_description: (data as any).restaurant_description || "",
                    logo_url: (data as any).logo_url || "",
                });
                if ((data as any).logo_url) {
                    setLogoPreview((data as any).logo_url);
                }
            }
        } catch (error: any) {
            console.error("Error fetching profile:", error);
            toast.error("Error loading profile");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Logo must be less than 5MB");
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
            const fileExt = logoFile.name.split(".").pop();
            const fileName = `${restaurantId}/logo-${Date.now()}.${fileExt}`;

            // Delete old logo if exists
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
                .upload(fileName, logoFile, { upsert: true });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                if (uploadError.message?.includes("not found") || uploadError.message?.includes("bucket")) {
                    toast.error("Storage bucket not configured. Please run the database migration first.");
                } else {
                    toast.error(`Upload failed: ${uploadError.message}`);
                }
                return null;
            }

            const { data: { publicUrl } } = supabase.storage
                .from("restaurant-logos")
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error: any) {
            console.error("Error uploading logo:", error);
            toast.error(error.message || "Error uploading logo");
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
            // Ensure profile exists first
            const { error: profileError } = await supabase.rpc('ensure_profile_exists' as any, {
                user_id: restaurantId
            });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                throw new Error('Failed to create user profile');
            }

            // Upload logo if changed
            const logoUrl = await uploadLogo();

            // Try to update with logo_url first
            let updateData: any = {
                restaurant_name: profile.restaurant_name.trim(),
                restaurant_description: profile.restaurant_description.trim() || null,
            };

            // Only include logo_url if we have one or if the column exists
            if (logoUrl !== null) {
                updateData.logo_url = logoUrl;
            }

            const { error } = await supabase
                .from("profiles")
                .update(updateData)
                .eq("id", restaurantId);

            if (error) {
                // If error is about logo_url column, try without it
                if (error.message?.includes("logo_url") || error.message?.includes("column")) {
                    console.warn("Logo column not found, updating without logo");
                    const { error: retryError } = await supabase
                        .from("profiles")
                        .update({
                            restaurant_name: profile.restaurant_name.trim(),
                            restaurant_description: profile.restaurant_description.trim() || null,
                        })
                        .eq("id", restaurantId);

                    if (retryError) throw retryError;

                    toast.warning("Profile updated, but logo feature requires database migration. Please run RUN_THIS_SQL.sql");
                } else {
                    throw error;
                }
            }

            toast.success("Profile updated successfully!");
            setEditing(false);
            setLogoFile(null);

            // Update local state
            setProfile(prev => ({ ...prev, logo_url: logoUrl || "" }));

            // Notify parent component of the update
            if (onProfileUpdate) {
                onProfileUpdate({ ...profile, logo_url: logoUrl });
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Error updating profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setLogoFile(null);
        setLogoPreview(profile.logo_url || null);
        fetchProfile(); // Reset to original values
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Restaurant Profile
                    {!editing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditing(true)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    )}
                </CardTitle>
                <CardDescription>
                    Manage your restaurant information that appears on your menu
                </CardDescription>
            </CardHeader>
            <CardContent>
                {editing ? (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Restaurant Logo</Label>
                            <div className="flex items-center gap-4">
                                {logoPreview && (
                                    <div className="relative">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-24 h-24 object-cover rounded-lg border"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                            onClick={handleRemoveLogo}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {logoPreview ? "Change Logo" : "Upload Logo"}
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Max 5MB. Recommended: Square image (e.g., 512x512px)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="restaurant_name">
                                Restaurant Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="restaurant_name"
                                placeholder="Your Restaurant Name"
                                value={profile.restaurant_name}
                                onChange={(e) =>
                                    setProfile({ ...profile, restaurant_name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="restaurant_description">Description</Label>
                            <Textarea
                                id="restaurant_description"
                                placeholder="Brief description of your restaurant (optional)"
                                value={profile.restaurant_description}
                                onChange={(e) =>
                                    setProfile({ ...profile, restaurant_description: e.target.value })
                                }
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                This description will appear on your public menu page
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving || uploading} className="flex-1">
                                {(saving || uploading) ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {uploading ? "Uploading..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {profile.restaurant_name === "New Restaurant" ? (
                            <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Welcome to MenuQR!</h3>
                                <p className="text-muted-foreground mb-4">
                                    Let's start by setting up your restaurant profile
                                </p>
                                <Button onClick={() => setEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Set Up Profile
                                </Button>
                            </div>
                        ) : (
                            <>
                                {profile.logo_url && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Restaurant Logo
                                        </Label>
                                        <img
                                            src={profile.logo_url}
                                            alt="Restaurant logo"
                                            className="w-24 h-24 object-cover rounded-lg border mt-2"
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Restaurant Name
                                    </Label>
                                    <p className="text-lg font-semibold">
                                        {profile.restaurant_name}
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Description
                                    </Label>
                                    <p className="text-sm">
                                        {profile.restaurant_description || "No description provided"}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RestaurantProfile;