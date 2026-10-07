import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
