import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { blobToBase64 } from "../lib/utils";
import { IconClose } from "./icons";

const MAX_VIDEO_SEC = 60;

const MediaRecorderBar = ({ mode, onSend, onCancel }) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    try {
      const constraints =
        mode === "video"
          ? { audio: true, video: { facingMode: "user", width: 640, height: 480 } }
          : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (mode === "video") {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        video.play();
        setPreviewUrl(null);
      }

      let mimeType = "video/webm";
      if (mode === "audio") {
        if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        mimeType = "video/webm;codecs=vp8,opus";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        stopTracks();
        if (blob.size < 100) {
          toast.error("Recording too short");
          return;
        }
        const base64 = await blobToBase64(blob);
        onSend(mode === "video" ? { video: base64 } : { audio: base64 });
      };

      recorder.start(200);
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (mode === "video" && s + 1 >= MAX_VIDEO_SEC) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error(mode === "video" ? "Camera access denied" : "Microphone access denied");
      onCancel();
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      stopTracks();
    }
  };

  const handleCancel = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    stopTracks();
    onCancel();
  };

  useEffect(() => {
    startRecording();
    return () => {
      clearInterval(timerRef.current);
      stopTracks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="wa-composer px-3 py-3 flex items-center gap-3 bg-[var(--wa-surface)] border-t border-[var(--wa-border)]">
      <button type="button" onClick={handleCancel} className="wa-btn-ghost text-[var(--wa-danger)]">
        <IconClose />
      </button>
      <div className="flex-1 flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
        <span className="text-sm text-[var(--wa-text)]">
          {mode === "video" ? "Recording video note" : "Recording voice note"} · {seconds}s
        </span>
      </div>
      {recording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="px-4 py-2 rounded-full bg-[var(--wa-accent)] text-white text-sm font-medium"
        >
          Send
        </button>
      ) : (
        <span className="text-xs text-[var(--wa-text-secondary)]">Processing…</span>
      )}
    </div>
  );
};

export default MediaRecorderBar;
