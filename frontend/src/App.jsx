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
import SelectionPage from "./pages/SelectionPage"; // Import the new component

export default function App() {
  const { authUser } = useAuthContext();
  console.log("auth user", authUser);
  return (
    <div className="p4 w-screen h-screen flex items-center justify-center">
      <Routes>
        <Route>
          <Route
            path="/"
            element={authUser ? <SelectionPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/home"
            element={authUser ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={authUser ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/signup"
            element={authUser ? <Navigate to="/" /> : <SignUp />}
          />
          <Route
            path="/templates"
            element={authUser ? <TemplatesList/> : <Login />}
          />
          <Route
            path="/templates/:templateId"
            element={authUser ? <TemplateView/> : <Login />}
          />
          <Route
            path="/templates/create"
            element={authUser ? <CreateTemplatePage/> : <Login />}
          />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}
