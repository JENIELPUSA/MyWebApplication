import React from 'react'
import { useState } from 'react'
import { Link ,useNavigate} from 'react-router-dom';
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotPassword() {
    const [email,setEmail]=useState()
    const navigate = useNavigate()
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const res =await axios.post('http://127.0.0.1:3000/api/v1/authentication/forgotPassword', {
            email
          });
          if(res.data.status === "Success"){
            toast.success(res.data.message);
          }
          // Maaaring mag-redirect o magpakita ng success message dito
        } catch (error) {
          console.error('There was an error with signup:', error);
          // Maaaring magpakita ng error message sa user
        }
      };
  return (
    <div className='d-flex justify-content-center align-items-center bg-secondary vh-100'>
        <div className='bg-white p-3 rounded w-25'>
            <h2>ForgotPassword</h2>
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor="email">
                        <strong>Email</strong>
                    </label>
                    <input 
                    type="email"
                    placeholder='Enter Email'
                    autoComplete='off'
                    name='email'
                    className='form-control rounded-0'
                    onChange={(e)=> setEmail(e.target.value)}
                    
                     />

                </div>
                <button 
                    className='btn w-100 rounded-0' 
                    style={{ backgroundColor: '#3498db', color: '#fff' }}>
                    Forgot Password
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

  )
}


export default ForgotPassword