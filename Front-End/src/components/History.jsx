import React from 'react';

function History() {
  return (
    <div className="overflow-x-auto">
      <table className=" divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?img=1" alt="" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Jane Cooper</div>
                  <div className="text-sm text-gray-500">jane.cooper@example.com</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">Regional Paradigm Technician</div>
              <div className="text-sm text-gray-500">Optimization</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Admin</td>
          </tr>
          {/* Repeat the <tr>...</tr> for additional user rows */}
        </tbody>
      </table>
    </div>
  );
}

export default History;
