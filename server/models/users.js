import { pool } from '../database.js';

export function isValidUsername(username) {
  return /^[A-Za-z0-9_]{3,20}$/.test(username);
}

export function isForbiddenName(username) {
  return username === "dog";
}

export async function registerUser(username) {
  // In a real app, you'd also handle password hashing here.
  // For now, we store a placeholder as discussed.
  const passwordHash = 'placeholder_for_now'; 

  const { rows } = await pool.query(
    'INSERT INTO users (username, password_hash, nickname) VALUES ($1, $2, $3) RETURNING *',
    [username, passwordHash, username]
  );
  return rows[0];
}

export async function addFriend(userA, userB) {
  // This function seems to be for forcing a friendship.
  // The main logic path is 'respondToFriendRequest'.
  const user = await getUserByUsername(userA);
  const friend = await getUserByUsername(userB);

  if (!user || !friend) return false;

  // Ensure the friendship is mutual and accepted
  await pool.query(
    `INSERT INTO friends (user_id, friend_id, status) 
     VALUES ($1, $2, 'accepted'), ($2, $1, 'accepted')
     ON CONFLICT (user_id, friend_id) DO UPDATE SET status = 'accepted'`,
    [user.username, friend.username]
  );
  return true;
}

export async function getFriends(username) {
  const { rows } = await pool.query(
    `SELECT friend_id FROM friends WHERE user_id = $1 AND status = 'accepted'`,
    [username]
  );
  return rows.map(row => row.friend_id);
}

export async function getUserByUsername(username) {
  const { rows } = await pool.query('SELECT username, nickname, avatar, bio FROM users WHERE username = $1', [username]);
  return rows[0] || null;
}

export async function updateUserProfile(username, { nickname, bio }) {
  // Build the query dynamically to only update fields that are provided
  const updates = [];
  const values = [];
  let queryIndex = 1;

  if (nickname !== undefined) {
    updates.push(`nickname = $${queryIndex++}`);
    values.push(nickname);
  }
  if (bio !== undefined) {
    updates.push(`bio = $${queryIndex++}`);
    values.push(bio);
  }

  if (updates.length === 0) {
    return true; // Nothing to update
  }

  values.push(username);
  const { rows } = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE username = $${queryIndex} RETURNING *`,
    values
  );
  return rows.length > 0;
}

export async function addFriendRequest(from, to) {
  const fromUser = await getUserByUsername(from);
  const toUser = await getUserByUsername(to);

  if (!fromUser || !toUser) {
    throw new Error("user-not-found");
  }

  // Check if they are already friends or a request is pending
  const { rows } = await pool.query(
    `SELECT status FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
    [from, to]
  );

  if (rows.length > 0) {
    const status = rows[0].status;
    if (status === 'accepted') {
      throw new Error("already-friends");
    }
    // If a request exists from 'to' to 'from', accept it automatically
    if (rows.some(r => r.user_id === to && r.friend_id === from)) {
        await respondToFriendRequest(from, to, 'accept');
        return;
    }
    if (status === 'pending') {
      throw new Error("request-already-sent");
    }
  }

  // Create a new pending request
  await pool.query(
    `INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, 'pending') ON CONFLICT DO NOTHING`,
    [from, to]
  );
}

export async function getFriendRequests(username) {
  const { rows } = await pool.query(
    `SELECT user_id FROM friends WHERE friend_id = $1 AND status = 'pending'`,
    [username]
  );
  return rows.map(row => row.user_id);
}

export async function respondToFriendRequest(to, from, action) {
  const toUser = await getUserByUsername(to);
  const fromUser = await getUserByUsername(from);

  if (!toUser || !fromUser) {
    throw new Error("user-not-found");
  }

  // The request is from 'from' to 'to'
  const { rowCount } = await pool.query(
    `SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
    [from, to]
  );

  if (rowCount === 0) {
    throw new Error("no-request-found");
  }

  if (action === "accept") {
    // Use a transaction to ensure atomicity
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Update the original request to 'accepted'
      await client.query(
        `UPDATE friends SET status = 'accepted' WHERE user_id = $1 AND friend_id = $2`,
        [from, to]
      );
      // Create the reverse relationship to make it mutual
      await client.query(
        `INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, 'accepted')
         ON CONFLICT (user_id, friend_id) DO UPDATE SET status = 'accepted'`,
        [to, from]
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else { // 'reject'
    // Just delete the request
    await pool.query(
      `DELETE FROM friends WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
      [from, to]
    );
  }
}
