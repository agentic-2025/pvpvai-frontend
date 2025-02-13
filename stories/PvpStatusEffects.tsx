import { FC, useEffect, useState } from "react";

interface Status {
  verb: string;
  instigator: string;
  endTime: number;
  parameters: string;
}

// ADDED: Show badge + countdown
export const PvpStatusEffects: FC<{ statuses: Status[] }> = ({ statuses }) => {
  // ADDED: track countdown times
  const [timers, setTimers] = useState<number[]>([]);

  useEffect(() => {
    const updateTimers = () => {
      setTimers(
        statuses.map((status) => {
          const now = Math.floor(Date.now() / 1000);
          const remaining = status.endTime - now;
          return remaining > 0 ? remaining : 0;
        })
      );
    };

    updateTimers(); // initial
    const intervalId = setInterval(updateTimers, 1000);
    return () => clearInterval(intervalId);
  }, [statuses]);

  if (!statuses.length) return null;

  return (
    <div className="absolute -top-2 -right-2 flex flex-wrap gap-1 justify-end">
      {statuses.map((status, idx) => (
        <div
          key={idx}
          // Comment: show that we added countdown timer
          className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
          title={`Applied by ${status.instigator}`}
        >
          {status.verb.toUpperCase()}
          <span className="text-[0.7rem]">
            {/* Comment: countdown in seconds */}
            {timers[idx] > 0 ? `(${timers[idx]}s)` : "(expired)"}
          </span>
        </div>
      ))}
    </div>
  );
};
