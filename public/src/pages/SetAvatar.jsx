import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setAvatarRoute } from "../utils/APIroutes";

const SetAvatar = () => {
  const api = `https://api.multiavatar.com/4645646`;
  const navigate = useNavigate();

  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = [];
      for (let i = 0; i < 4; i++) {
        try {
          const image = await axios.get(`${api}/${Math.round(Math.random() * 1000)}`);
          const buffer = Buffer.from(image.data);

          data.push(buffer.toString("base64"));
        } catch (error) {
          console.error("Error fetching avatar image:", error);
        }
      }
      setAvatars(data);
      setIsLoading(false);
    };

    fetchData();
  }, [api]);

  const checkUser = async () => {
    try {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  useEffect(() => {
    checkUser();
  }, [navigate]);

  const setProfilePicture = async () => {
    if (selectedAvatar == null) {
      toast.error("Please select an avatar before setting it as your profile picture", toastOptions);
      return;
    }

    try {
      const user = await JSON.parse(localStorage.getItem("chat-app-user"));
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem("chat-app-user", JSON.stringify(user));
        navigate("/");
      }
    } catch (error) {
      console.error("Error setting avatar:", error);
      toast.error("Error setting avatar. Please try again.", toastOptions);
    }
  };

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                key={avatar}
                onClick={() => setSelectedAvatar(index)}
              >
                <img
                  src={`data:image/svg+xml;base64,${avatar}`}
                  alt="avatar"
                  key={avatar}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => selectedAvatar !== undefined && setProfilePicture()}
            className="submit-btn"
          >
            Set as Profile Picture
          </button>
        </Container>
      )}
      <ToastContainer />
    </>
  );
};



const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
      text-align: center; /* Center text on smaller screens */
    }
  }

  .avatars {
    display: flex;
    flex-wrap: wrap; /* Allow avatars to wrap to the next line on smaller screens */
    gap: 1rem; /* Reduce gap between avatars on smaller screens */

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
      margin-bottom: 1rem; /* Add space between avatars on smaller screens */
      
      img {
        height: 6rem;
        transition: 0.5s ease-in-out;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }

  .submit-btn {
    background-color: #997af0;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    margin-top: 1rem; /* Add space between avatars and the button on smaller screens */
    
    &:hover {
      background-color: #4e0eff;
    }
  }

  @media screen and (max-width: 600px) {
    .avatars {
      gap: 0.5rem; /* Adjust gap for smaller screens */
      
      .avatar {
        margin-bottom: 0.5rem; /* Adjust margin for smaller screens */
      }
    }

    .submit-btn {
      margin-top: 0.5rem; /* Adjust margin for smaller screens */
    }
  }
`;

export default SetAvatar;