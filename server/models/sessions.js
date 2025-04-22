import { randomUUID } from 'crypto';

const sessions = {};

export function addSession(username) {
  const sid = randomUUID();
  sessions[sid] = username;
  return sid;
}

export function getSessionUser(sid) {
  return sessions[sid];
}

export function deleteSession(sid) {
  delete sessions[sid];
}