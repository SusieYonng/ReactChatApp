export const LOGIN_STATUS = {
  PENDING: "pending",
  NOT_LOGGED_IN: "notLoggedIn",
  LOGGING_IN: "loggingIn",
  IS_LOGGED_IN: "loggedIn",
  LOGGING_OUT: "loggingOut",
};

export const SERVER = {
  FORBIDDEN_NAME: "forbidden-name",
  AUTH_INSUFFICIENT: "auth-insufficient",
  REQUIRED_USERNAME: "invalid-username",
  USERNAME_TAKEN: "user-exists",
  REQUEST_ALREADY_SENT: "request-already-sent",
  ALREADY_FRIENDS: "already-friends",
  PROFILE_UPDATED_FAILED: "update-failed",
  PROFILE_UPDATED_SUCCESS: "update-success",
};

export const CLIENT = {
  INVALID_USERNAME: "invalid-username",
  NETWORK_ERROR: "networkError",
  UNKNOWN_ERROR: "default",
};

export const MESSAGES = {
  [SERVER.FORBIDDEN_NAME]:
    "This username is not allowed. Please choose another one.",
  [SERVER.AUTH_INSUFFICIENT]:
    "Incorrect username or password. Please try again. Also make sure you have registered first.",
  [SERVER.USERNAME_TAKEN]: "Username is already taken.",
  [SERVER.REQUIRED_USERNAME]:
    "Username must be 3-16 letters, numbers or underscores.",
  [CLIENT.INVALID_USERNAME]:
    "Username must be 3-16 letters, numbers or underscores.",
  [CLIENT.NETWORK_ERROR]:
    "Trouble connecting to the network.  Please try again",
  [SERVER.PROFILE_UPDATED_FAILED]: "Update failed. Please try again.",
  [SERVER.PROFILE_UPDATED_SUCCESS]: "Profile updated successfully.",
  [SERVER.REQUEST_ALREADY_SENT]:
    "Friend request already sent. Please wait for a response.",
  [SERVER.ALREADY_FRIENDS]: "You are already friends.",
  default: "Something went wrong.  Please try again",
};
