import { randomUUID } from 'crypto';
import { pool } from '../database.js';

export async function addSession(username) {
  const sid = randomUUID();
  await pool.query(
    'INSERT INTO sessions (sid, username) VALUES ($1, $2)',
    [sid, username]
  );
  return sid;
}

export async function getSessionBySid(sid) {
  if (!sid) {
    return null;
  }
  const { rows } = await pool.query('SELECT * FROM sessions WHERE sid = $1', [sid]);
  return rows[0] || null;
}

export async function deleteSession(sid) {
  if (!sid) {
    return;
  }
  await pool.query('DELETE FROM sessions WHERE sid = $1', [sid]);
}