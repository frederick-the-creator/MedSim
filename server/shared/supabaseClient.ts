import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@server/types/database.types.js";

export const SUPABASE_URL = process.env.SUPABASE_URL as string;
export const SUPABASE_PUBLISHABLE_KEY = process.env
	.SUPABASE_PUBLISHABLE_KEY as string;

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a Supabase client with publishable key (will  run as anon).
 */
export function createSupabaseClient(): TypedSupabaseClient {
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
		throw new Error(
			"Supabase  client not configured. Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY",
		);
	}
	return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
