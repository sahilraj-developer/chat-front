import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const CallContext = createContext();

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }) => {
  const { socket, authUser, axios } = useContext(AuthContext);
  const [callStatus, setCallStatus] = useState("idle");
  const [callType, setCallType] = useState("video");
  const [remoteUser, setRemoteUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callHistoryVersion, setCallHistoryVersion] = useState(0);

  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callSessionRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const bumpCallHistory = () => setCallHistoryVersion((v) => v + 1);

  const saveCallToHistory = useCallback(
    async (status) => {
      const session = callSessionRef.current;
      if (!session || !axios) return;

      const connectedAt = session.connectedAt;
      const duration = connectedAt ? Math.max(1, Math.floor((Date.now() - connectedAt) / 1000)) : 0;
      const payload = {
        peerId: session.peerId,
        callType: session.callType,
        status,
        duration,
        startedAt: new Date(session.startedAt).toISOString(),
      };

      try {
        const endpoint =
          session.direction === "incoming" ? "/api/calls/log-incoming" : "/api/calls/log";
        await axios.post(endpoint, payload);
        bumpCallHistory();
      } catch (err) {
        console.warn("Failed to save call history", err.message);
      }

      callSessionRef.current = null;
    },
    [axios]
  );

  const startSession = (peerId, type, direction) => {
    callSessionRef.current = {
      peerId,
      callType: type,
      direction,
      startedAt: Date.now(),
      connectedAt: null,
    };
  };

  const markConnected = () => {
    if (callSessionRef.current && !callSessionRef.current.connectedAt) {
      callSessionRef.current.connectedAt = Date.now();
    }
  };

  const cleanupCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerConnection.current?.close();
    peerConnection.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus("idle");
    setRemoteUser(null);
    setIncomingCall(null);
  }, []);

  const createPeerConnection = useCallback(
    (targetUserId) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("ice-candidate", { to: targetUserId, candidate: e.candidate });
        }
      };

      pc.ontrack = (e) => {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        e.streams[0].getTracks().forEach((track) => {
          remoteStreamRef.current.addTrack(track);
        });
        setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
      };

      peerConnection.current = pc;
      return pc;
    },
    [socket]
  );

  const getMedia = async (type) => {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
  };

  const endCall = useCallback(
    async (targetId) => {
      const session = callSessionRef.current;
      if (socket && targetId) {
        socket.emit("end-call", { to: targetId });
      }
      if (session) {
        const status = session.connectedAt ? "completed" : "cancelled";
        await saveCallToHistory(status);
      }
      cleanupCall();
    },
    [socket, cleanupCall, saveCallToHistory]
  );

  const startCall = useCallback(
    async (user, type = "video") => {
      if (!socket || !user) return;
      try {
        setCallType(type);
        setRemoteUser(user);
        setCallStatus("calling");
        startSession(user._id, type, "outgoing");

        const stream = await getMedia(type);
        localStreamRef.current = stream;
        setLocalStream(stream);

        const pc = createPeerConnection(user._id);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call-user", {
          to: user._id,
          offer,
          callType: type,
          callerName: authUser?.fullName,
        });
      } catch {
        toast.error("Could not access camera/microphone");
        await saveCallToHistory("cancelled");
        cleanupCall();
      }
    },
    [socket, authUser, createPeerConnection, cleanupCall, saveCallToHistory]
  );

  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket) return;
    try {
      const { from, offer, callType: type, callerName } = incomingCall;
      setCallType(type);
      setCallStatus("connected");
      setRemoteUser({ _id: from, fullName: callerName });
      startSession(from, type, "incoming");
      markConnected();

      const stream = await getMedia(type);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection(from);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call-accepted", { to: from, answer });
      setIncomingCall(null);
    } catch {
      toast.error("Failed to accept call");
      await saveCallToHistory("missed");
      cleanupCall();
    }
  }, [incomingCall, socket, createPeerConnection, cleanupCall, saveCallToHistory]);

  const rejectCall = useCallback(async () => {
    if (incomingCall) {
      startSession(incomingCall.from, incomingCall.callType, "incoming");
      if (socket) {
        socket.emit("call-rejected", { to: incomingCall.from });
      }
      await saveCallToHistory("rejected");
    }
    setIncomingCall(null);
    cleanupCall();
  }, [incomingCall, socket, cleanupCall, saveCallToHistory]);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ from, offer, callType: type, callerName }) => {
      setIncomingCall({ from, offer, callType: type, callerName });
      setCallStatus("ringing");
    };

    const onAccepted = async ({ answer }) => {
      try {
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus("connected");
        markConnected();
      } catch {
        toast.error("Call connection failed");
        await saveCallToHistory("cancelled");
        cleanupCall();
      }
    };

    const onIce = async ({ candidate }) => {
      try {
        if (candidate && peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch {
        /* ignore */
      }
    };

    const onEnded = async () => {
      toast("Call ended");
      if (callSessionRef.current) {
        await saveCallToHistory(callSessionRef.current.connectedAt ? "completed" : "cancelled");
      }
      cleanupCall();
    };

    const onRejected = async () => {
      toast.error("Call declined");
      if (callSessionRef.current) {
        await saveCallToHistory("rejected");
      } else if (remoteUser) {
        startSession(remoteUser._id, callType, "outgoing");
        await saveCallToHistory("rejected");
      }
      cleanupCall();
    };

    socket.on("incoming-call", onIncoming);
    socket.on("call-accepted", onAccepted);
    socket.on("ice-candidate", onIce);
    socket.on("call-ended", onEnded);
    socket.on("call-rejected", onRejected);

    return () => {
      socket.off("incoming-call", onIncoming);
      socket.off("call-accepted", onAccepted);
      socket.off("ice-candidate", onIce);
      socket.off("call-ended", onEnded);
      socket.off("call-rejected", onRejected);
    };
  }, [socket, cleanupCall, saveCallToHistory, remoteUser, callType]);

  const value = {
    callStatus,
    callType,
    remoteUser,
    incomingCall,
    localStream,
    remoteStream,
    callHistoryVersion,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    cleanupCall,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
