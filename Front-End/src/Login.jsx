import { useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./components/Context/AuthContext"; // Ensure this path is correct
import Validation from "../../Back-End/Utils/Validationlogin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LaboratoryDisplayContext } from "./components/Context/Laboratory/Display";
import { motion } from "framer-motion";
import LoadingLogInSpinner from "./components/ReusableComponent/LoadingLogInSpinner";
function Login() {
  const [animateExit, setAnimateExit] = useState(false);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth(); // Ensure this is defined
  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleValidation = () => {
    const validationErrors = Validation(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;
  
    setIsLoading(true);
  
    try {
      const response = await login(values.email, values.password);
      console.log("Login response:", response); // 🕵️‍♂️ Inspect mo ito
  
      // Use the correct access based on response structure
      const status = response?.status || response?.data?.status;
  
      if (status === "success") {
        setTimeout(() => {
          navigate("/dashboardfinal");
          setIsLoading(false);
        }, 1000);
      } else {
        setIsLoading(false);
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Login error:", error);
      toast.error("An unknown error occurred");
    }
  };
  

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-2 overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isLoading ? (
        <LoadingLogInSpinner />
      ) : (
        <motion.div
          className="relative flex flex-col rounded-xl bg-white px-12 py-12 w-full max-w-md shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-4">
              <img
                src="/Image/logo.png"
                alt="Logo"
                className="xs:w-20 xs:h-20 sm:w-22 sm:h-22 lg:w-22 lg:h-22 rounded-full"
              />
            </div>
            <h2 className="font-poppins xs:text-lg text-center sm:text-xl lg:text-xl font-bold text-gray-800 mb-6">
              Equipment
              <br />
              Preventive Maintenance
            </h2>

            <div className="mb-4">
              <label
                htmlFor="email"
                className=" font-poppins xs:text-sm sm:text-2xl lg:text-sm block text-gray-700 font-semibold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter Email"
                autoComplete="off"
                className="font-poppins xs:text-sm sm:text-2xl lg:text-sm w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInput}
                value={values.email}
              />
              {errors.email && (
                <p className="xs:text-sm sm:text-2xl lg:text-lg text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="font-poppins xs:text-sm sm:text-2xl lg:text-sm block text-gray-700 font-semibold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter Password"
                autoComplete="off"
                className="font-poppins xs:text-sm sm:text-2xl lg:text-sm w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleInput}
                value={values.password}
              />
              {errors.password && (
                <p className="xs:text-sm sm:text-2xl lg:text-lg text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="font-poppins xs:text-sm sm:text-sm lg:text-sm w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
            >
              Log In
            </button>
          </form>
          <ToastContainer />
        </motion.div>
      )}
    </motion.div>
  );
}

export default Login;
