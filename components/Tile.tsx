
import { GameContext } from "@/chess/GameContext";
import { useContext } from "react";

type TileProps = {
    piecePath: string;
    square: string;
    movable: boolean;
    attackable: boolean;
    selected: boolean;
    odd: boolean;
}

export default function Tile({piecePath, movable, attackable, selected, odd, square}: TileProps){
    const { fromSquare, toSquare, turn, setFromSquare, setToSquare } = useContext(GameContext);

    var color = odd? "bg-white": "bg-[#d0e0ef]";
    if (selected)
        color = "bg-amber-100"
    return (
        <div 
            className={`md:min-w-17 md:min-h-17 ${color} justify-center place-items-center hover:opacity-90 duration-100`}
            onClick={() => {
                if (!turn){
                    console.log("not your turn");
                    return;
                }
                if (fromSquare === ''){
                    console.log(`set fromSquare (${square})`);
                    setFromSquare(square);
                }
                else{
                    console.log(`set toSquare (${square})`);
                    setToSquare(square);
                }
            }}>
            <img src={piecePath} alt="piece" className="md:translate-x-[10px] md:translate-y-[8px] md:scale-125"/>
        </div>
    );
}
