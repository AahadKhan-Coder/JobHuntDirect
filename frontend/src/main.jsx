import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="211507124105-l8hvsu0rpcl8t71h6rhfutdtdr3uf94q.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
