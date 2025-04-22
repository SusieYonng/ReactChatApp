const users = {};

export function isValidUsername(username) {
  return /^[A-Za-z0-9_]{3,20}$/.test(username);
}

export function isForbiddenName(username) {
  return username === "dog";
}

export function registerUser(username) {
  users[username] = {
    username,
    nickname: username,
    avatar: "",
    bio: "",
    friends: [],
    requests: [], // incoming friend requests, store the sender's username
  };
}

export function addFriend(userA, userB) {
  const uA = users[userA];
  const uB = users[userB];

  if (!uA || !uB || userA === userB) return false;

  if (!uA.friends.includes(userB)) uA.friends.push(userB);
  if (!uB.friends.includes(userA)) uB.friends.push(userA);
  return true;
}

export function getFriends(username) {
  return users[username]?.friends || [];
}

export function getUserByUsername(username) {
  return users[username] || null;
}

export function updateUserProfile(username, { nickname, bio }) {
  const user = users[username];
  if (!user) return false;
  if (nickname !== undefined) user.nickname = nickname;
  if (bio !== undefined) user.bio = bio;
  return true;
}

export function addFriendRequest(from, to) {
  const fromUser = users[from];
  const toUser = users[to];

  if (!fromUser || !toUser) {
    throw new Error("user-not-found");
  }

  if (toUser.friends.includes(from)) {
    throw new Error("already-friends");
  }

  if (toUser.requests.includes(from)) {
    throw new Error("request-already-sent");
  }

  toUser.requests.push(from);
}

export function getFriendRequests(username) {
  return users[username]?.requests || [];
}

export function respondToFriendRequest(to, from, action) {
  const toUser = users[to];
  const fromUser = users[from];

  if (!toUser || !fromUser) {
    throw new Error("user-not-found");
  }

  const index = toUser.requests.indexOf(from);
  if (index === -1) {
    throw new Error("no-request-found");
  }

  toUser.requests.splice(index, 1);

  if (action === "accept") {
    if (!toUser.friends.includes(from)) {
      toUser.friends.push(from);
    }
    if (!fromUser.friends.includes(to)) {
      fromUser.friends.push(to);
    }
  }
}
