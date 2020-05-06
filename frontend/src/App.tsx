import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthenticationContext } from "./auth";
import { AuthenticatedRoutes } from "./views/authenticated-routes";

function App() {
  const [token, setToken] = useState(
    window.localStorage.getItem("TOKEN") || ""
  );
  return (
    <div className="App">
      <AuthenticationContext.Provider
        value={{
          token,
          setToken: (token: string) => {
            setToken(token);
            window.localStorage.setItem("TOKEN", token);
          },
        }}
      >
        <AuthenticatedRoutes />
      </AuthenticationContext.Provider>
    </div>
  );
}

export default App;
