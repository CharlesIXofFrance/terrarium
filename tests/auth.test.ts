import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

describe('Authentication Flow', () => {
  const supabaseUrl = 'http://127.0.0.1:54321';
  const supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1dZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  let supabase: SupabaseClient;

  beforeAll(() => {
    console.log('Setting up Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  });

  it('should verify API health', async () => {
    console.log('Testing API health...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    console.log('API Response status:', response.status);
    expect(response.status).toBe(200);

    const data = await response.json();
    console.log('API Response:', data);
    expect(data).toBeDefined();
  }, 5000);

  it('should sign up a new user', async () => {
    const testEmail = `test${Date.now()}@example.com`;
    console.log('Starting signup test with email:', testEmail);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    console.log('Signup response:', data);
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(testEmail);
  }, 5000);
});
