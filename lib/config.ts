import { Database } from "@/lib/database.types";
import { createClient } from "@supabase/supabase-js";

export const BEAR_RED_HEX = "#E9171A";
export const BULL_GREEN_HEX = "#17E97D";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string
);
export default supabase;
