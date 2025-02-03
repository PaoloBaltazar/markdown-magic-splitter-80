import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface AllowedIP {
  id: string;
  ip_address: string;
  description: string | null;
  created_at: string;
}

const IPManagement = () => {
  const [newIP, setNewIP] = useState("");
  const [description, setDescription] = useState("");
  const [currentIP, setCurrentIP] = useState<string>("");
  const [isCurrentIPAllowed, setIsCurrentIPAllowed] = useState<boolean | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current IP and validate it
  useEffect(() => {
    const getCurrentIPAndValidate = async () => {
      try {
        // Get current IP
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setCurrentIP(data.ip);

        // Validate IP access
        const { data: validationData } = await supabase.functions.invoke<{ allowed: boolean }>('validate-ip');
        setIsCurrentIPAllowed(validationData?.allowed ?? false);
      } catch (error) {
        console.error('Error fetching IP:', error);
        setIsCurrentIPAllowed(false);
      }
    };
    getCurrentIPAndValidate();
  }, []);

  // Fetch allowed IPs
  const { data: allowedIPs, isLoading, error: fetchError } = useQuery({
    queryKey: ['allowed-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowed_ips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AllowedIP[];
    }
  });

  // Add new IP
  const addIPMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('allowed_ips')
        .insert([{ 
          ip_address: newIP, 
          description,
          created_by: user.id 
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-ips'] });
      setNewIP("");
      setDescription("");
      toast({
        title: "Success",
        description: "IP address has been added to the allowlist",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add IP address. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding IP:', error);
    }
  });

  // Delete IP
  const deleteIPMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('allowed_ips')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-ips'] });
      toast({
        title: "Success",
        description: "IP address has been removed from the allowlist",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove IP address. Please try again.",
        variant: "destructive",
      });
      console.error('Error removing IP:', error);
    }
  });

  const handleAddIP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIP) {
      toast({
        title: "Error",
        description: "Please enter an IP address",
        variant: "destructive",
      });
      return;
    }
    addIPMutation.mutate();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">IP Access Management</h1>
          <p className="text-muted-foreground">Manage allowed IP addresses for application access</p>
        </div>

        {currentIP && (
          <Card className="p-4 bg-muted">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Your Current IP Address: {currentIP}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {isCurrentIPAllowed ? (
                    <span className="text-success">Allowed</span>
                  ) : (
                    <span className="text-destructive">Not Allowed</span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <form onSubmit={handleAddIP} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="ip" className="text-sm font-medium">IP Address</label>
                <Input
                  id="ip"
                  placeholder="Enter IP address"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={addIPMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Add IP Address
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Allowed IP Addresses</h2>
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : fetchError ? (
            <Card className="p-4">
              <div className="flex items-center text-destructive">
                <p>Error loading IP addresses</p>
              </div>
            </Card>
          ) : allowedIPs?.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No IP addresses have been added yet</p>
          ) : (
            <div className="grid gap-4">
              {allowedIPs?.map((ip) => (
                <Card key={ip.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ip.ip_address}</p>
                      {ip.description && (
                        <p className="text-sm text-muted-foreground">{ip.description}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteIPMutation.mutate(ip.id)}
                      disabled={deleteIPMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IPManagement;