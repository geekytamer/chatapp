import React from "react";
import GenderCheckbox from "../../components/GenderCheckBox";
import { useState } from "react";
import useSignup from "../../hooks/useSignup";
const SignUp = () => {

  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    gender: '',
  });

  const { loading, signup } = useSignup();
  const handleCheckboxChange = (gender) => {
      setInputs({...inputs, gender });
   }
  const handleSubmit = async (e) => {
    e.preventDefault()
    await signup(inputs);
   }
  return (
    <div className="flex flex-col items-center justify-center min-w-96 mx-auto">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0">
        <div>
          <h1 className="text-3xl font-semibold text-center text-gray-300">
            Sign Up <span className="text-blue-500">ChatApp</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              className="mt-4 w-full px-3 py-2 rounded-md text-white focus:ring-blue-500 focus:outline-blue-500 focus:outline-2 input"
              required
              placeholder="Full Name"
              value={inputs.fullName}
              onChange={(e) =>
                setInputs({ ...inputs, fullName: e.target.value })
              }
            />
          </div>

          <div>
            <input
              type="text"
              className="mt-4 w-full px-3 py-2 rounded-md text-white focus:ring-blue-500 focus:outline-blue-500 focus:outline-2 input"
              required
              placeholder="Username"
              value={inputs.username}
              onChange={(e) =>
                setInputs({ ...inputs, username: e.target.value })
              }
            />
          </div>

          <div>
            <input
              type="password"
              className="mt-4 w-full px-3 py-2 rounded-md text-white focus:ring-blue-500 focus:outline-blue-500 focus:outline-2 input"
              required
              placeholder="Password"
              value={inputs.password}
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
            />
          </div>

          <div>
            <input
              type="password"
              className="mt-4 w-full px-3 py-2 rounded-md text-white focus:ring-blue-500 focus:outline-blue-500 focus:outline-2 input"
              required
              placeholder="Confirm Password"
              value={inputs.confirmPassword}
              onChange={(e) =>
                setInputs({ ...inputs, confirmPassword: e.target.value })
              }
            />
          </div>

          <GenderCheckbox onCheckBoxChange={handleCheckboxChange} selectedGender={inputs.gender} />
          <a
            href="/login"
            className="text-sm hover:underline hover:text-blue-600 mt-6 inline-block"
          >
            Already have an account?
          </a>

          <button
            type="submit"
            className="btn btn-block btn-sm mt-2 hover:bg-blue-500"
            disabled={loading}
          >
            {loading? <span className="loading loading-spinner"></span>: "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
