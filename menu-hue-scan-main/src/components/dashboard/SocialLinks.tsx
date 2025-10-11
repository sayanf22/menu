import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, Facebook, Instagram, Twitter, Youtube, MessageCircle, Globe } from "lucide-react";

interface SocialLinksProps {
  restaurantId: string;
}

const SocialLinks = ({ restaurantId }: SocialLinksProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
    youtube: "",
    website: "",
  });

  useEffect(() => {
    fetchSocialLinks();
  }, [restaurantId]);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setLinks({
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          twitter: data.twitter || "",
          whatsapp: data.whatsapp || "",
          youtube: data.youtube || "",
          website: data.website || "",
        });
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Ensure profile exists before inserting
      const { error: profileError } = await supabase.rpc('ensure_profile_exists', {
        user_id: restaurantId
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile');
      }

      const { error } = await supabase
        .from("social_links")
        .upsert(
          {
            restaurant_id: restaurantId,
            facebook: links.facebook || null,
            instagram: links.instagram || null,
            twitter: links.twitter || null,
            whatsapp: links.whatsapp || null,
            youtube: links.youtube || null,
            website: links.website || null,
          },
          {
            onConflict: "restaurant_id",
          }
        );

      if (error) {
        console.error('Social links error:', error);
        console.error('Restaurant ID:', restaurantId);
        console.error('Auth user:', await supabase.auth.getUser());
        throw error;
      }

      toast.success("Social links saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error saving social links");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-[#1877F2]" />
              Facebook
            </Label>
            <Input
              id="facebook"
              type="url"
              placeholder="https://facebook.com/yourrestaurant"
              value={links.facebook}
              onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
              className="transition-smooth focus:ring-2 focus:ring-[#1877F2]/20"
            />
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-[#E4405F]" />
              Instagram
            </Label>
            <Input
              id="instagram"
              type="url"
              placeholder="https://instagram.com/yourrestaurant"
              value={links.instagram}
              onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
              className="transition-smooth focus:ring-2 focus:ring-[#E4405F]/20"
            />
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
              Twitter / X
            </Label>
            <Input
              id="twitter"
              type="url"
              placeholder="https://twitter.com/yourrestaurant"
              value={links.twitter}
              onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
              className="transition-smooth focus:ring-2 focus:ring-[#1DA1F2]/20"
            />
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+1234567890"
              value={links.whatsapp}
              onChange={(e) => setLinks({ ...links, whatsapp: e.target.value })}
              className="transition-smooth focus:ring-2 focus:ring-[#25D366]/20"
            />
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-[#FF0000]" />
              YouTube
            </Label>
            <Input
              id="youtube"
              type="url"
              placeholder="https://youtube.com/@yourrestaurant"
              value={links.youtube}
              onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
              className="transition-smooth focus:ring-2 focus:ring-[#FF0000]/20"
            />
          </div>

          <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourrestaurant.com"
              value={links.website}
              onChange={(e) => setLinks({ ...links, website: e.target.value })}
              className="transition-smooth focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={saving} 
          className="w-full transition-bounce hover:scale-[1.02] animate-bounce-gentle"
          style={{ animationDelay: '0.7s' }}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Social Links
        </Button>
      </form>
    </div>
  );
};

export default SocialLinks;
