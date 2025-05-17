import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuth } from "./UseAuthStore";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const { socket } = useAuth();
  const messageListenerRef = useRef(null); // reference for cleanup

  const getUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const res = await axiosInstance.get("/message/users");
      setUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (userId) => {
    setIsMessagesLoading(true);
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      setMessages(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (messageData) => {
    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      setMessages((prev) => [...prev, res.data]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  }, [selectedUser]);

  const subscribeToMessages = useCallback(() => {
    if (!socket || !selectedUser) return;

    const handleNewMessage = (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;
      
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === newMessage._id)) {
          return prev; // Duplicate found, skip adding
        }
        return [...prev, newMessage];
      });
    };

    socket.on("newMessage", handleNewMessage);
    messageListenerRef.current = handleNewMessage;
  }, [socket, selectedUser]);

  const unsubscribeFromMessages = useCallback(() => {
    if (socket && messageListenerRef.current) {
      socket.off("newMessage", messageListenerRef.current);
      messageListenerRef.current = null;
    }
  }, [socket]);

  // Auto subscribe/unsubscribe on selected user change
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  return (
    <ChatContext.Provider
      value={{
        users,
        messages,
        selectedUser,
        isUsersLoading,
        isMessagesLoading,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
