import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
  const { axios, authUser } = useContext(AuthContext);
  const [feed, setFeed] = useState([]);        // grouped story feed
  const [myStories, setMyStories] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroup, setViewerGroup] = useState(null);   // { author, stories }
  const [viewerIndex, setViewerIndex] = useState(0);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [followRequests, setFollowRequests] = useState([]);
  const [messageRequests, setMessageRequests] = useState([]);

  const fetchFeed = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/stories/feed");
      if (data.success) setFeed(data.feed);
    } catch {}
  }, [axios]);

  const fetchMyStories = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/stories/my");
      if (data.success) setMyStories(data.stories);
    } catch {}
  }, [axios]);

  const fetchFollowRequests = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/social/requests");
      if (data.success) setFollowRequests(data.requests);
    } catch {}
  }, [axios]);

  const fetchMessageRequests = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/requests");
      if (data.success) setMessageRequests(data.requests);
    } catch {}
  }, [axios]);

  const createStory = async (payload) => {
    try {
      const { data } = await axios.post("/api/stories", payload);
      if (data.success) {
        toast.success("Story posted!");
        await Promise.all([fetchFeed(), fetchMyStories()]);
        return data.story;
      } else { toast.error(data.message); return null; }
    } catch (e) { toast.error(e.message); return null; }
  };

  const viewStory = async (storyId) => {
    try { await axios.post(`/api/stories/${storyId}/view`); } catch {}
  };

  const reactToStory = async (storyId, emoji) => {
    try {
      const { data } = await axios.post(`/api/stories/${storyId}/react`, { emoji });
      if (data.success) await fetchFeed();
    } catch {}
  };

  const commentOnStory = async (storyId, text) => {
    try {
      const { data } = await axios.post(`/api/stories/${storyId}/comment`, { text });
      if (data.success) { await fetchFeed(); return data.comments; }
    } catch {}
  };

  const deleteStory = async (storyId) => {
    try {
      const { data } = await axios.delete(`/api/stories/${storyId}`);
      if (data.success) { toast.success("Story deleted"); await Promise.all([fetchFeed(), fetchMyStories()]); }
    } catch {}
  };

  const highlightStory = async (storyId, title) => {
    try {
      const { data } = await axios.patch(`/api/stories/${storyId}/highlight`, { highlightTitle: title });
      if (data.success) await fetchMyStories();
    } catch {}
  };

  const acceptFollowRequest = async (requestId) => {
    try {
      const { data } = await axios.post(`/api/social/requests/${requestId}/accept`);
      if (data.success) { toast.success("Follow request accepted"); await fetchFollowRequests(); }
    } catch {}
  };

  const rejectFollowRequest = async (requestId) => {
    try {
      await axios.delete(`/api/social/requests/${requestId}`);
      await fetchFollowRequests();
    } catch {}
  };

  const acceptMessageRequest = async (userId) => {
    try {
      const { data } = await axios.post(`/api/messages/requests/${userId}/accept`);
      if (data.success) { toast.success("Message request accepted"); await fetchMessageRequests(); }
    } catch {}
  };

  const openViewer = (group, index = 0) => {
    setViewerGroup(group); setViewerIndex(index); setViewerOpen(true);
  };

  useEffect(() => {
    if (authUser) {
      fetchFeed(); fetchMyStories(); fetchFollowRequests(); fetchMessageRequests();
    }
  }, [authUser]);

  return (
    <StoryContext.Provider value={{
      feed, myStories, fetchFeed, createStory, viewStory, reactToStory,
      commentOnStory, deleteStory, highlightStory,
      viewerOpen, viewerGroup, viewerIndex, setViewerIndex, openViewer,
      setViewerOpen, creatorOpen, setCreatorOpen,
      followRequests, acceptFollowRequest, rejectFollowRequest, fetchFollowRequests,
      messageRequests, acceptMessageRequest, fetchMessageRequests,
    }}>
      {children}
    </StoryContext.Provider>
  );
};
