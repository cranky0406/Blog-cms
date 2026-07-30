import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./editor/styles.css";
import App from "./App";
import { initCsrf } from "./utils/csrfUtils";
import { Toaster } from "@/components/ui/sonner";

// Fetch CSRF token BEFORE the app renders
// Stored in memory — XSS cannot steal it (unlike localStorage)
initCsrf().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
      <Toaster richColors position="top-right" />
    </React.StrictMode>
  );
});
