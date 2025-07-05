// export function formatMessageTime(date){
//     return new Date(date).toLocaleTimeString("en-US",{
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//     })
// }

export function formatMessageTime(date) {
    if (!date) return "";
    const parsed = new Date(date);
    if (isNaN(parsed)) return "Invalid time";
    return parsed.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}