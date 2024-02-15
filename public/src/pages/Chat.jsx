import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { allUserRoute,host } from '../utils/APIroutes';
import Contacts from '../components/Contacts';
import Welcome from '../components/Welcome';
import ChatContainer from "../components/ChatContainer"
import {io} from "socket.io-client"
import { useRef } from 'react';

function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat,setCurrentChat] = useState(undefined)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!localStorage.getItem('chat-app-user')) {
          navigate('/login');
        } else {
          setCurrentUser(await JSON.parse(localStorage.getItem('chat-app-user')));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
      fetchData();
  }, []);
  
  useEffect(()=>{
    if(currentUser){
      socket.current = io(host);
      socket.current.emit("add-user",currentUser._id)
    }
  },[currentUser])

  useEffect(() => {
    const fetchData = async () => {
      try {
           
        if (currentUser) {
          if (currentUser.isAvatarImageSet) {
            const data = await axios.get(`${allUserRoute}/${currentUser._id}`);
            setContacts(data.data);
          } else {
            navigate('/setAvatar');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);



   const handleChatChange = (chat) =>{
    setCurrentChat(chat)
   }

  return (
    <Container>
      <div className='container'>
    <Contacts contacts={contacts} currentUser={currentUser} changeChat={handleChatChange} />
    {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket} />
          )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100wh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;
