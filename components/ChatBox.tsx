
import { Message } from '../app/types';

type ChatBoxProps = {
    messages: Message[];
}

export default function ChatBox({messages}: ChatBoxProps){
    return <div className='bg-slate-200 p-5'>
        {
            messages.map((message: Message, index: number) => (
                <div className={message.sender? "chat chat-start": "chat chat-end"} key={index}>
                    <div className={`px-5 py-2 rounded-3xl ${message.sender? "chat-bubble-primary": "chat-bubble-secondary"}`}>
                        {message.content}
                    </div>
                </div>
            ))
        }
    </div>
}