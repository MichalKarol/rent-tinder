import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthenticationContext } from "./auth";
import { AuthenticatedRoutes } from "./views/authenticated-routes";
import { FilteringContext, EMPTY_FILTERS } from "./filters";

function App() {
  const [token, setToken] = useState(
    window.localStorage.getItem("TOKEN") || ""
  );
  const [filters, setFilters] = useState(
    JSON.parse(window.localStorage.getItem("FILTERS") || "null") ||
      EMPTY_FILTERS
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
        <FilteringContext.Provider
          value={{
            filters,
            setFilters: (filters: any) => {
              setFilters(filters);
              window.localStorage.setItem("FILTERS", JSON.stringify(filters));
            },
          }}
        >
          <AuthenticatedRoutes />
        </FilteringContext.Provider>
      </AuthenticationContext.Provider>
    </div>
  );
}

export default App;
