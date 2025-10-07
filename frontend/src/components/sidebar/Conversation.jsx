import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Conversation = ({ conversation, lastIdx }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const navigate = useNavigate(); // 🧭

  const isSelected = selectedConversation?._id === conversation._id;
  const isOnline = onlineUsers.includes(conversation._id);

  const handleSelect = () => {
    setSelectedConversation(conversation);
    navigate("/"); // 🧭 go to Home
  };

  return (
    <>
      <div
        id={conversation._id}
        className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer 
        ${isSelected ? "bg-sky-500" : ""}`}
        onClick={handleSelect}
      >
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-12 rounded-full">
            <img src={conversation.profilePic} alt="user avatar" />
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-3 justify-between">
            <p className="font-bold text-gray-200">{conversation.fullname}</p>
            <span className="text-xl">😍</span>
          </div>
        </div>
      </div>

      {!lastIdx && <div className="divider my-0 h-1" />}
    </>
  );
};

export default Conversation;