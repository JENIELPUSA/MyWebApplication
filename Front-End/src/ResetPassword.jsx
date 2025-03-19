import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function ResetPassword() {
    const [password, setPassword] = useState(''); // Initialize with an empty string
    const navigate = useNavigate();
    const { token } = useParams(); // Destructure token from URL params
  
    console.log('Token:', token); // Log the token to verify

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send PATCH request to reset the password
            const res = await axios.patch(`http://127.0.0.1:3000/api/v1/authentication/resetPassword/${token}`, {
                password
            });

            if (res.data.status === "Success") { // Make sure to use the correct case for the status
                toast.success(res.data.message); // Show success message
                navigate('/login'); // Navigate to login page on success
            } else {
                toast.error('Failed to reset password. Please try again.'); // Show error message
                console.log('Response status:', res.data.status);
            }

        } catch (error) {
            console.error('There was an error resetting the password:', error);
            toast.error('There was an error resetting the password. Please try again.'); // Show error message
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center bg-secondary vh-100'>
            <div className='bg-white p-3 rounded w-25'>
                <h2>Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="password">
                            <strong>Password</strong>
                        </label>
                        <input 
                            type="password"
                            placeholder='Enter Password'
                            autoComplete='off'
                            name='password'
                            className='form-control rounded-0'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" // Ensure the button submits the form
                        className='btn w-100 rounded-0' 
                        style={{ backgroundColor: '#3498db', color: '#fff' }}
                    >
                        Reset Password
                    </button>
                </form>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </div>
        </div>
    );
}

export default ResetPassword;
