import React from "react";

function Footer() {
  return (
    <footer className="w-full bg-zinc-50 text-center bg-gradient-to-r from-blue-900 to-indigo-900 lg:text-left">
      <div className="bg-black/5 py-2 text-center text-surface dark:text-white">
        <p className="text-sm">
          © {new Date().getFullYear()} begginerCode.Ph. All rights reserved.
        </p>
        <div>
          <a
            href="/terms-of-service"
            className="dark:text-white hover:underline mx-2 text-sm"
          >
            Terms of Service
          </a>
          |
          <a
            href="/privacy-policy"
            className="dark:text-white hover:underline mx-2 text-sm"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
