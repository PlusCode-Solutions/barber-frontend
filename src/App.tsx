import { Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path=":tenantSlug/auth/login" element={<LoginPage />} />
    </Routes>
  );
}
