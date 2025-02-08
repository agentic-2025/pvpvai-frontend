import { Tables } from "@/lib/database.types";
import { Skeleton } from "@/components/ui/skeleton";

interface RoundNavigationProps {
  roomData: Tables<"rooms">;
  roundList: { id: number; created_at: string }[];
  currentRoundIndex: number;
  timeLeft: string | null;
  isLoadingRoom: boolean;
  isLoadingRounds: boolean;
  onPrevRound: () => void;
  onNextRound: () => void;
}

export function RoundNavigation({
  roomData,
  roundList,
  currentRoundIndex,
  timeLeft,
  isLoadingRoom,
  isLoadingRounds,
  onPrevRound,
  onNextRound,
}: RoundNavigationProps) {
  if (isLoadingRoom || isLoadingRounds) {
    return (
      <div className="h-[20%] bg-card rounded-lg p-4 flex flex-col items-center justify-center gap-y-2">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-6 w-40" />
      </div>
    );
  }

  return (
    <div className="h-[20%] bg-card rounded-lg p-4 flex flex-col items-center justify-center gap-y-2">
      <div className="flex items-center gap-4">
        <button
          onClick={onPrevRound}
          disabled={currentRoundIndex >= roundList.length - 1}
          className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Round {currentRoundIndex + 1} / {roundList.length}
        </span>
        <button
          onClick={onNextRound}
          disabled={currentRoundIndex <= 0}
          className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <span>Room ID: {roomData.id}</span>
      <span className="text-3xl font-bold bg-[#E97B17] text-white py-3 px-4">
        {timeLeft}
      </span>
      <span className="text-lg font-semibold">
        {roomData.participants} Participants
      </span>
    </div>
  );
}
