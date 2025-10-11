import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MenuUploadProps {
  restaurantId: string;
}

const MenuUpload = ({ restaurantId }: MenuUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [menuImages, setMenuImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuImages();
  }, [restaurantId]);

  const fetchMenuImages = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_images")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setMenuImages(data || []);
    } catch (error) {
      console.error("Error fetching menu images:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractDominantColor = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("#F59E0B");
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        const pixelCount = data.length / 4;
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        resolve(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
      };

      img.onerror = () => resolve("#F59E0B");
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // Validate file sizes (must be less than 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize) {
          toast.error(`${files[i].name} is larger than 1MB. Please compress the image and try again.`);
          setUploading(false);
          event.target.value = "";
          return;
        }
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${restaurantId}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("menu-images")
          .getPublicUrl(filePath);

        // Ensure profile exists before inserting
        const { error: profileError } = await supabase.rpc('ensure_profile_exists', {
          user_id: restaurantId
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile');
        }

        // Extract dominant color
        const dominantColor = await extractDominantColor(publicUrl);

        const { error: dbError } = await supabase.from("menu_images").insert({
          restaurant_id: restaurantId,
          image_url: publicUrl,
          dominant_color: dominantColor,
          display_order: menuImages.length + i,
        });

        if (dbError) {
          console.error('Database error:', dbError);
          console.error('Restaurant ID:', restaurantId);
          console.error('Auth user:', await supabase.auth.getUser());
          throw dbError;
        }
      }

      toast.success("Images uploaded successfully!");
      await fetchMenuImages();
    } catch (error: any) {
      toast.error(error.message || "Error uploading images");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/");
      const filePath = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("menu-images")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("menu_images")
        .delete()
        .eq("id", imageId);

      if (dbError) throw dbError;

      toast.success("Image deleted successfully!");
      await fetchMenuImages();
    } catch (error: any) {
      toast.error(error.message || "Error deleting image");
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild disabled={uploading}>
          <label className="cursor-pointer">
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </Button>
        <p className="text-sm text-muted-foreground">
          {menuImages.length} image{menuImages.length !== 1 ? "s" : ""} uploaded (max 1MB each)
        </p>
      </div>

      {menuImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative group">
                <img
                  src={image.image_url}
                  alt="Menu"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteImage(image.id, image.image_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuUpload;
