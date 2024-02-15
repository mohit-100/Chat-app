import Logout from './Logout';
import ChatInput from "./ChatInput";
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid";
import styled from 'styled-components';
import axios from 'axios';
import { useRef } from 'react';

import { getAllMessageRoute, sendMessageRoute } from "../utils/APIroutes";

// ... (previous imports)

function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // Added state for typing indicator
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  const recievemsg = async () => {
    try {
      const data = await JSON.parse(localStorage.getItem("chat-app-user"));
      const response = await axios.post(getAllMessageRoute, {
        from: data._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error.response || error);
    }
  };

  useEffect(() => {
    recievemsg();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
    recievemsg();
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
      socket.current.on("typing", ({ from }) => {
        if (from !== currentUser._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });
    }
  }, [currentUser, socket]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    setIsTyping(true);
    socket.current.emit("typing", { to: currentChat._id, from: currentUser._id });
    setTimeout(() => setIsTyping(false), 2000);
  };


  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            {currentChat.avatarImage ? (
              <img src={`data:image/svg+xml;base64,${currentChat.avatarImage}`} alt="" />
            ) : (
              <div>No Avatar</div>
            )}
          </div>
          <h3 className="username">{currentChat.username}</h3>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">

        {messages.map((message) => (
           <div ref={scrollRef} key={uuidv4()}>
             <div
              className={`message ${message.fromSelf ? "sended" : "recieved"}`}
            >
             <div className="content">
               <p>{message.message}</p>
               </div>
           </div>
            {isTyping && <div className="typing-indicator"> User is typing...</div>}
          </div>
          
          ))}



      </div>
      <ChatInput handleSendMsg={handleSendMsg} handleTyping={handleTyping} />
    </Container>
  );
}

// ... (rest of the code)


const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (max-width: 720px) {
    grid-template-rows: 15% 65% 20%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar {
        img {
          height: 2.5rem;
        }
      }

      .username {
        
          font-size: 1rem;
          color: white;
        
      }
    }
  }

  .chat-messages {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        @media screen and (max-width: 720px) {
          max-width: 70%;
        }
      }
    }

    .sended {
      justify-content: flex-end;

      .content {
        background-color: #4f04ff21;
      }
    }

    .received {
      justify-content: flex-start;
    
      .content {
        background-color: #9900ff20;
      }
    }
    

    // Style for the typing indicator
    .typing-indicator {
      max-width: 40%;
      overflow-wrap: break-word;
      padding: 1rem;
      font-size: 1rem;
      border-radius: 1rem;
      color: #9a86f3; // Choose the color you prefer
      background-color: #080420;
    
      
     
    }

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1rem;
        border-radius: 1rem;
        color: #9a86f3; // Choose the color you prefer
        background-color: #080420; // Choose the background color you prefer

        @media screen and (max-width: 720px) {
          max-width: 70%;
        }
      }
    }
  }
`;


export default ChatContainer;
