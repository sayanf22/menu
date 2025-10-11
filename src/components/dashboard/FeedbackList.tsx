import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface FeedbackListProps {
  restaurantId: string;
}

const FeedbackList = ({ restaurantId }: FeedbackListProps) => {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchFeedback();
  }, [restaurantId]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFeedback(data || []);

      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum, item) => sum + item.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
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
      {feedback.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-8 w-8 fill-primary text-primary" />
                <span className="text-4xl font-bold">{averageRating}</span>
              </div>
              <p className="text-muted-foreground">
                Average rating from {feedback.length} review{feedback.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {feedback.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No feedback yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Customer feedback will appear here once they start reviewing your menu
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{item.customer_name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < item.rating ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {item.comment && (
                  <p className="text-muted-foreground">{item.comment}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
