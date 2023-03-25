import { createContext, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [triggerFetchUser, setTriggerFetchUser] = useState(false);

  return (
    <UserContext.Provider
      value={{ profile, setProfile, triggerFetchUser, setTriggerFetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
}
