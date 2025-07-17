
import { GameContext } from "@/chess/GameContext";
import { useContext } from "react";
import Tile from "./Tile";

const pieceSVGPaths: Record<string, string> = {
  "wr": "/white_rook.svg",
  "wn": "/white_knight.svg",
  "wb": "/white_bishop.svg",
  "wq": "/white_queen.svg",
  "wk": "/white_king.svg",
  "wp": "/white_pawn.svg",
  "br": "/black_rook.svg",
  "bn": "/black_knight.svg",
  "bb": "/black_bishop.svg",
  "bq": "/black_queen.svg",
  "bk": "/black_king.svg",
  "bp": "/black_pawn.svg",
  "empty": "/empty.svg",
};

export default function Board(){
    const { board } = useContext(GameContext);
    const squares = Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) =>
            `${String.fromCharCode(97 + col)}${8 - row}`
        )
    ).flat();

    return <div className="grid grid-cols-8 grid-rows-8">
        {
            board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                    const colorKey = piece ? piece.color + piece.type : "empty";
                    return (
                    <Tile
                        key={`${rowIndex}-${colIndex}`}
                        square={squares[rowIndex * 8 + colIndex]}
                        odd={(rowIndex + colIndex) % 2 === 1}
                        piecePath={pieceSVGPaths[colorKey] || pieceSVGPaths["empty"]}
                        selected={false}
                        movable={false}
                        attackable={false}
                    />
                    );
                })
            )
        }
    </div>
}

