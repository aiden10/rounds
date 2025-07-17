
export type Message = {
    type: string;
    sender: boolean;
    content: string;
}

export type Piece = {
    square: string;
    type: string;
    color: string;
}

export type MoveRequest = {
    type: string;
    boardString: string;
    time: number;
}
