import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function createClerkSupabaseClient() {
  const { orgId, userId } = await auth();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  // For this demo, we're using the anon key
  // In production, you'd use Clerk's JWT to authenticate with Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  );

  return {
    supabase,
    orgId: orgId || 'demo_org_1', // fallback for demo
    userId: userId || 'demo_user',
  };
}
