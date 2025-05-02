import { useState, useEffect } from "react";

const LoadingTableSpinner = ({ message = "Loading Data...", section = "General" }) => {
  const [count, setCount] = useState(0);

  return (
    <table className="w-full">
      <tbody>
        <tr>
          <td colSpan={8} className="p-4 text-center text-sm">
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-6 w-6 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              <span className="ml-2">
                {message}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default LoadingTableSpinner;
