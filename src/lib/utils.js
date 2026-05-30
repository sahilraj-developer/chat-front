export function formatMessageTime(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (isNaN(parsed)) return "";
  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDuration(seconds) {
  if (!seconds || seconds < 1) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatCallDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return formatMessageTime(date);
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getCallLabel(call, myId) {
  const amCaller = String(call.callerId?._id || call.callerId) === String(myId);
  const type = call.callType === "video" ? "Video" : "Voice";

  switch (call.status) {
    case "completed":
      return `${type} call · ${formatDuration(call.duration)}`;
    case "missed":
      return amCaller ? `Unanswered ${type.toLowerCase()} call` : `Missed ${type.toLowerCase()} call`;
    case "rejected":
      return amCaller ? `${type} call declined` : `Declined ${type.toLowerCase()} call`;
    case "cancelled":
      return `Cancelled ${type.toLowerCase()} call`;
    default:
      return `${type} call`;
  }
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
