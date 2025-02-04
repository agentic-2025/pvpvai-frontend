"use client";

import AnimatedBackground from "@/components/ui/animated-tabs";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import supabase from "@/lib/config";
import { AgentAvatar } from "@/stories/AgentAvatar";
import { formatDistanceToNow } from "date-fns";
import {
  ClipboardCopy,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from "lucide-react"; // Icons
import usdcIcon from "@/stories/assets/crypto/usdc.svg";
import Image from "next/image";
import autonomeIcon from "@/stories/assets/ai/autonome-full.svg";
import CreateAgentDialog from "@/stories/CreateAgentDialog";

export type Agent = {
  id: number;
  display_name: string;
  image_url: string | null;
  color: string;
  eth_wallet_address: string;
  deployed_to: string; // Changed from platform to deployed_to
  status: "Active" | "Down";
  last_health_check: string;
  earnings: number; // Lifetime earnings
};

const agentCategories = ["All", "Active", "Inactive"];
const PAGE_SIZE = 10; // Default 10 agents per page

export default function AgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Active");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("agents").select("*");

      if (error) {
        console.error("Error fetching agents:", error);
      } else {
        // Normalize "Up" to "Active"
        const mappedAgents = data.map((agent: any) => ({
          ...agent,
          status: agent.status === "Up" ? "Active" : "Down",
          earnings: agent.earnings || 0, // Default to 0 if missing
        }));

        setAgents(mappedAgents);
        setFilteredAgents(mappedAgents); // Set initial filtered agents
      }
      setLoading(false);
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    // Filter agents based on selected category
    let filtered = agents;
    if (selectedCategory === "Active") {
      filtered = agents.filter((agent) => agent.status === "Active");
    } else if (selectedCategory === "Inactive") {
      filtered = agents.filter((agent) => agent.status === "Down");
    }
    setFilteredAgents(filtered);
    setCurrentPage(1); // Reset to first page when changing filter
  }, [selectedCategory, agents]);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredAgents.length / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const displayedAgents = filteredAgents.slice(startIdx, startIdx + PAGE_SIZE);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-8 container mx-auto py-6">
      {/* Tabs for Filtering */}
      <div className="flex justify-between items-center">
        <div className="flex justify-center">
          <div className="bg-secondary/30 p-1.5 rounded-lg">
            <AnimatedBackground
              className="bg-secondary/50 rounded-md"
              defaultValue={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              {agentCategories.map((category) => (
                <button
                  key={category}
                  data-id={category}
                  className="px-6 py-3 rounded-md text-lg font-medium transition-colors"
                >
                  {category}
                </button>
              ))}
            </AnimatedBackground>
          </div>
        </div>
        <CreateAgentDialog />
      </div>

      {/* Table */}
      <Card className="bg-secondary/20 px-4 pt-4 pb-4 rounded-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b-[6px] border-gray-300 dark:border-gray-400">
              <TableHead className="text-lg font-bold text-gray-700 dark:text-gray-200 pl-6 py-3 w-[250px]">
                Agent
              </TableHead>
              <TableHead className="text-lg font-bold text-gray-700 dark:text-gray-200 py-3 text-center w-[220px]">
                Wallet Address
              </TableHead>

              <TableHead className="text-lg font-bold text-gray-700 dark:text-gray-200 py-3 text-center">
                Status
              </TableHead>
              <TableHead className="text-lg font-bold text-gray-700 dark:text-gray-200 py-3 text-center">
                Last Health Check
              </TableHead>
              <TableHead className="text-lg font-bold text-gray-700 dark:text-gray-200 py-3 text-center">
                Deployed To
              </TableHead>
              <TableHead className="text-lg font-bold text-gray-700 dark:text-gray-200 py-3 text-center">
                Lifetime Earnings
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-lg [&_tr]:border-t [&_tr]:border-gray-300/60 dark:[&_tr]:border-gray-400/60">
            {loading ? (
              <TableRow>
                <TableCell className="text-center py-4" colSpan={6}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : displayedAgents.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-4" colSpan={6}>
                  No agents found
                </TableCell>
              </TableRow>
            ) : (
              displayedAgents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-secondary/20">
                  {/* Agent Column with Avatar & Name */}
                  <TableCell className="text-lg pl-6 font-medium">
                    <div className="flex items-center gap-3">
                      <AgentAvatar
                        name={agent.display_name}
                        imageUrl={agent.image_url || ""}
                        borderColor={agent.color}
                        variant="sm"
                      />
                      <span>{agent.display_name || "N/A"}</span>
                    </div>
                  </TableCell>

                  {/* Wallet Address */}
                  <TableCell className="text-lg text-center text-gray-900 dark:text-gray-300">
                    {agent.eth_wallet_address ? (
                      <div className="flex items-center justify-center gap-2">
                        <span>
                          {agent.eth_wallet_address.slice(0, 6)}...
                          {agent.eth_wallet_address.slice(-4)}
                        </span>
                        <ClipboardCopy
                          className="cursor-pointer text-gray-500 hover:text-gray-300"
                          size={18}
                          onClick={() => handleCopy(agent.eth_wallet_address)}
                        />
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell
                    className={`text-lg text-center font-semibold ${
                      agent.status === "Active"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {agent.status}
                  </TableCell>

                  {/* Last Health Check */}
                  <TableCell className="text-lg text-center text-gray-900 dark:text-gray-300">
                    {agent.last_health_check
                      ? formatDistanceToNow(new Date(agent.last_health_check), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </TableCell>

                  {/* Deployed To */}
                  <TableCell className="text-lg text-center text-gray-900 dark:text-gray-300">
                    <Image
                      src={autonomeIcon}
                      alt="alt"
                      className="h-6 w-fit mx-auto"
                    />
                  </TableCell>

                  {/* Lifetime Earnings */}
                  <TableCell className="text-lg text-center text-gray-900 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-1">
                      <Image src={usdcIcon} alt="alt" className="size-6" />
                      {agent.earnings.toFixed(0)} USDC
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        <ChevronLeft
          className="cursor-pointer "
          onClick={() => handlePageChange(currentPage - 1)}
          aria-disabled={currentPage === 1}
        />
        <span className="mx-2 text-gray-700 dark:text-gray-200">
          {currentPage} of {totalPages}
        </span>
        <ChevronRight
          className="cursor-pointer"
          onClick={() => handlePageChange(currentPage + 1)}
          aria-disabled={currentPage === totalPages}
        />
      </div>
    </div>
  );
}
