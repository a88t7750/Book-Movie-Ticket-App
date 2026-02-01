import React from "react";
import { Button, Flex, message, Tabs } from "antd";
import MovieList from "./MovieList";
import TheatreList from "./TheatreList";
import { logout } from "../../calls/authCalls";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/userSlice";


function Admin() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const tabItems = [
    {
      key: "1",
      label: "MovieList",
      children: <MovieList />,
    },

    {
      key: "2",
      label: "TheatreList",
      children: <TheatreList />,
    },
  ];
 async function handleLogout(){
   try {
    const response = await logout()
    if(response && response.success){
      message.success(response.message)
      dispatch(setUserData(null))
      navigate('/login')
    }
  } catch (error) {
    console.error(error)
    message.error(response.message)
  }
 }
  return( 
  <div style={{ position: "relative", width: "100%" }}>
      {/* Logout Button */}
      <Button
        danger
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "12px",
          right: "20px",
          zIndex: 10,
        }}
      >
        Logout
      </Button>

      {/* Tabs */}
      <Tabs items={tabItems} />
    </div>
    )
}

export default Admin;
