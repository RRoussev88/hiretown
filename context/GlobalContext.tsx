"use client";
import { createContext, FC, PropsWithChildren, useState } from "react";
import { StorageKeys } from "../utils";

export type GlobalState = {
  [StorageKeys.COLOR_THEME]: string;
  [StorageKeys.SELECTED_LOCALE]: string;
};

type GlobalActions = {
  changeTheme: (theme: string) => void;
  changeLocale: (locale: string) => void;
};

export const GlobalContext = createContext<GlobalState & GlobalActions>({
  [StorageKeys.COLOR_THEME]: "bumblebee",
  [StorageKeys.SELECTED_LOCALE]: "EN",
  changeTheme: () => {},
  changeLocale: () => {},
});

export const GlobalProvider: FC<PropsWithChildren> = ({ children }) => {
  const [selectedLocale, setSelectedLocale] = useState<string>("EN");

  const changeTheme = () => {};

  const changeLocale = (locale: string) => {
    setSelectedLocale(locale);
  };

  return (
    <GlobalContext.Provider
      value={{
        [StorageKeys.COLOR_THEME]: "bumblebee",
        [StorageKeys.SELECTED_LOCALE]: selectedLocale,
        changeTheme,
        changeLocale,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
