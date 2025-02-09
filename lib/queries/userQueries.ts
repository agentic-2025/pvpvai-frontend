import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { Database } from "../database.types";

const supabase = createClientComponentClient<Database>();

// The base query function
async function getUser(userId: number) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// The hook that uses React Query
export function useUserQuery(userId: number) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2,
  });
}
