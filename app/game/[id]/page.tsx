

'use client'
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { JOIN_ROOM_ENDPOINT } from '../../constants';
import { Message } from '../../types';
import ChatBox from '@/components/ChatBox';

export default function Game() {
    const params = useParams();
    const roomId = params.id as string;
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    
    const socketRef = useRef<WebSocket | null>(null);

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
                    const receivedMessage: Message = JSON.parse(event.data);
                    
                    if (receivedMessage && typeof receivedMessage.sender === 'boolean' && receivedMessage.content) {
                        receivedMessage.sender = false;
                        setMessages(prev => [...prev, receivedMessage]);
                    } else {
                        console.warn('Received invalid message format:', event.data);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                    console.log('Raw message data:', event.data);
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
            var message: Message = {sender: true, content: inputMessage};
            socket.send(JSON.stringify(message));
            setMessages(prev => [...prev, message]);
            setInputMessage('');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <h1 className="text-2xl mt-4 ml-5">Game Room: {roomId}</h1>

            <div className={`mt-4 ml-5 p-2 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className='flex-1'/>
            
            <div className='flex flex-col w-1/5'>

                <div className="min-w-100 min-h-50 max-h-50 bg-slate-200 overflow-scroll ml-5 border-solid border-4 border-indigo-800/20 rounded-xs">
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
                        className="bg-blue-500 text-white px-4 py-2 min-w-100 rounded disabled:bg-gray-400 hover:cursor-pointer"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}