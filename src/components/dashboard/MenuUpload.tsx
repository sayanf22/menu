import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, Trash2, Eye, ImageIcon, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadToR2 } from "@/lib/r2-upload";
import { compressImage, COMPRESSION_PRESETS, getCompressionStats } from "@/lib/image-compression";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MenuUploadProps {
  restaurantId: string;
}

interface UploadLimit {
  can_upload: boolean;
  current_count: number;
  max_allowed: number;
  plan_name: string;
  remaining: number;
}

interface MenuImage {
  id: string;
  image_url: string;
  display_order: number;
}

// Sortable Image Card Component
const SortableImageCard = ({ 
  image, 
  index, 
  onView, 
  onDelete 
}: { 
  image: MenuImage; 
  index: number;
  onView: (url: string) => void;
  onDelete: (id: string, url: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden animate-slide-up transition-smooth hover:shadow-xl ${
        isDragging ? 'shadow-2xl scale-[1.02] ring-2 ring-primary' : ''
      }`}
    >
      <div className="relative group">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 p-2 bg-black/60 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 touch-none"
        >
          <GripVertical className="h-5 w-5 text-white" />
        </div>

        {/* Order Badge */}
        <div className="absolute top-2 right-2 z-20 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
          {index + 1}
        </div>

        <img
          src={image.image_url}
          alt={`Menu ${index + 1}`}
          className="w-full h-48 object-cover cursor-pointer transition-all duration-500 group-hover:scale-[1.03]"
          onClick={() => onView(image.image_url)}
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onView(image.image_url)}
            className="bg-white/90 hover:bg-white transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(image.id, image.image_url)}
            className="transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const MenuUpload = ({ restaurantId }: MenuUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [menuImages, setMenuImages] = useState<MenuImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{ id: string; url: string } | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [imageToView, setImageToView] = useState<string | null>(null);
  const [uploadLimit, setUploadLimit] = useState<UploadLimit | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMenuImages();
    fetchUploadLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const fetchUploadLimit = async () => {
    try {
      const { data, error } = await supabase.rpc("check_image_upload_limit", {
        p_user_id: restaurantId
      });
      if (!error && data) {
        setUploadLimit(data as unknown as UploadLimit);
      }
    } catch (error) {
      console.error("Error fetching upload limit:", error);
    }
  };

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menuImages.findIndex((img) => img.id === active.id);
      const newIndex = menuImages.findIndex((img) => img.id === over.id);

      const newOrder = arrayMove(menuImages, oldIndex, newIndex);
      setMenuImages(newOrder);

      // Save new order to database
      setSavingOrder(true);
      try {
        const updates = newOrder.map((img, index) => ({
          id: img.id,
          restaurant_id: restaurantId,
          image_url: img.image_url,
          display_order: index,
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from("menu_images")
            .update({ display_order: update.display_order })
            .eq("id", update.id);

          if (error) throw error;
        }

        toast.success("Menu order updated!");
      } catch (error) {
        console.error("Error updating order:", error);
        toast.error("Failed to save order");
        // Revert on error
        await fetchMenuImages();
      } finally {
        setSavingOrder(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = event.target.files;
      if (!files || files.length === 0) return;

      // Check upload limit before proceeding
      const { data: limitCheck } = await supabase.rpc("check_image_upload_limit", {
        p_user_id: restaurantId
      });
      
      const limit = limitCheck as unknown as UploadLimit;
      if (!limit?.can_upload) {
        toast.error(`You've reached your upload limit (${limit?.max_allowed || 5} images). Upgrade to Standard for more uploads!`);
        setUploading(false);
        event.target.value = "";
        return;
      }

      // Check if uploading these files would exceed the limit
      if (files.length > (limit?.remaining || 0)) {
        toast.error(`You can only upload ${limit?.remaining || 0} more image(s). Upgrade your plan for more!`);
        setUploading(false);
        event.target.value = "";
        return;
      }

      // Validate file types
      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.startsWith('image/')) {
          toast.error(`${files[i].name} is not an image file.`);
          setUploading(false);
          event.target.value = "";
          return;
        }
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileName(file.name);
        
        // Check if file is over 1MB - must compress
        if (file.size > 1 * 1024 * 1024) {
          setCompressing(true);
          setCompressionProgress(0);
        }
        
        // Compress image before upload (target: 400KB max)
        const compressionResult = await compressImage(file, {
          ...COMPRESSION_PRESETS.menuImage,
          onProgress: (progress) => setCompressionProgress(Math.round(progress)),
        });
        
        setCompressing(false);
        setCompressionProgress(100);
        
        if (compressionResult.wasCompressed) {
          toast.success(getCompressionStats(compressionResult), { duration: 3000 });
        }
        
        const compressedFile = compressionResult.file;
        
        // Upload compressed file to Cloudflare R2
        const uploadResult = await uploadToR2(compressedFile, {
          folder: 'menu-images',
          maxSizeMB: 10,
        });

        if (!uploadResult.success || !uploadResult.url) {
          toast.error(uploadResult.error || 'Failed to upload image');
          continue;
        }

        const publicUrl = uploadResult.url;

        // Ensure profile exists before inserting
        const { error: profileError } = await supabase.rpc('ensure_profile_exists', {
          user_id: restaurantId
        } as { user_id: string });

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
      await fetchUploadLimit(); // Refresh limit after upload
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error uploading images";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const openDeleteDialog = (imageId: string, imageUrl: string) => {
    setImageToDelete({ id: imageId, url: imageUrl });
    setDeleteDialogOpen(true);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      // Check if it's an R2 URL or Supabase Storage URL
      const isR2Url = imageToDelete.url.includes('r2.dev') || imageToDelete.url.includes('r2.cloudflarestorage.com');
      
      if (!isR2Url) {
        // Legacy: Delete from Supabase storage
        const urlParts = imageToDelete.url.split("/");
        const filePath = urlParts[urlParts.length - 1];

        const { error: storageError } = await supabase.storage
          .from("menu-images")
          .remove([filePath]);

        if (storageError) {
          console.warn('Storage delete warning:', storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("menu_images")
        .delete()
        .eq("id", imageToDelete.id);

      if (dbError) throw dbError;

      toast.success("Image deleted successfully!");
      await fetchMenuImages();
      await fetchUploadLimit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error deleting image";
      toast.error(errorMessage);
    } finally {
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const openViewDialog = (imageUrl: string) => {
    setImageToView(imageUrl);
    setViewDialogOpen(true);
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
      {/* Upload Limit Banner */}
      {uploadLimit && (
        <div className={`p-3 rounded-lg border animate-fade-in ${
          uploadLimit.remaining === 0 
            ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800' 
            : 'bg-muted/50 border-border'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-medium">{uploadLimit.current_count}</span>
                <span className="text-muted-foreground"> / {uploadLimit.max_allowed} images</span>
                <span className="text-xs text-muted-foreground ml-2">({uploadLimit.plan_name} Plan)</span>
              </span>
            </div>
            {uploadLimit.remaining === 0 && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Upgrade for more uploads
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                uploadLimit.remaining === 0 ? 'bg-orange-500' : 'bg-primary'
              }`}
              style={{ width: `${(uploadLimit.current_count / uploadLimit.max_allowed) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 animate-fade-in">
        <Button 
          asChild 
          disabled={uploading || compressing || (uploadLimit?.remaining === 0)} 
          className="transition-bounce hover:scale-105"
        >
          <label className={`cursor-pointer ${uploadLimit?.remaining === 0 ? 'cursor-not-allowed opacity-50' : ''}`}>
            {uploading || compressing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {compressing ? "Compressing..." : uploading ? "Uploading..." : "Upload Images"}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading || compressing || (uploadLimit?.remaining === 0)}
            />
          </label>
        </Button>
        <p className="text-sm text-muted-foreground animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          {uploadLimit?.remaining || 0} upload{uploadLimit?.remaining !== 1 ? "s" : ""} remaining
        </p>
      </div>

      {/* Drag & Drop Instructions */}
      {menuImages.length > 1 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in">
          <GripVertical className="h-4 w-4 text-blue-500" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Tip:</span> Drag and drop images to reorder them. The order will be saved automatically.
          </p>
          {savingOrder && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 ml-auto" />
          )}
        </div>
      )}

      {/* Compression Progress Bar */}
      {compressing && (
        <div className="space-y-2 p-4 bg-muted/50 rounded-lg border animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-medium">Compressing: {currentFileName}</span>
            </span>
            <span className="text-muted-foreground">{compressionProgress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${compressionProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Optimizing image quality while reducing file size...
          </p>
        </div>
      )}

      {menuImages.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={menuImages.map(img => img.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuImages.map((image, index) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  onView={openViewDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this menu image. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImageToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Image Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 animate-scale-in">
          <DialogHeader className="p-4 pb-0 animate-fade-in">
            <DialogTitle>Menu Image</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto p-4 smooth-scroll">
            {imageToView && (
              <img
                src={imageToView}
                alt="Menu preview"
                className="w-full h-auto rounded-lg animate-fade-in shadow-lg"
                style={{ animationDelay: '0.1s' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuUpload;
