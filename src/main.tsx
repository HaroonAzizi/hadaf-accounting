import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";
import { AppProvider } from "./context/AppContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            className:
              "bg-white/90 dark:bg-slate-950/80 text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur",
          }}
        />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
