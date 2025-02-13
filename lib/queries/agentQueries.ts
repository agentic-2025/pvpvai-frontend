import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, Tables } from "../database.types";

const supabase = createClientComponentClient<Database>();

/**
 * Hook to fetch a single agent by ID
 */
export function useAgentQuery(agentId: number) {
  return useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => fetchAgent(agentId),
    enabled: !!agentId,
  });
}

export function useAgentByWalletAddressQuery(roomId: number, walletAddress: string) {
  return useQuery({
    queryKey: ["agent", roomId, walletAddress],
    queryFn: () => fetchAgentByWalletAddress(roomId, walletAddress),
    enabled: !!roomId && !!walletAddress,
  });
}

async function fetchAgent(agentId: number) {
  let query = supabase.from("agents").select("*");

  query = query.eq("id", agentId);

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching agent:", error);
    throw error;
  }

  return data;
}

async function fetchAgentByWalletAddress(roomId: number, walletAddress: string) {
  console.log("Fetching agent by wallet address:", walletAddress, "for room", roomId);

  const { data, error } = await supabase
    .from("room_agents")
    .select("*, agents(*)")
    .eq("wallet_address", walletAddress)
    .eq("room_id", roomId);

  if (error) {
    console.error("Error fetching agent:", error);
    throw error;
  }

  if (!data) {
    console.error("No agent found by wallet address:", walletAddress);
    return null;
  }

  return data[0].agents;
}

/**
 * Hook to fetch multiple agents
 * @param options Optional filtering and sorting options
 */
export const useAgentsQuery = (options?: {
  creatorId?: number;
  type?: string;
  status?: string;
  limit?: number;
  orderBy?: {
    column: keyof Tables<"agents">;
    ascending?: boolean;
  };
}) => {
  return useQuery({
    queryKey: ["agents", options],
    queryFn: async () => {
      let query = supabase.from("agents").select("*");

      // Apply filters if provided
      if (options?.creatorId) {
        query = query.eq("creator_id", options.creatorId);
      }
      if (options?.type) {
        query = query.eq("type", options.type);
      }
      if (options?.status) {
        query = query.eq("status", options.status);
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching agents", error);
        throw error;
      }
      return data as Tables<"agents">[];
    },
  });
};

/**
 * Hook to fetch agents by IDs
 * Useful when you need to fetch specific agents by their IDs
 * Will check if we have data for an individual agent in cache first, will fetch missing agents, and then will update the cache
 * If you end up w/ stale data or unexpected side effects, remove the cache handling logic.
 * It was added since we'll have very few agents when starting out, we'll get diminishing returns as we scale.
 */
export const useAgentsByIdsQuery = (agentIds: number[]) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["agents", agentIds],
    queryFn: async () => {
      if (!agentIds.length) return [];

      // Check cache for existing agents
      const cachedAgents: Array<Tables<"agents"> | undefined> = agentIds.map(
        (id) => queryClient.getQueryData(["agent", id])
      );

      // Find IDs that need to be fetched
      const missingIds = agentIds.filter((id, index) => !cachedAgents[index]);

      if (!missingIds.length) {
        // If all agents are cached, return cached data
        return cachedAgents.filter(
          (agent): agent is Tables<"agents"> => agent !== undefined
        );
      }

      // Fetch missing agents
      const { data: fetchedAgents, error } = await supabase
        .from("agents")
        .select("*")
        .in("id", missingIds);

      if (error) {
        console.error("Error fetching agents by ids", error);
        throw error;
      }

      // Update cache for individual agents
      fetchedAgents?.forEach((agent) => {
        queryClient.setQueryData(["agent", agent.id], agent);
      });

      // Merge cached and fetched data
      return agentIds
        .map((id) => {
          const cached = queryClient.getQueryData<Tables<"agents">>([
            "agent",
            id,
          ]);
          return cached ?? fetchedAgents?.find((a) => a.id === id);
        })
        .filter((agent): agent is Tables<"agents"> => agent !== undefined);
    },
    enabled: agentIds.length > 0,
  });
};
