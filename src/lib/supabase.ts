
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export { supabase };

export type User = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  notification_frequency?: 'daily' | 'weekly' | 'monthly';
  notification_time?: string;
  created_at: string;
};

export type Problem = {
  id: string;
  user_id: string;
  completed_at: string;
  description?: string;
  category?: string;
  created_at: string;
};

export type NotificationPreference = {
  id: string;
  user_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  created_at: string;
};

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return data;
}

export async function getCompletedProblems(userId: string) {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data || [];
}

export async function addCompletedProblem(userId: string, description?: string, category?: string) {
  const { data, error } = await supabase
    .from('problems')
    .insert([
      { 
        user_id: userId,
        completed_at: new Date().toISOString(),
        description,
        category 
      }
    ]);
    
  if (error) throw error;
  return data;
}

export async function getBothUsersProgress() {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(2);
    
  if (profilesError) throw profilesError;
  
  const result = await Promise.all(
    profiles.map(async (profile) => {
      const problems = await getCompletedProblems(profile.id);
      return {
        ...profile,
        completed: problems.length,
        // Ensure the notification_frequency is typed correctly
        notification_frequency: profile.notification_frequency as 'daily' | 'weekly' | 'monthly'
      };
    })
  );
  
  return result;
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
    
  if (error) throw error;
  return data;
}

export async function updateNotificationPreferences(
  userId: string, 
  preferences: Partial<NotificationPreference>
) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .update(preferences)
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
}
