
import ChatRoom from '@/app/_components/chat/page'
import React from 'react'


const Page = ({params}) => {

    
    
  return (
    <ChatRoom roomId={params.roomId} />
  )
}

export default Page