import React, { useState, useEffect,useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../CountContext";
function SignUpForm({ onClose,isOpen, user, onUpdate, onAddUser }) {
  const token = localStorage.getItem("token");
  if (!isOpen) return null;
  const [values, setValues] = useState({
    FirstName: "",
    Middle: "",
    LastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const resetForm = () => {
    setValues({
      FirstName: "",
      Middle: "",
      LastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValues({
      FirstName: user?.FirstName || "",
      Middle: user?.Middle || "",
      LastName: user?.LastName || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
  }, [user]);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleValidation = () => {
    const { FirstName, LastName, email, password, confirmPassword } = values;

    // Check for empty fields
    if (!FirstName || !LastName || !email) {
      toast.error("Please fill in all required fields.");
      return false;
    }

    // Email validation regex pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validate email format
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    // If in edit mode, skip password validation
    if (!user) {
      // Only validate password if not in edit mode
      if (!password) {
        toast.error("Password is required.");
        return false;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return false;
      }
    }

    return true; // All validations passed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!handleValidation()) return;

    setIsLoading(true);
    try {
      if (user) {
        await editUser();
      } else {
        await signUpUser();
      }
    } catch (error) {
      console.error("There was an error:", error);
      toast.error(
        error.response?.data?.message || "Operation failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const editUser = async () => {
    try {
      // Prepare the data to send, omitting password if it's not provided
      const dataToSend = {
        FirstName: values.FirstName,
        Middle: values.Middle,
        LastName: values.LastName,
        email: values.email,
      };

      // Include password only if it's provided and not empty
      if (values.password) {
        dataToSend.password = values.password;
      }

      const res = await axios.patch(
        `http://127.0.0.1:3000/api/v1/users/${user._id}`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "success") {
        toast.success("User successfully updated!");
        resetForm();
        onUpdate(res.data.data); // Pass updated user data to the parent
      }
    } catch (error) {
      console.error("There was an error:", error);
      toast.error(
        error.response?.data?.message || "Operation failed. Please try again."
      );
    }
  };

  const signUpUser = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:3000/api/v1/users",
        {
          FirstName: values.FirstName,
          Middle: values.Middle,
          LastName: values.LastName,
          email: values.email,
          password: values.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "success") {
        toast.success("User successfully added!");
        resetForm();
      }
    } catch (error) {
      console.error("There was an error:", error);
      toast.error(
        error.response?.data?.message || "Operation failed. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="flex flex-col relative rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>
        <h4 className="block text-2xl font-medium text-slate-800 mb-2">
          {user ? "Edit User" : "Sign Up"}
        </h4>
        <p className="text-slate-500 font-light mb-6">
          {user
            ? "Update the user details"
            : "Nice to meet you! Enter your details to register."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="block mb-1 text-sm text-slate-600">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                  placeholder="Your First Name"
                  autoComplete="off"
                  name="FirstName"
                  onChange={handleInput}
                  value={values.FirstName}
                />
              </div>

              <div className="w-1/2">
                <label className="block mb-1 text-sm text-slate-600">
                  Middle Name
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                  placeholder="Your Middle Name"
                  autoComplete="off"
                  name="Middle"
                  onChange={handleInput}
                  value={values.Middle}
                />
              </div>
            </div>

            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Last Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                placeholder="Your Last Name"
                autoComplete="off"
                name="LastName"
                onChange={handleInput}
                value={values.LastName}
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">Email</label>
              <input
                type="email"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                placeholder="Your Email"
                autoComplete="off"
                name="email"
                onChange={handleInput}
                value={values.email}
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Password
              </label>
              <input
                type="password"
                className={`w-full placeholder:text-slate-400 text-sm border rounded-md px-3 py-2 ${
                  user
                    ? "text-gray-500 border-gray-300 cursor-not-allowed"
                    : "text-slate-700 border-slate-200"
                }`}
                placeholder={user ? "New Password (Optional)" : "Your Password"}
                autoComplete="off"
                name="password"
                onChange={handleInput}
                value={values.password}
                disabled={user} // Disable input if in edit mode
              />
            </div>

            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Confirm Password
              </label>
              <input
                type="password"
                className={`w-full placeholder:text-slate-400 text-sm border rounded-md px-3 py-2 ${
                  user
                    ? "text-gray-500 border-gray-300 cursor-not-allowed"
                    : "text-slate-700 border-slate-200"
                }`}
                placeholder="Confirm Your Password"
                autoComplete="off"
                name="confirmPassword"
                onChange={handleInput}
                value={values.confirmPassword}
                disabled={user} // Disable input if in edit mode
              />
            </div>
          </div>

          <button
            className={`mt-8 w-full rounded-md py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md ${
              isLoading
                ? "bg-gray-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {user ? "Update User" : "Submit"}
          </button>
            <ToastContainer />
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;
