import React from "react";
import axios from "axios";

var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();

function userReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true };
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function UserProvider({ children }) {
  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!localStorage.getItem("token"),
  });

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUserState() {
  var context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut };

// ###########################################################

function loginUser(dispatch, login, password, history, setIsLoading, setError) {
  setError(false);
  setIsLoading(true);

  if (login.length > 0 && password.length > 0) {
    axios
      .post("/admin", { username: login, password })
      .then(res => {
        const token = res.data.jwt;
        setError(null);
        setIsLoading(false);
        localStorage.setItem("token", token);
        axios.defaults.headers.common["x-auth-token"] = token;
        dispatch({ type: "LOGIN_SUCCESS" });
      })
      .catch(() => {
        setError(true);
        setIsLoading(false);
      });
  } else {
    dispatch({ type: "LOGIN_FAILURE" });
  }
}

function signOut(dispatch, history) {
  localStorage.removeItem("token");
  axios.defaults.headers.common["x-auth-token"] = "";
  dispatch({ type: "SIGN_OUT_SUCCESS" });
  history.push("/login");
}
