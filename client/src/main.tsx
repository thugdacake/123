import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { PlayerProvider } from "./context/PlayerContext";
import { BluetoothProvider } from "./context/BluetoothContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <PlayerProvider>
      <BluetoothProvider>
        <App />
      </BluetoothProvider>
    </PlayerProvider>
  </ThemeProvider>
);
