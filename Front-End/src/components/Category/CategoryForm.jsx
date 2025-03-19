import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer ,toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {FaPlus} from "react-icons/fa";

function CategoryForm({isOpen,onClose,
    category,
    onAddCategory,
    onUpdate
}) {

    const token = localStorage.getItem('token');
    if (!isOpen) return null;
    const [values, setValues]= useState({
        CategoryName: ''
    });

    const resetForm = () => {
        setValues({
            CategoryName: ''
        });
    };

    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        setValues({
            CategoryName: category?.CategoryName || '',
           
        });
    }, [category]);

    const addCategory = async () => {
        try {
            const response = await axios.post(
                'http://127.0.0.1:3000/api/v1/categorys',
                { 
                    CategoryName: values.CategoryName
                    
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data && response.data.status === 'success') {
                toast.success('Department added successfully');
                onAddCategory(response.data.data); 
                console.log(response.data.data)
                resetForm()
            } 
            else {
                toast.error('Failed to add department');
            }
        } catch (error) {
              // Display a generic error message in case no specific message is available
              if (error.response && error.response.data) {
                const backendError = error.response.data;
            
                // Log the full error for debugging purposes
                console.error("Submission error:", backendError);
            
                // Extract and display the specific error message if available
                if (backendError.errors && backendError.errors.CategoryName) {
                  toast.error(backendError.errors.CategoryName.message);
                } else if (backendError.message) {
                  toast.error(backendError.message);
                } else {
                  toast.error("An unexpected error occurred.");
                }
              } else {
                // Display a connection error if there's no server response
                toast.error("Failed to connect to the server.");
                console.error("Submission error:", error.message);
              }
            }
            
    };

    const editCategory= async ()=>{
        try{
            const dataToSend ={
                CategoryName: values.CategoryName
            };
            if (values.password) {
                dataToSend.password = values.password;
            }

            const res = await axios.patch(
                `http://127.0.0.1:3000/api/v1/categorys/${category._id}`,
                dataToSend,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            if (res.data.status === 'success') {
                toast.success('Department successfully updated!');

                onUpdate(res.data.data); // Pass updated user data to the parent

                resetForm()
            
                
            }

        }catch(error){
            console.error('There was an error:', error);
            toast.error(error.response?.data?.message || 'Operation failed. Please try again.');
        }

    }

    const handleInput =(event)=>{
        const {name, value}=event.target;
        setValues({...values,[name]:value});
    }



    const handleSubmit = async (e) =>{
        e.preventDefault();
        toast.dismiss();
        setIsLoading(true);
        try{
            if(category){
                await editCategory();

            }else{
                await addCategory();
            }
        }catch(error){
            console.error('There was an error:',error);
            toast.error(error.response?.data?.message || 'Operation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }
    
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
      {category ? "Edit category" : "Add category"}
    </h4>
    <p className="text-slate-500 font-light mb-6">
      {category ? "Update the category details" : "Enter category details to register."}
    </p>

    <form onSubmit={handleSubmit}>
      <div className="mb-2 flex flex-col gap-4">
        <div className="w-full">
          <label className="block mb-1 text-sm text-slate-600">Category Name</label>
          <input
            type="text"
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
            placeholder="Category Name"
            autoComplete="off"
            name="CategoryName"
            onChange={handleInput}
            value={values.CategoryName}
          />
        </div>
      </div>

      <button
        className={`mt-8 w-full rounded-md py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md ${
          isLoading ? "bg-gray-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
        }`}
        type="submit"
        disabled={isLoading}
      >
        {category ? "Edit Category" : "Add Category"}
      </button>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </form>
  </div>
</div>


    );
}

export default CategoryForm;
