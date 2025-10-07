import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider, useAuthContext } from "./context/AuthContext";
import TemplatesList from "./components/templates/TemplatesList";
import TemplateView from "./components/templates/TemplateView";
import CreateTemplatePage from "./components/templates/CreateTemplatePage";
import Layout from "./components/Layout"; // New layout

export default function App() {
  const { authUser } = useAuthContext();
  console.log("auth user", authUser);

  return (
    <div className="w-screen h-screen">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <SignUp />}
        />

        {/* Protected Routes (inside Layout) */}
        <Route
          path="/"
          element={authUser ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Home />} />
          <Route path="templates" element={<TemplatesList />} />
          <Route path="templates/:templateId" element={<TemplateView />} />
          <Route path="templates/create" element={<CreateTemplatePage />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}