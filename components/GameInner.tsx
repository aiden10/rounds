

'use client'
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { JOIN_ROOM_ENDPOINT } from '../shared/constants';
import { Message, MoveRequest } from '../shared/types';
import ChatBox from '@/components/ChatBox';
import Board from '@/components/Board';
import { useGameContext } from '@/chess/GameContext';

export default function GameInner() {
    const { chess, fromSquare, toSquare, p1Time, turn,
            setFromSquare, setToSquare, setBoard, 
            setP2Time, setTurn } = useGameContext();
    const params = useParams();
    const roomId = params.id as string;
    const [side, setSide] = useState(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!fromSquare || !toSquare) return;
        try {
            chess.move({from: fromSquare, to: toSquare});
        } catch (error){
            setFromSquare('');
            setToSquare('');
            console.log(`error while making move: ${error}`)
            return;
        }
        setFromSquare('');
        setToSquare('');
        setTurn(false);
        setBoard(chess.board());
        sendGameData(chess.fen(), p1Time);
    }, [toSquare]);

    useEffect(() => {
        if (roomId) {
            console.log('Connecting to room:', roomId);
            
            const ws = new WebSocket(JOIN_ROOM_ENDPOINT + roomId);
            
            // Connection opened
            ws.onopen = () => {
                console.log('Connected to WebSocket');
                setIsConnected(true);
                setSocket(ws);
                socketRef.current = ws;
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    switch (data.type) {
                        case "role":
                            console.log("Assigned role:", data.side);
                            setSide(data.side);
                            setTurn(data.side !== "black");
                            break;
                        
                        case "message":
                            data.sender = false;
                            setMessages(prev => [...prev, data]);
                            break;

                        case "move":
                            setP2Time(data.time);
                            chess.load(data.boardString);
                            setBoard(chess.board());
                            setTurn(true);
                            break;
                        
                        default:
                            console.log("unknown data type received:", data.type);
                            break;
                    }
                } catch (error) {
                    console.error('Error parsing data:', error);
                    console.log('Raw data:', event.data);
                }
            };
            // Connection closed
            ws.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                setIsConnected(false);
                setSocket(null);
                socketRef.current = null;
            };

            // Connection error
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };

            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
        }
    }, [roomId]);

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN && inputMessage.trim()) {
            var message: Message = {type: "message", sender: true, content: inputMessage};
            socket.send(JSON.stringify(message));
            setMessages(prev => [...prev, message]);
            setInputMessage('');
        }
    };

    const sendGameData = (fenBoard: string, p1Time: number) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            var request: MoveRequest = {type: "move", boardString: fenBoard, time: p1Time};
            socket.send(JSON.stringify(request));
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <h1 className="text-2xl mt-4 ml-5">Room: {roomId}</h1>
            <div className={`mt-4 ml-5 p-2 rounded text-black ${isConnected ? 'bg-emerald-300' : 'bg-red-400'}`}>
                Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className='flex md:flex-row flex-col'>
                <div className='flex flex-col w-1/5 mt-10'>
                    <div className="flex items-center ml-5 mb-5 space-x-5">
                        <div className="relative w-4 h-4">
                            {turn ? (
                            <>
                                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                                <div className="absolute inset-0 rounded-full bg-emerald-400" />
                            </>
                            ) : (
                            <div className="absolute inset-0 rounded-full bg-red-400" />
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-100">
                            You are: <strong className="capitalize">{side}</strong>
                        </span>
                    </div>                    
                    <div className="min-w-100 min-h-50 max-h-50 bg-white overflow-scroll ml-5 border-solid border-4 border-[#d0e0ef] rounded-xs">
                        <ChatBox messages={messages}/>
                    </div>
    
                    <div className="mb-4 p-5">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="border p-2 mb-4 rounded min-w-100"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button 
                            onClick={sendMessage}
                            className="btn text-white px-4 py-2 min-w-100 rounded disabled:bg-gray-400 hover:cursor-pointer"
                        >
                            Send
                        </button>
                    </div>
                </div>
                <div className='m-10 md:px-50'>
                    <Board/>
                </div>
            </div>
        </div>
        );
    }