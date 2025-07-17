
'use client'

import { createContext, useState, useContext, SetStateAction, Dispatch } from "react";
import { STARTING_SECONDS } from "@/shared/constants";
import { Square, Chess, DEFAULT_POSITION, PieceSymbol, Color } from "chess.js";

type GameContext = {
    chess: Chess;
    board: ({ square: Square; type: PieceSymbol; color: Color;}  | null)[][];
    turn: boolean;
    fromSquare: string;
    toSquare: string;
    p1Time: number;
    p2Time: number;
    moves: Square[];
    setFromSquare: (newSquare: string) => void;
    setToSquare: (newSquare: string) => void;
    setBoard: Dispatch<SetStateAction<({ square: Square; type: PieceSymbol; color: Color; } | null)[][]>>;
    setTurn: (newTurn: boolean) => void;
    setP1Time: (newTime: number) => void;
    setP2Time: (newTime: number) => void;
}

export const GameContext = createContext<GameContext>(null!);
export function useGameContext() {
    return useContext(GameContext);
}
export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [chess, setChess] = useState(new Chess(DEFAULT_POSITION));
    const [board, setBoard] = useState(chess.board());
    const [turn, setTurn] = useState(true);
    const [fromSquare, setFromSquare] = useState(''); 
    const [toSquare, setToSquare] = useState('');
    const [p1Time, setP1Time] = useState(STARTING_SECONDS);
    const [p2Time, setP2Time] = useState(STARTING_SECONDS);
    const [moves, setMoves] = useState([]);

    return <GameContext.Provider
        value={{
            chess,
            board,
            turn,
            fromSquare,
            toSquare,
            p1Time,
            p2Time,
            moves,
            setFromSquare,
            setToSquare,
            setBoard,
            setTurn,
            setP1Time,
            setP2Time
        }}
    >
        {children}
    </GameContext.Provider>
}

