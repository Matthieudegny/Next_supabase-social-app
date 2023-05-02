import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    console.log("profile context", profile);
  }, [profile]);

  return <UserContext.Provider value={{ profile, setProfile }}>{children}</UserContext.Provider>;
}
