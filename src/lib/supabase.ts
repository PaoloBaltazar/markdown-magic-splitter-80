import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const supabaseUrl = 'https://pnuqluofutrzeigqtdju.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudXFsdW9mdXRyemVpZ3F0ZGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNDE1MzUsImV4cCI6MjA1MTcxNzUzNX0.uTN6_df0o5_zVuiZ3fGD63FMGfQp4D4tmIsSdnnoNmI';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);