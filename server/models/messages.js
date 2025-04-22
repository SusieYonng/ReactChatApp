// This object will hold all private messages between users.
// messages[userA][userB] = [ { from, to, text, time }, ... ]
const messages = {};
const lastRead = {};

function ensureMessageArray(userA, userB) {
  if (!messages[userA]) {
    messages[userA] = {};
  }
  if (!messages[userA][userB]) {
    messages[userA][userB] = [];
  }
}

export function sendPrivateMessage(from, to, text) {
  const timestamp = Date.now();

  const msg = {
    from,
    to,
    text,
    time: timestamp,
  };

  ensureMessageArray(from, to);
  ensureMessageArray(to, from);

  messages[from][to].push(msg);
  messages[to][from].push(msg);
}

export function getPrivateMessages(userA, userB) {
  if (messages[userA] && messages[userA][userB]) {
    return messages[userA][userB];
  }
  return [];
}

export function getAllMessagesForUser(username) {
  return messages[username] || {};
}

export function markMessagesAsRead(user, contact) {
  if (!lastRead[user]) {
    lastRead[user] = {};
  }
  lastRead[user][contact] = Date.now();
}

export function getUnreadOverview(username) {
  const userMessages = messages[username] || {};
  const readStatus = lastRead[username] || {};
  const overview = {};

  for (const contact in userMessages) {
    const msgs = userMessages[contact];
    const lastReadTime = readStatus[contact] || 0;
    const unreadCount = msgs.filter(
      (msg) => msg.from !== username && msg.time > lastReadTime
    ).length;
    overview[contact] = unreadCount;
  }

  return overview;
}
