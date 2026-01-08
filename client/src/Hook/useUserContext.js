import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as userApi from "../Api/userApi";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);

  // === Load user on mount ===
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setUser({});
      setLoadingUser(false);
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
      setUser({});
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // === Sync user to localStorage ===
  useEffect(() => {
    if (!user || Object.keys(user).length === 0) {
      localStorage.removeItem("user");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const addAddress = async (address) => {
    const data = await userApi.addAddress(user._id, address);
    setUser((prev) => ({
      ...prev,
      address: data,
    }));
  };

  const deleteAddress = async (address) => {
    const data = await userApi.deleteAddress(user._id, address);
    setUser()
  }

  // === Helpers ===
  const isUserEmpty = () => {
    return !user || Object.keys(user).length === 0;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        isUserEmpty,
        addAddress
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
