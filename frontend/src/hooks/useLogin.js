import React from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
const useLogin = () => {
  const [loading, setLoading] = React.useState(false);
  const { setAuthUser } = useAuthContext();
  const login = async ({ username, password }) => {
    setLoading(true);
    const success = handleInputErrors({ username, password });
    if (!success) return;
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      console.log(JSON.stringify({ username, password }));
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }
      localStorage.setItem("chat-user", JSON.stringify(data));
      setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { login, loading };
};

export default useLogin;

function handleInputErrors({ username, password }) {
  if (!username || !password) {
    toast.error("Please fill in all the required fields");
    return false;
  }
  return true;
}
