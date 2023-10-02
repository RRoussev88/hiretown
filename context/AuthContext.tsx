"use client";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLogoutUser } from "../hooks";
import { trpc } from "../trpc";
import type { User } from "../types";
import { StorageKeys } from "../utils";

export type AuthState = {
  [StorageKeys.ACCESS_TOKEN]: string;
  [StorageKeys.CURRENT_USER]: User | null;
};

type AuthActions = {
  logoutUser: () => void;
  loginUser: (accessToken: string, currentUser: User) => void;
};

export const AuthContext = createContext<AuthState & AuthActions>({
  [StorageKeys.ACCESS_TOKEN]: "",
  [StorageKeys.CURRENT_USER]: null,
  logoutUser: () => {},
  loginUser: () => {},
});

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const logout = useLogoutUser();
  const [accessToken, setAccessToken] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { data: user } = trpc.getUser.useQuery(undefined, { retry: false });
  const { data: token } = trpc.getToken.useQuery(undefined, { retry: false });

  const loginUser = useCallback((token: string, logedInUser: User) => {
    setAccessToken(token);
    setCurrentUser(logedInUser);
  }, []);

  const logoutUser = useCallback(() => {
    setAccessToken("");
    setCurrentUser(null);
    logout();
  }, [logout]);

  useEffect(() => {
    setAccessToken(token ?? "");
    setCurrentUser((user as User) ?? null);
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        [StorageKeys.ACCESS_TOKEN]: accessToken,
        [StorageKeys.CURRENT_USER]: currentUser,
        logoutUser,
        loginUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
