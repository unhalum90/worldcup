/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !anon) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  console.error('See documentation: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs');
}

// Ensure a single Supabase client across HMR / fast refresh
declare global {
	var __supabase_client__: any | undefined;
}

const getClient = () => {
	if (typeof global !== 'undefined' && (global as any).__supabase_client__) {
		return (global as any).__supabase_client__;
	}

	const client = createClient(url, anon);

	if (typeof global !== 'undefined') {
		(global as any).__supabase_client__ = client;
	}

	return client;
};

export const supabase = getClient();
