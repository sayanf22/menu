import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, TrendingUp, Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";

interface AnalyticsProps {
  restaurantId: string;
}

const Analytics = ({ restaurantId }: AnalyticsProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    todayViews: 0,
    weekViews: 0,
    monthViews: 0,
  });

  useEffect(() => {
    fetchAnalytics();

    // Set up realtime subscription for live view count updates
    const subscription = supabase
      .channel('view_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'view_logs',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          // Refetch analytics when new view is logged
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [restaurantId]);

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();
      const monthStart = new Date(now.setDate(now.getDate() - 23)).toISOString(); // Total 30 days

      // Total views
      const { count: totalCount } = await supabase
        .from("view_logs")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId);

      // Today's views
      const { count: todayCount } = await supabase
        .from("view_logs")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .gte("viewed_at", todayStart);

      // Week views
      const { count: weekCount } = await supabase
        .from("view_logs")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .gte("viewed_at", weekStart);

      // Month views
      const { count: monthCount } = await supabase
        .from("view_logs")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .gte("viewed_at", monthStart);

      setStats({
        totalViews: totalCount || 0,
        todayViews: todayCount || 0,
        weekViews: weekCount || 0,
        monthViews: monthCount || 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalViews}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayViews}</div>
          <p className="text-xs text-muted-foreground">Views today</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.weekViews}</div>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.monthViews}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
