import { Layout } from "@/components/Layout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { TaskForm } from "@/components/dashboard/TaskForm";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/task";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { EventList } from "@/components/calendar/EventList";
import { startOfDay, endOfDay, parseISO, isEqual } from "date-fns";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Calendar: Real-time update received', payload);
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch tasks using React Query
  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive",
        });
        throw error;
      }

      return data as Task[];
    },
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    if (selectedDate) {
      const tasksForDate = getEventsForDate(selectedDate);
      if (tasksForDate.length > 0) {
        toast({
          title: `Tasks for selected date`,
          description: `${tasksForDate.length} task(s) due`,
        });
      }
    }
  };

  const handleTaskCreated = () => {
    refetchTasks();
  };

  const getEventsForDate = (selectedDate: Date) => {
    if (!selectedDate) return [];

    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    return tasks
      .filter(task => {
        const taskDate = parseISO(task.deadline);
        return taskDate >= start && taskDate <= end;
      })
      .map(task => ({
        id: task.id,
        title: task.title,
        date: parseISO(task.deadline),
        type: 'task' as const,
        priority: task.priority,
        status: task.status,
        created_by: task.created_by,
        assigned_to: task.assigned_to
      }));
  };

  const events = date ? getEventsForDate(date) : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-500 mt-1">Manage your schedule and tasks efficiently</p>
          </div>
          <div className="flex gap-4">
            <TaskForm onTaskCreated={handleTaskCreated} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 overflow-hidden bg-white">
            <div className="p-6">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md"
              />
            </div>
          </Card>

          <Card className="lg:col-span-4 bg-white">
            <EventList selectedDate={date} events={events} />
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;