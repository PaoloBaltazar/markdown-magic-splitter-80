import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';

export const taskService = {
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Task[];
  },

  async createTask(task: Omit<Task, 'id' | 'created_at'>) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: userData.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  async updateTaskStatus(taskId: string, status: Task['status']) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }
};