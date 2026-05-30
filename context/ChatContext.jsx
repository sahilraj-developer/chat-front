import { useCallback, useContext, useEffect, useState, createContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatSettings, setChatSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("chats");
  const [unseenMessages, setUnseenMessages] = useState({});
  const [unseenGroups, setUnseenGroups] = useState({});
  const [unseenCommunities, setUnseenCommunities] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [lastMessageByGroup, setLastMessageByGroup] = useState({});
  const [lastMessageByCommunity, setLastMessageByCommunity] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [allCalls, setAllCalls] = useState([]);
  const typingTimers = useRef({});

  const { socket, axios } = useContext(AuthContext);

  // ── Data fetchers ──────────────────────────────────────
  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
        if (data.lastMessages) setLastMessages(data.lastMessages);
      }
    } catch (error) { toast.error(error.message); }
  }, [axios]);

  const getGroups = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/groups");
      if (data.success) {
        setGroups(data.groups);
        setUnseenGroups(data.unseenByGroup || {});
        if (data.lastMessageByGroup) setLastMessageByGroup(data.lastMessageByGroup);
      }
    } catch (error) { toast.error(error.message); }
  }, [axios]);

  const getCommunities = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/communities");
      if (data.success) {
        setCommunities(data.communities);
        setUnseenCommunities(data.unseenByCommunity || {});
        if (data.lastMessageByCommunity) setLastMessageByCommunity(data.lastMessageByCommunity);
      }
    } catch (error) { toast.error(error.message); }
  }, [axios]);

  const getAllCalls = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/calls/history");
      if (data.success) setAllCalls(data.calls || []);
    } catch { /* silent */ }
  }, [axios]);

  const refreshAll = useCallback(() => {
    getUsers(); getGroups(); getCommunities();
  }, [getUsers, getGroups, getCommunities]);

  // ── Group / Community CRUD ─────────────────────────────
  const createGroup = async (payload) => {
    const { data } = await axios.post("/api/groups", payload);
    if (data.success) {
      toast.success("Group created");
      await getGroups();
      setSelectedChat({ type: "group", data: data.group });
      setActiveTab("groups");
      return data.group;
    }
    toast.error(data.message); return null;
  };

  const createCommunity = async (payload) => {
    const { data } = await axios.post("/api/communities", payload);
    if (data.success) {
      toast.success("Community created");
      await getCommunities();
      setSelectedChat({ type: "community", data: data.community });
      setActiveTab("communities");
      return data.community;
    }
    toast.error(data.message); return null;
  };

  const joinCommunity = async (inviteCode) => {
    const { data } = await axios.post("/api/communities/join", { inviteCode });
    if (data.success) {
      toast.success("Joined community");
      await getCommunities();
      return data.community;
    }
    toast.error(data.message); return null;
  };

  // ── Messages ───────────────────────────────────────────
  const getMessages = useCallback(async (chat, before = null) => {
    if (!chat) return;
    try {
      let url = "";
      if (chat.type === "user") url = `/api/messages/${chat.data._id}`;
      else if (chat.type === "group") url = `/api/messages/group/${chat.data._id}`;
      else if (chat.type === "community") url = `/api/messages/community/${chat.data._id}`;

      const params = { limit: 50 };
      if (before) params.before = before;

      const { data } = await axios.get(url, { params });
      if (data.success) {
        if (before) {
          setMessages((prev) => [...data.messages, ...prev]);
        } else {
          setMessages(data.messages);
        }
        setHasMoreMessages(data.hasMore ?? false);
      }
      
      // Fetch settings if it's a direct chat
      if (chat.type === "user" && !before) {
        const settingsRes = await axios.get(`/api/messages/settings/${chat.data._id}`);
        if (settingsRes.data.success) {
          setChatSettings(settingsRes.data.settings);
        }
      } else if (chat.type !== "user" && !before) {
        setChatSettings(null); // Clear settings for groups/communities
      }
    } catch (error) { toast.error(error.message); }
  }, [axios]);

  const updateChatSettings = async (theme, backgroundImageBase64) => {
    if (!selectedChat || selectedChat.type !== "user") return;
    try {
      const { data } = await axios.post(`/api/messages/settings/${selectedChat.data._id}`, {
        theme,
        backgroundImageBase64,
      });
      if (data.success) {
        setChatSettings(data.settings);
        toast.success("Chat settings updated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadEarlierMessages = useCallback((chat) => {
    if (!hasMoreMessages || messages.length === 0) return;
    getMessages(chat, messages[0]._id);
  }, [hasMoreMessages, messages, getMessages]);

  const sendMessage = async (messageData) => {
    if (!selectedChat) return;
    try {
      let url = "";
      if (selectedChat.type === "user") url = `/api/messages/send/${selectedChat.data._id}`;
      else if (selectedChat.type === "group") url = `/api/messages/send/group/${selectedChat.data._id}`;
      else if (selectedChat.type === "community") url = `/api/messages/send/community/${selectedChat.data._id}`;

      const { data } = await axios.post(url, messageData);
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
        
        // Update last message locally instead of refreshing everything
        if (selectedChat.type === "user") {
          setLastMessages(prev => ({ ...prev, [selectedChat.data._id]: data.newMessage }));
        } else if (selectedChat.type === "group") {
          setLastMessageByGroup(prev => ({ ...prev, [selectedChat.data._id]: data.newMessage }));
        } else if (selectedChat.type === "community") {
          setLastMessageByCommunity(prev => ({ ...prev, [selectedChat.data._id]: data.newMessage }));
        }
      } else { toast.error(data.message); }
    } catch (error) { toast.error(error.message); }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/${messageId}`);
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, isDeleted: true, text: null, image: null, audio: null, video: null } : m
          )
        );
      } else { toast.error(data.message); }
    } catch (error) { toast.error(error.message); }
  };

  const clearUnseenForChat = (chat) => {
    if (!chat) return;
    if (chat.type === "user") setUnseenMessages((prev) => ({ ...prev, [chat.data._id]: 0 }));
    else if (chat.type === "group") setUnseenGroups((prev) => ({ ...prev, [chat.data._id]: 0 }));
    else if (chat.type === "community") setUnseenCommunities((prev) => ({ ...prev, [chat.data._id]: 0 }));
  };

  // ── Typing helpers ─────────────────────────────────────
  const typingKey = (chatType, chatId) => `${chatType}:${chatId}`;

  const addTypingUser = (key, userId) => {
    setTypingUsers((prev) => {
      const existing = prev[key] || [];
      if (existing.includes(userId)) return prev;
      return { ...prev, [key]: [...existing, userId] };
    });
  };

  const removeTypingUser = (key, userId) => {
    setTypingUsers((prev) => {
      const existing = (prev[key] || []).filter((id) => id !== userId);
      if (existing.length === 0) { const next = { ...prev }; delete next[key]; return next; }
      return { ...prev, [key]: existing };
    });
  };

  // ── Socket listeners ───────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedChat?.type === "user" && newMessage.senderId === selectedChat.data._id) {
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
      setLastMessages(prev => ({ ...prev, [newMessage.senderId]: newMessage }));
    };

    const handleGroupMessage = ({ message, groupId }) => {
      if (selectedChat?.type === "group" && selectedChat.data._id === groupId) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnseenGroups((prev) => ({ ...prev, [groupId]: (prev[groupId] || 0) + 1 }));
      }
      setLastMessageByGroup(prev => ({ ...prev, [groupId]: message }));
    };

    const handleCommunityMessage = ({ message, communityId }) => {
      if (selectedChat?.type === "community" && selectedChat.data._id === communityId) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnseenCommunities((prev) => ({
          ...prev, [communityId]: (prev[communityId] || 0) + 1,
        }));
      }
      setLastMessageByCommunity(prev => ({ ...prev, [communityId]: message }));
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: null, image: null, audio: null, video: null }
            : m
        )
      );
    };

    const handleTyping = ({ from, chatId, chatType }) => {
      const key = chatType && chatId ? typingKey(chatType, chatId) : typingKey("direct", from);
      addTypingUser(key, from);
      const timerKey = `${key}:${from}`;
      clearTimeout(typingTimers.current[timerKey]);
      typingTimers.current[timerKey] = setTimeout(() => removeTypingUser(key, from), 3000);
    };

    const handleStopTyping = ({ from, chatId, chatType }) => {
      const key = chatType && chatId ? typingKey(chatType, chatId) : typingKey("direct", from);
      removeTypingUser(key, from);
      clearTimeout(typingTimers.current[`${key}:${from}`]);
    };

    const handleChatSettingsUpdated = ({ from, settings }) => {
      if (selectedChat?.type === "user" && selectedChat.data._id === from) {
        setChatSettings(settings);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newGroupMessage", handleGroupMessage);
    socket.on("newCommunityMessage", handleCommunityMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("chat-settings-updated", handleChatSettingsUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroupMessage", handleGroupMessage);
      socket.off("newCommunityMessage", handleCommunityMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("chat-settings-updated", handleChatSettingsUpdated);
    };
  }, [socket, selectedChat, axios, getUsers, getGroups, getCommunities]);

  useEffect(() => { refreshAll(); getAllCalls(); }, [refreshAll, getAllCalls]);

  // ── Compat shims ───────────────────────────────────────
  const selectedUser = selectedChat?.type === "user" ? selectedChat.data : null;
  const setSelectedUser = (user) => {
    if (user) setSelectedChat({ type: "user", data: user });
    else setSelectedChat(null);
  };

  const value = {
    messages, hasMoreMessages, users, groups, communities,
    selectedChat, setSelectedChat, selectedUser, setSelectedUser,
    activeTab, setActiveTab,
    getUsers, getGroups, getCommunities, refreshAll,
    createGroup, createCommunity, joinCommunity,
    getMessages, loadEarlierMessages, sendMessage, deleteMessage,
    unseenMessages, unseenGroups, unseenCommunities,
    setUnseenMessages, clearUnseenForChat,
    lastMessages, lastMessageByGroup, lastMessageByCommunity,
    typingUsers, typingKey,
    allCalls, getAllCalls,
    chatSettings, updateChatSettings,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
