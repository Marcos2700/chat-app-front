// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_jghvbf7k2",
  client_id: "1757s9m6km1pm08409p2k2i3ta",
  redirect_uri: "https://main.d1zaa8ykmv2imp.amplifyapp.com/",
  response_type: "code",
  scope: "email openid phone",
  userStore: new WebStorageStateStore({ store: window.localStorage }),

};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}
const root = ReactDOM.createRoot(rootElement);

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
