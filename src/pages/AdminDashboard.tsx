import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Loader2, LogOut, Ban, CheckCircle, Shield, Users, CreditCard, 
  Search, RefreshCw, Gift, XCircle, UserPlus, Eye, EyeOff, Trash2
} from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  email: string;
  restaurant_name: string;
  restaurant_description: string | null;
  created_at: string;
  is_disabled: boolean;
  disabled_at: string | null;
  approval_status: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_end: string | null;
  billing_cycle: string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  max_images: number;
  bell_feature_enabled: boolean;
}

type ActionType = "disable" | "enable" | "grant" | "revoke" | "delete" | null;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [grantMonths, setGrantMonths] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Create Account states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newAccount, setNewAccount] = useState({
    email: "",
    password: "",
    restaurantName: "",
    restaurantDescription: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAdminSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminSession = async () => {
    try {
      const sessionToken = localStorage.getItem("admin_session_token");
      
      if (!sessionToken) {
        navigate("/adminlogin");
        return;
      }

      // Validate session token format (basic security check)
      if (sessionToken.length < 32) {
        localStorage.removeItem("admin_session_token");
        localStorage.removeItem("admin_email");
        navigate("/adminlogin");
        return;
      }

      const { data: sessionData, error } = await supabase
        .from("admin_sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !sessionData) {
        localStorage.removeItem("admin_session_token");
        localStorage.removeItem("admin_email");
        toast.error("Session expired. Please login again");
        navigate("/adminlogin");
        return;
      }

      setIsAdmin(true);
      await Promise.all([loadProfiles(), loadPlans()]);
    } catch (error) {
      navigate("/adminlogin");
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase.rpc("admin_get_profiles");
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast.error("Failed to load user profiles");
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase.rpc("admin_get_subscription_plans");
      if (error) throw error;
      setPlans(data || []);
      if (data && data.length > 0) {
        setSelectedPlanId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load plans:", error);
    }
  };

  const handleAccountAction = async () => {
    if (!selectedProfile || !actionType) return;
    setActionLoading(true);

    try {
      const adminEmail = localStorage.getItem("admin_email") || "admin";
      const adminSessionToken = localStorage.getItem("admin_session_token");

      // All admin actions require a valid session token
      if (!adminSessionToken) {
        toast.error("Admin session expired. Please login again.");
        navigate("/adminlogin");
        return;
      }

      if (actionType === "disable" || actionType === "enable") {
        const isDisabling = actionType === "disable";
        const { data, error } = await supabase.rpc("admin_update_profile_status", {
          profile_id: selectedProfile.id,
          is_disabled_value: isDisabling,
          disabled_by_email: isDisabling ? adminEmail : null,
          p_admin_session_token: adminSessionToken,
        });
        if (error) throw error;
        const result = data as { success?: boolean; error?: string } | null;
        if (result && !result.success) {
          toast.error(result.error || "Failed to update account");
          return;
        }
        toast.success(`Account ${isDisabling ? "disabled" : "enabled"} successfully`);
      } else if (actionType === "grant") {
        if (!selectedPlanId) {
          toast.error("Please select a plan");
          return;
        }
        const { data, error } = await supabase.rpc("admin_grant_subscription", {
          p_user_id: selectedProfile.id,
          p_plan_id: selectedPlanId,
          p_months: grantMonths,
          p_admin_email: adminEmail,
          p_admin_session_token: adminSessionToken,
        });
        if (error) throw error;
        const result = data as { success?: boolean; error?: string } | null;
        if (result && !result.success) {
          toast.error(result.error || "Failed to grant subscription");
          return;
        }
        toast.success(`Subscription granted for ${grantMonths} month(s)`);
      } else if (actionType === "revoke") {
        const { data, error } = await supabase.rpc("admin_revoke_subscription", {
          p_user_id: selectedProfile.id,
          p_admin_email: adminEmail,
          p_admin_session_token: adminSessionToken,
        });
        if (error) throw error;
        const result = data as { success?: boolean; error?: string } | null;
        if (result && !result.success) {
          toast.error(result.error || "Failed to revoke subscription");
          return;
        }
        toast.success("Subscription revoked successfully");
      } else if (actionType === "delete") {
        const { data, error } = await supabase.rpc("admin_delete_user_account", {
          p_user_id: selectedProfile.id,
          p_admin_session_token: adminSessionToken,
        });
        if (error) throw error;
        
        const result = data as { success?: boolean; error?: string; deleted_email?: string } | null;
        if (result && !result.success) {
          toast.error(result.error || "Failed to delete account");
          return;
        }
        toast.success(`Account ${result?.deleted_email || ''} deleted permanently`);
      }

      await loadProfiles();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Action failed: ${errorMessage}`);
    } finally {
      setActionLoading(false);
      setSelectedProfile(null);
      setActionType(null);
      setGrantMonths(1);
    }
  };

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem("admin_session_token");
    if (sessionToken) {
      await supabase.from("admin_sessions").delete().eq("session_token", sessionToken);
    }
    localStorage.removeItem("admin_session_token");
    localStorage.removeItem("admin_email");
    toast.success("Logged out successfully");
    navigate("/adminlogin");
  };

  const handleCreateAccount = async () => {
    // Validation
    if (!newAccount.email || !newAccount.password || !newAccount.restaurantName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newAccount.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAccount.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setCreateLoading(true);

    try {
      // Get admin session token for authorization
      const adminSessionToken = localStorage.getItem("admin_session_token");
      
      if (!adminSessionToken) {
        toast.error("Admin session expired. Please login again.");
        navigate("/adminlogin");
        return;
      }

      const { data, error } = await supabase.rpc("admin_create_user_account", {
        p_email: newAccount.email.toLowerCase().trim(),
        p_password: newAccount.password,
        p_restaurant_name: newAccount.restaurantName.trim(),
        p_restaurant_description: newAccount.restaurantDescription.trim() || null,
        p_admin_session_token: adminSessionToken,
      });

      if (error) throw error;

      const result = data as { success?: boolean; error?: string; user_id?: string } | null;
      
      if (result && !result.success) {
        toast.error(result.error || "Failed to create account");
        return;
      }

      toast.success("Account created successfully!");
      setShowCreateDialog(false);
      setNewAccount({ email: "", password: "", restaurantName: "", restaurantDescription: "" });
      await loadProfiles();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create account: ${errorMessage}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const getSubscriptionBadge = (profile: Profile) => {
    const status = profile.subscription_status || "none";
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "cancelled":
      case "halted":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Expired</Badge>;
      default:
        return <Badge variant="outline">No Subscription</Badge>;
    }
  };

  const getAccountBadge = (profile: Profile) => {
    if (profile.is_disabled) {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    return <Badge className="bg-green-500">Active</Badge>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

  // Filter profiles
  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && !profile.is_disabled && profile.subscription_status === "active";
    if (filterStatus === "disabled") return matchesSearch && profile.is_disabled;
    if (filterStatus === "no_subscription") return matchesSearch && (!profile.subscription_status || profile.subscription_status === "none");
    if (filterStatus === "expired") return matchesSearch && (profile.subscription_status === "expired" || profile.subscription_status === "cancelled");
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: profiles.length,
    active: profiles.filter(p => !p.is_disabled && p.subscription_status === "active").length,
    disabled: profiles.filter(p => p.is_disabled).length,
    noSubscription: profiles.filter(p => !p.subscription_status || p.subscription_status === "none").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage users & subscriptions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateDialog(true)} variant="default" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active Subscriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Ban className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.disabled}</p>
                  <p className="text-xs text-muted-foreground">Disabled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.noSubscription}</p>
                  <p className="text-xs text-muted-foreground">No Subscription</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all user accounts and subscriptions</CardDescription>
              </div>
              <Button onClick={loadProfiles} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Subscription</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="no_subscription">No Subscription</SelectItem>
                  <SelectItem value="expired">Expired/Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Restaurant</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead className="hidden lg:table-cell">Plan</TableHead>
                    <TableHead className="hidden lg:table-cell">Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{profile.restaurant_name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{profile.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {profile.email}
                        </TableCell>
                        <TableCell>{getAccountBadge(profile)}</TableCell>
                        <TableCell>{getSubscriptionBadge(profile)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {profile.subscription_plan || "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {formatDate(profile.subscription_end)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {/* Grant Subscription */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => {
                                setSelectedProfile(profile);
                                setActionType("grant");
                              }}
                              title="Grant Subscription"
                            >
                              <Gift className="h-4 w-4 text-green-600" />
                            </Button>
                            
                            {/* Revoke Subscription */}
                            {profile.subscription_status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setActionType("revoke");
                                }}
                                title="Revoke Subscription"
                              >
                                <XCircle className="h-4 w-4 text-orange-600" />
                              </Button>
                            )}
                            
                            {/* Enable/Disable Account */}
                            {profile.is_disabled ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setActionType("enable");
                                }}
                                title="Enable Account"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setActionType("disable");
                                }}
                                title="Disable Account"
                              >
                                <Ban className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                            
                            {/* Delete Account */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 hover:bg-red-50 hover:border-red-300"
                              onClick={() => {
                                setSelectedProfile(profile);
                                setActionType("delete");
                              }}
                              title="Delete Account Permanently"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <AlertDialog open={!!selectedProfile && !!actionType} onOpenChange={() => { setSelectedProfile(null); setActionType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={actionType === "delete" ? "text-red-600" : ""}>
              {actionType === "disable" && "Disable Account"}
              {actionType === "enable" && "Enable Account"}
              {actionType === "grant" && "Grant Subscription"}
              {actionType === "revoke" && "Revoke Subscription"}
              {actionType === "delete" && "⚠️ Delete Account Permanently"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  {actionType === "disable" && `Disable ${selectedProfile?.restaurant_name}? They won't be able to access their account.`}
                  {actionType === "enable" && `Enable ${selectedProfile?.restaurant_name}? They will regain access to their account.`}
                  {actionType === "grant" && `Grant a subscription to ${selectedProfile?.restaurant_name}.`}
                  {actionType === "revoke" && `Revoke subscription from ${selectedProfile?.restaurant_name}? This will also disable their account.`}
                  {actionType === "delete" && (
                    <span className="text-red-600 font-medium">
                      This will PERMANENTLY delete {selectedProfile?.restaurant_name} ({selectedProfile?.email}) and ALL their data including menu images, feedback, subscriptions, and payment history. This action CANNOT be undone!
                    </span>
                  )}
                </p>
                
                {actionType === "grant" && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Select Plan</Label>
                      <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} - {formatPrice(plan.price_monthly)}/mo
                              {plan.bell_feature_enabled && " (Bell)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (months)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={grantMonths}
                        onChange={(e) => setGrantMonths(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAccountAction} 
              disabled={actionLoading}
              className={actionType === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {actionType === "delete" ? "Delete Permanently" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create New Account
            </DialogTitle>
            <DialogDescription>
              Create a new restaurant account. The user can login with these credentials.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="restaurant@example.com"
                value={newAccount.email}
                onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                disabled={createLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  disabled={createLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name <span className="text-red-500">*</span></Label>
              <Input
                id="restaurantName"
                placeholder="My Restaurant"
                value={newAccount.restaurantName}
                onChange={(e) => setNewAccount({ ...newAccount, restaurantName: e.target.value })}
                disabled={createLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurantDescription">Description (Optional)</Label>
              <Textarea
                id="restaurantDescription"
                placeholder="Brief description of the restaurant..."
                value={newAccount.restaurantDescription}
                onChange={(e) => setNewAccount({ ...newAccount, restaurantDescription: e.target.value })}
                disabled={createLoading}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={createLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateAccount} disabled={createLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
