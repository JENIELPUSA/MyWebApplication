import { useEffect } from 'react';
import axiosInstance from './ReusableComponent/axiosInstance'; // same instance used everywhere
import { useAuth } from './Context/AuthContext'; // kunin mo logout() dito

const AxiosInterceptor = () => {
  const { logout } = useAuth(); // kunin logout function from context

  useEffect(() => {
    // register interceptor
    const interceptor = axiosInstance.interceptors.response.use(
      response => response, // pass normal responses
      error => {
        if (error.response?.status === 401) {
            console.log("401 Unauthorized - Logging out...");
          logout();
        }
        return Promise.reject(error);
      }
    );

    // cleanup interceptor kapag umalis ang component
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return null; // no UI, logic-only component
};

export default AxiosInterceptor;
