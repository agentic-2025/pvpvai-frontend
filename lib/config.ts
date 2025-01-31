import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

export const supabase = createClient<Database>(
  "https://fxewzungnacaxpsnowcu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZXd6dW5nbmFjYXhwc25vd2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NDM2ODUsImV4cCI6MjA1MzUxOTY4NX0.AjLDdq1uleGezfGXpCcRMK0YaeMa7PlVp8YDkhPt0L0"
);
