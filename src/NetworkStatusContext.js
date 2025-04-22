import { createContext } from "react";

export const NetworkStatusContext = createContext({
  isOnline: true,
  setIsOnline: () => {},
});
