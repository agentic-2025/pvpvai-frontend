"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/config";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { AgentAvatar } from "@/stories/AgentAvatar";
import { ClipboardCopy } from "lucide-react";
import Image from "next/image";
import usdcIcon from "@/stories/assets/crypto/usdc.svg";
import { Database } from "@/lib/database.types";

export type Agent = Database["public"]["Tables"]["agents"]["Row"];

export default function AgentsTable() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAgents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("agents")
        .select(
          "id, display_name, type, earnings, eth_wallet_address, image_url, color"
        )
        .order("id", { ascending: false })
        .limit(5);

      if (data) {
        setAgents(data);
      }
      setLoading(false);
    };

    fetchRecentAgents();
  }, []);

  // Create an array of 5 skeleton rows that show static row numbers.
  const skeletonRows = Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>{index + 1}</TableCell>
      <TableCell className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-300 animate-pulse rounded-full"></div>
        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
      </TableCell>
      <TableCell className="text-sm text-center">
        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <div className="h-4 w-4 bg-gray-300 animate-pulse rounded"></div>
          <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
        </div>
      </TableCell>
    </TableRow>
  ));

  return (
    <Table className="bg-transparent">
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">#</TableHead>
          <TableHead className="text-left">Agent</TableHead>
          <TableHead className="text-center">Address</TableHead>
          <TableHead className="text-center">Earnings</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? skeletonRows
          : agents.map((agent, index) => (
              <TableRow key={agent.id} className="h-16">
                {/* Row number cell */}
                <TableCell>{index + 1}</TableCell>
                <TableCell className="flex items-center gap-3">
                  <AgentAvatar
                    id={agent.id}
                    name={agent.display_name}
                    imageUrl={agent.image_url || "/default-agent.png"}
                    borderColor={agent.color}
                    variant="sm"
                  />
                  <span>{agent.display_name}</span>
                </TableCell>
                <TableCell className="text-sm text-center text-gray-900 dark:text-gray-300">
                  {agent.eth_wallet_address ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>
                        {agent.eth_wallet_address.slice(0, 6)}...
                        {agent.eth_wallet_address.slice(-4)}
                      </span>
                      <ClipboardCopy
                        className="cursor-pointer text-gray-400 hover:text-gray-300"
                        size={14}
                        onClick={() =>
                          navigator.clipboard.writeText(
                            agent?.eth_wallet_address || ""
                          )
                        }
                      />
                    </div>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Image
                      src={usdcIcon}
                      alt="USDC"
                      className="w-4 h-4"
                      width={16}
                      height={16}
                    />
                    {agent.earnings !== null
                      ? agent.earnings.toFixed(0)
                      : "N/A"}{" "}
                    USDC
                  </div>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
