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

  console.log(`Storing message: from=${from}, to=${to}, text="${text}"`);
  console.log('Current messages state:', messages);

  ensureMessageArray(from, to);
  ensureMessageArray(to, from);

  messages[from][to].push(msg);
  messages[to][from].push(msg);
  
  console.log(`Message stored. messages[${from}][${to}].length = ${messages[from][to].length}`);
  console.log(`Message stored. messages[${to}][${from}].length = ${messages[to][from].length}`);
  
  return msg;
}

export function getPrivateMessages(userA, userB) {
  if (messages[userA] && messages[userA][userB]) {
    return messages[userA][userB];
  }
  return [];
}

export function getAllMessagesForUser(username) {
  const result = messages[username] || {};
  console.log(`Getting all messages for user ${username}:`, result);
  return result;
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

  console.log(`Getting unread overview for user ${username}`);
  console.log('User messages:', userMessages);
  console.log('Read status:', readStatus);

  for (const contact in userMessages) {
    const msgs = userMessages[contact];
    const lastReadTime = readStatus[contact] || 0;
    const unreadCount = msgs.filter(
      (msg) => msg.from !== username && msg.time > lastReadTime
    ).length;
    overview[contact] = {
      count: unreadCount,
      lastMsg: msgs.length > 0 ? msgs[msgs.length - 1].text : "",
      lastMsgTime: msgs.length > 0 ? msgs[msgs.length - 1].time : null
    };
  }

  console.log('Unread overview result:', overview);
  return overview;
}
