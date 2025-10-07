import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Ensure a single Supabase client across HMR / fast refresh
declare global {
	// eslint-disable-next-line no-var
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
