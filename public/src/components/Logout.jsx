import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";
import axios from "axios";
import { logoutRoute } from "../utils/APIroutes";
export default function Logout() {
  const navigate = useNavigate();
  const handleClick = async () => {
    try {
      const userData = localStorage.getItem("chat-app-user");
  
      if (userData) {
        const id = JSON.parse(userData)._id;
        const data = await axios.get(`${logoutRoute}/${id}`);
  
        if (data.status === 200) {
          localStorage.clear();
          navigate("/login");
        }
      } else {
        console.error("User data not found in localStorage");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  return (
    <Button onClick={handleClick}>
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;