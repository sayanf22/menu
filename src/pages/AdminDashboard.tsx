import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Ban, CheckCircle, Plus, Trash2, Copy } from "lucide-react";
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

interface Profile {
  id: string;
  email: string;
  restaurant_name: string;
  restaurant_description: string | null;
  created_at: string;
  is_disabled: boolean | null;
  disabled_at: string | null;
  approval_status: string | null;
}

interface SignupCode {
  id: string;
  code: string;
  max_uses: number | null;
  current_uses: number | null;
  created_at: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [actionType, setActionType] = useState<"disable" | "enable" | null>(null);
  const [signupCodes, setSignupCodes] = useState<SignupCode[]>([]);
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(1);
  const [customCode, setCustomCode] = useState("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [deleteCodeId, setDeleteCodeId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      const sessionToken = localStorage.getItem("admin_session_token");
      
      if (!sessionToken) {
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
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/adminlogin");
        return;
      }

      setIsAdmin(true);
      loadProfiles();
      loadSignupCodes();
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
      toast({
        title: "Error",
        description: "Failed to load user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSignupCodes = async () => {
    try {
      const { data, error } = await supabase.rpc("admin_get_signup_codes");

      if (error) throw error;
      
      setSignupCodes(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load signup codes",
        variant: "destructive",
      });
    }
  };

  const generateSignupCode = async () => {
    setGeneratingCode(true);
    try {
      // Use custom code if provided, otherwise generate random
      const code = customCode.trim() || Math.random().toString(36).substring(2, 14).toUpperCase();
      
      // Validate code length
      if (code.length < 6) {
        toast({
          title: "Error",
          description: "Code must be at least 6 characters long",
          variant: "destructive",
        });
        setGeneratingCode(false);
        return;
      }

      const { data, error } = await supabase.rpc("admin_create_signup_code", {
        code_value: code,
        max_uses_value: newCodeMaxUses,
      });

      if (error) throw error;

      // Check if the RPC returned an error in the data
      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        toast({
          title: "Error",
          description: (data as any).error || "Failed to generate signup code",
          variant: "destructive",
        });
        setGeneratingCode(false);
        return;
      }

      toast({
        title: "Success",
        description: `Signup code generated: ${code}`,
      });
      
      // Reset form
      setNewCodeMaxUses(1);
      setCustomCode("");
      await loadSignupCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to generate signup code: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const deleteSignupCode = async () => {
    if (!deleteCodeId) return;

    try {
      const { data, error } = await supabase.rpc("admin_delete_signup_code", {
        code_id: deleteCodeId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Signup code deleted",
      });
      
      await loadSignupCodes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete signup code: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeleteCodeId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const handleAccountAction = async () => {
    if (!selectedProfile || !actionType) return;

    try {
      const isDisabling = actionType === "disable";
      const adminEmail = localStorage.getItem("admin_email") || "admin";

      const { data, error } = await supabase.rpc("admin_update_profile_status", {
        profile_id: selectedProfile.id,
        is_disabled_value: isDisabling,
        disabled_by_email: isDisabling ? adminEmail : null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Account ${isDisabling ? "disabled" : "enabled"} successfully`,
      });

      await loadProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update account status: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSelectedProfile(null);
      setActionType(null);
    }
  };

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem("admin_session_token");
    
    if (sessionToken) {
      await supabase
        .from("admin_sessions")
        .delete()
        .eq("session_token", sessionToken);
    }
    
    localStorage.removeItem("admin_session_token");
    localStorage.removeItem("admin_email");
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    
    navigate("/adminlogin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage user accounts and signup codes</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts">User Accounts</TabsTrigger>
            <TabsTrigger value="codes">Signup Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>
                  Manage user accounts - disable accounts for non-payment or enable after payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Restaurant Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.restaurant_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{profile.email}</TableCell>
                          <TableCell className="hidden lg:table-cell max-w-xs truncate">
                            {profile.restaurant_description || "No description"}
                          </TableCell>
                          <TableCell>
                            {profile.is_disabled ? (
                              <Badge variant="destructive">Disabled</Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-500">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {profile.is_disabled ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setActionType("enable");
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Enable
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedProfile(profile);
                                  setActionType("disable");
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Disable
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes">
            <Card>
              <CardHeader>
                <CardTitle>Signup Codes</CardTitle>
                <CardDescription>
                  Generate and manage signup codes for new restaurant registrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customCode">Custom Code (Optional)</Label>
                      <Input
                        id="customCode"
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        placeholder="Leave empty for random code"
                      />
                      <p className="text-xs text-muted-foreground">
                        Min 6 characters. Leave empty to auto-generate.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxUses">Number of Uses</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        min="1"
                        value={newCodeMaxUses}
                        onChange={(e) => setNewCodeMaxUses(parseInt(e.target.value) || 1)}
                        placeholder="How many people can use this code?"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={generateSignupCode} 
                    disabled={generatingCode}
                    className="w-full"
                  >
                    {generatingCode ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {customCode.trim() ? "Create Custom Code" : "Generate Random Code"}
                      </>
                    )}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead className="hidden sm:table-cell">Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signupCodes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No signup codes yet. Generate one to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        signupCodes.map((code) => (
                          <TableRow key={code.id}>
                            <TableCell className="font-mono font-medium">
                              {code.code}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                (code.current_uses || 0) >= (code.max_uses || 1) 
                                  ? "destructive" 
                                  : "default"
                              }>
                                {code.current_uses || 0} / {code.max_uses || 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {code.created_at ? new Date(code.created_at).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(code.code)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeleteCodeId(code.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "disable" ? "Disable Account" : "Enable Account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "disable"
                ? `Are you sure you want to disable ${selectedProfile?.restaurant_name}? They won't be able to access their account until you enable it again.`
                : `Are you sure you want to enable ${selectedProfile?.restaurant_name}? They will regain full access to their account.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccountAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteCodeId} onOpenChange={() => setDeleteCodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Signup Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this signup code? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSignupCode}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
