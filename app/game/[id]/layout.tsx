
import { GameProvider } from "@/chess/GameContext";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
