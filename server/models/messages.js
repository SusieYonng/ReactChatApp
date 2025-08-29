import { pool } from '../database.js';

export async function sendPrivateMessage(from, to, text) {
  const { rows } = await pool.query(
    'INSERT INTO messages (from_user, to_user, text) VALUES ($1, $2, $3) RETURNING *',
    [from, to, text]
  );
  const newMessage = rows[0];
  
  // Convert created_at to a Unix timestamp (milliseconds) to match the old format if needed by the frontend
  return {
    ...newMessage,
    time: new Date(newMessage.created_at).getTime()
  };
}

export async function getPrivateMessages(userA, userB) {
  const { rows } = await pool.query(
    `SELECT * FROM messages 
     WHERE (from_user = $1 AND to_user = $2) OR (from_user = $2 AND to_user = $1)
     ORDER BY created_at ASC`,
    [userA, userB]
  );
  
  return rows.map(msg => ({
    ...msg,
    time: new Date(msg.created_at).getTime()
  }));
}

export async function getAllMessagesForUser(username) {
  const { rows } = await pool.query(
    `SELECT * FROM messages 
     WHERE from_user = $1 OR to_user = $1 
     ORDER BY created_at ASC`,
    [username]
  );

  const messagesByContact = {};
  rows.forEach(msg => {
    const contact = msg.from_user === username ? msg.to_user : msg.from_user;
    if (!messagesByContact[contact]) {
      messagesByContact[contact] = [];
    }
    messagesByContact[contact].push({
      ...msg,
      time: new Date(msg.created_at).getTime()
    });
  });

  return messagesByContact;
}

export async function markMessagesAsRead(user, contact) {
  const now = new Date();
  await pool.query(
    `INSERT INTO message_read_status (user_id, contact_id, last_read_time)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, contact_id) 
     DO UPDATE SET last_read_time = $3`,
    [user, contact, now]
  );
}

export async function getUnreadOverview(username) {
  // 1. Get all messages involving the user
  const allMessages = await getAllMessagesForUser(username);

  // 2. Get the last read times for all contacts
  const { rows: readStatusRows } = await pool.query(
    'SELECT contact_id, last_read_time FROM message_read_status WHERE user_id = $1',
    [username]
  );
  const lastReadTimes = {};
  readStatusRows.forEach(row => {
    lastReadTimes[row.contact_id] = new Date(row.last_read_time).getTime();
  });

  // 3. Calculate unread counts and last message details
  const overview = {};
  for (const contact in allMessages) {
    const msgs = allMessages[contact];
    const lastReadTime = lastReadTimes[contact] || 0;
    
    const unreadCount = msgs.filter(
      (msg) => msg.from_user === contact && new Date(msg.created_at).getTime() > lastReadTime
    ).length;

    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

    overview[contact] = {
      count: unreadCount,
      lastMsg: lastMsg ? lastMsg.text : "",
      lastMsgTime: lastMsg ? new Date(lastMsg.created_at).getTime() : null
    };
  }

  return overview;
}
