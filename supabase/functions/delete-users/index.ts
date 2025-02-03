import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userIds, adminUsername, adminPassword } = await req.json()
    console.log('Received request to delete users:', { userIds, adminUsername })
    
    // Verify admin credentials
    if (adminUsername !== "hradmin712" || adminPassword !== "@dm1n712") {
      console.error('Invalid admin credentials')
      return new Response(
        JSON.stringify({ error: 'Invalid admin credentials' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const errors = []
    console.log('Starting user deletion process')

    // Delete each user
    for (const userId of userIds) {
      console.log(`Processing deletion for user: ${userId}`)
      
      try {
        // First delete notifications for this user
        const { error: notificationsDeleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId);

        if (notificationsDeleteError) {
          console.error(`Error deleting notifications for user ${userId}:`, notificationsDeleteError);
          throw notificationsDeleteError;
        }

        // Then delete tasks created by or assigned to this user
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        if (userProfile) {
          const { error: tasksDeleteError } = await supabase
            .from('tasks')
            .delete()
            .or(`created_by.eq.${userProfile.email},assigned_to.eq.${userProfile.email}`);

          if (tasksDeleteError) {
            console.error(`Error deleting tasks for user ${userId}:`, tasksDeleteError);
            throw tasksDeleteError;
          }
        }

        // Delete employee performance records
        const { error: performanceDeleteError } = await supabase
          .from('employee_performance')
          .delete()
          .eq('employee_id', userId);

        if (performanceDeleteError) {
          console.error(`Error deleting performance records for user ${userId}:`, performanceDeleteError);
          throw performanceDeleteError;
        }

        // Delete comments
        const { error: commentsDeleteError } = await supabase
          .from('comments')
          .delete()
          .eq('user_id', userId);

        if (commentsDeleteError) {
          console.error(`Error deleting comments for user ${userId}:`, commentsDeleteError);
          throw commentsDeleteError;
        }

        // Delete the profile
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (profileDeleteError) {
          console.error(`Error deleting profile for user ${userId}:`, profileDeleteError);
          throw profileDeleteError;
        }

        // Finally delete the user from auth.users
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          userId
        );

        if (deleteError) {
          console.error(`Error deleting auth user ${userId}:`, deleteError);
          throw deleteError;
        }

        console.log(`Successfully deleted user: ${userId}`);
      } catch (error) {
        console.error(`Error in deletion process for user ${userId}:`, error);
        errors.push(`Failed to delete user ${userId}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error('Some users could not be deleted:', errors);
      return new Response(
        JSON.stringify({ error: 'Some users could not be deleted', details: errors }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('All users deleted successfully');
    return new Response(
      JSON.stringify({ message: 'Users deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-users function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})