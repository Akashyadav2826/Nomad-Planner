import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "Digital Nomad Planner - AI-Powered Travel & Work Management";

createRoot(document.getElementById("root")!).render(<App />);
