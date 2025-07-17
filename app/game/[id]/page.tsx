'use client';
import { GameProvider } from '@/chess/GameContext';
import GameInner from '@/components/GameInner';

export default function GamePage() {
    return (
        <GameProvider>
            <GameInner />
        </GameProvider>
    );
}
