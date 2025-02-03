import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Clock, AlertTriangle, Trash2, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "deadline" | "overdue" | "status" | "completed" | "assignment" | "mention";
  status: "unread" | "read";
  created_at: string;
  task_id: string;
  user_id: string;
}

const Notifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('status', 'unread');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const deleteAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "All notifications have been deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete notifications",
        variant: "destructive",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    },
  });

  // Subscribe to new notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "deadline":
        return <Clock className="w-5 h-5 text-warning" />;
      case "overdue":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "status":
        return <Bell className="w-5 h-5 text-blue-500" />;
      case "assignment":
        return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
      case "mention":
        return <AtSign className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) {
      toast({
        title: "Info",
        description: "No notifications to delete",
      });
      return;
    }
    deleteAllNotificationsMutation.mutate();
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const unreadCount = notifications.filter(n => n.status === "unread").length;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600 mt-1">
              You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteAll}
              >
                Delete all
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`p-4 ${notification.status === 'unread' ? 'bg-primary/5' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {notification.title}
                      {notification.status === "unread" && (
                        <Badge variant="default" className="ml-2">New</Badge>
                      )}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                </div>
                <div className="flex gap-2">
                  {notification.status === "unread" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No notifications to display
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;