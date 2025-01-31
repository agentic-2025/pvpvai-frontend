import { cn } from "@/lib/utils";
import { AgentAvatar } from "./AgentAvatar";


interface AgentAvatarInteractionProps {
	name: string;
	borderColor: string;
	imageUrl?: string;
	betAmount: number;
	betType?: "Buy" | "Sell";
}

export function AgentAvatarInteraction({
	name,
	borderColor,
	imageUrl,
	betAmount,
	betType,
}: AgentAvatarInteractionProps) {
	const hasBet = betAmount > 0 && betType;

	return (
		<div className="group relative">
			<AgentAvatar
				name={name}
				borderColor={borderColor}
				imageUrl={imageUrl}
				variant="sm"
				className={cn(hasBet && "opacity-70")}
			/>

			{/* Bet Status Overlay */}
			{hasBet && (
				<div
					className={cn(
						"absolute inset-0 flex flex-col items-center justify-center rounded-full h-",
						betType === "Sell"
							? "bg-[rgb(var(--bear-red)_/_0.30)]"
							: "bg-[rgb(var(--bull-green)_/_0.30)]"
					)}
				>
					<div
						className="text-sm font-semibold text-center leading-none"
						style={{
							color: `rgb(var(--${
								betType === "Sell" ? "bear-red" : "bull-green"
							}))`,
						}}
					>
						<div>{betAmount} SOL</div>
						<div className="mt-1">{betType.toUpperCase()}</div>
						<div className="mt-1 flex justify-center">
							<img
								src={
									betType === "Sell"
										? "./assets/bear.svg"
										: "./assets/bull.svg"
								}
								alt={betType}
								className="w-12 h-12"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Hover Overlay */}
			<div
				className={cn(
					"absolute inset-0 bg-white/85 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
					"flex flex-col items-center justify-center gap-0.5",
					"font-medium text-black text-[2rem]"
				)}
			>
				<div>{betAmount > 0 ? "CHANGE" : "PLACE"}</div>
				<div>BET</div>
			</div>
		</div>
	);
}
