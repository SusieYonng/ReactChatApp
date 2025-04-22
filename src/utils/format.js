export const formatLastMsgTime = (timestamp) => {
  const msgDate = new Date(timestamp);
  const now = new Date();
  const isToday =
    msgDate.getFullYear() === now.getFullYear() &&
    msgDate.getMonth() === now.getMonth() &&
    msgDate.getDate() === now.getDate();
  return isToday
    ? msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : msgDate.toLocaleDateString();
};
