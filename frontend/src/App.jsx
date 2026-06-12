import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import AdminRoute from "./components/AdminRoute";
import ReservationPage from "./pages/ReservationPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<ReservationPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
