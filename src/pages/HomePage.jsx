import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import CallOverlay from "../components/CallOverlay";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedChat } = useContext(ChatContext);

  return (
    <div className="wa-shell">
      <CallOverlay />
      <div className={`wa-main-card ${selectedChat ? "wa-three-col" : ""}`}>
        <Sidebar />
        <ChatContainer />
        {selectedChat && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;
