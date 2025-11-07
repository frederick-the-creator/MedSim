import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types.js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env
	.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a Supabase client with publishable key (will  run as anon).
 */
export function createSupabaseClient(): TypedSupabaseClient {
	if (!supabaseUrl || !supabasePublishableKey) {
		throw new Error(
			"Supabase  client not configured. Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY",
		);
	}
	return createClient<Database>(supabaseUrl, supabasePublishableKey);
}

export const supabase = createSupabaseClient();
