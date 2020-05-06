import React from "react";

export const AuthenticationContext = React.createContext<{
  token: string;
  setToken: (token: string) => void;
}>({
  token: "",
  setToken: (_: string) => {},
});
