import {React, useState} from "react";
import useLogin from "../../hooks/useLogin";
const Login = () => {
  const [username, setUsername]  = useState('');
  const [password, setPassword]  = useState('');

  const { login, loading } = useLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('login', username, password);
    await login({username, password});
  };
  return (
    <div className="flex flex-col items-center justify-center min-w-96 mx-auto mb-8">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0">
        <div>
          <h1 className="text-3xl font-semibold text-center text-gray-300">
            Login
            <span className="text-blue-500"> ChatApp</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              className="mt-4 w-full px-3 py-2 rounded-md text-white focus:ring-blue-500 focus:outline-blue-500 focus:outline-2 input"
              required
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              className="mt-4 w-full px-3 py-2 rounded-md text-white focus:ring-blue-500 focus:outline-blue-500 focus:outline-2 input"
              required
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <a
            href="/signup"
            className="text-sm hover:underline hover:text-blue-600 mt-2 inline-block"
          >
            {"Don't"} have an account?
          </a>
          <button
            type="submit"
            className="btn btn-block btn-sm mt-2 hover:bg-blue-500"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
