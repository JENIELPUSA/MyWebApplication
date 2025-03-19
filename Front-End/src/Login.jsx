import { useContext, useState,useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './components/Context/AuthContext'; // Ensure this path is correct
import Validation from '../../Back-End/Utils/Validationlogin';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {LaboratoryDisplayContext} from './components/Context/Laboratory/Display'

function Login() {

    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { login} = useAuth(); // Ensure this is defined
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

        const response = await login(values.email, values.password);

        if (response.success) {
            toast.success("Login successful! Redirecting...");
            setTimeout(() => {
                // Navigate to the dashboard for admin role
                navigate('/dashboardfinal');
            }, 1000);  // Delay for success toast
        } else {
            toast.error(response.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md">
                <div className="flex justify-center mb-4">
                    <img src="/Image/logo.png" alt="Logo" className="w-24 h-24 rounded-full" />
                </div>
                <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                    Equipment<br />Preventive Maintenance
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter Email"
                            autoComplete="off"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleInput}
                            value={values.email}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter Password"
                            autoComplete="off"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleInput}
                            value={values.password}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
                    >
                        Log In
                    </button>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}

export default Login;
