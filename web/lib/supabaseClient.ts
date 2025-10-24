/* eslint-disable @typescript-eslint/no-explicit-any */
// Importing via require to avoid type resolution issues in some Next.js setups
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SupaSSR: any = require('@supabase/ssr');

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

function getClient() {
	if (typeof window === 'undefined') {
		// This client is for the browser only
		throw new Error('supabaseClient should only be used in the browser');
	}

	const g = globalThis as any;
	if (g.__supabase_client__) {
		return g.__supabase_client__;
	}

		const client = SupaSSR.createBrowserClient(url, anon);
	g.__supabase_client__ = client;
	return client;
}

export const supabase = typeof window !== 'undefined' ? getClient() : (undefined as any);
