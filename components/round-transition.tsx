import { motion } from "framer-motion";

interface RoundTransitionProps {
  previousRound: number;
  nextRound: number;
}

export function RoundTransition({ previousRound, nextRound }: RoundTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card p-8 rounded-lg shadow-lg text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Round Transition</h2>
        <p className="text-lg">
          Round {previousRound} → Round {nextRound}
        </p>
        <div className="mt-4">
          <motion.div
            className="h-2 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
