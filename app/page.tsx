
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CREATE_ROOM_ENDPOINT } from './constants';

export default function Home() {
  const [roomID, setRoomID] = useState("");
  const [bestOf, setBestOf] = useState(3);
  const router = useRouter();

  async function createRoom(bestOf: number){
    var res = await fetch(CREATE_ROOM_ENDPOINT, {
      method: "POST",
      headers: {"Content-Type": "application/json"} ,
      body: JSON.stringify({"BestOf": bestOf})
    })
    if (res.status === 200){
      const data = await res.json();
      console.log(data);
      router.push(`/game/${data.id}`);
    }
  }

  return <div className='flex flex-col place-items-center w-screen h-screen'>
    <h1 
      className='text-white text-[84px] mt-30 pb-20 animate-bounce'
      style={{animationDuration: '10s'}}>CHESS ROUNDS</h1>
    <div className='flex-row flex place-items-center'>
      <input 
        type="number" 
        className='input'
        onChange={(e) => {setBestOf(Number(e.currentTarget.value))}}
        placeholder='best of'
        step={2}
        min={3}
        defaultValue={3}
        />
      <button className='btn m-5 px-25 py-5 min-w-75'
        onClick={() => {createRoom(bestOf)}}
      >Create Room</button>
    </div>
    <div className='flex-row flex place-items-center'>
      <input 
        type="text" 
        className='input' 
        placeholder='room id'
        onInput={(e) => {setRoomID(e.currentTarget.value)}}
        />
      <button 
        className='btn m-5 px-25 py-5 min-w-75'
        onClick={() => {router.push(`/game/${roomID}`);}}
        >Join Room</button>
    </div>
  </div>
}
