import React from "react";

function MobileMenu() {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-gradient-to-r from-blue-900 to-indigo-900 text-center text-white shadow-md">
      <div className="mx-8 py-2 grid grid-cols-5 gap-4">
        <div className="p-2 bg-black">1</div>
        <div className="bg-black">1</div>
        <div className="bg-black"></div>
        <div className="bg-black">1</div>
        <div className="bg-black">1</div>
      </div>
    </div>
  );
}

export default MobileMenu;
