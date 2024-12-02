import React from "react";

export function Navbar() {
  return (
    <nav className="border-b bg-gray-950 shadow">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="http://localhost:3000/home" className="text-xl font-bold text-white">
          Dashboard
        </a>

        {/* Navigation Links */}
        <div className="hidden space-x-6 lg:flex">
          <a
            href="#"
            className="text-sm font-medium text-white hover:text-gray-300 hover:border-b"
          >
            Inicio
          </a>
          <a
            href="#"
            className="text-sm font-medium text-white hover:text-gray-300 hover:border-b"
          >
            Perfil
          </a>
          <a
            href="#"
            className="text-sm font-medium text-red-500 hover:text-red-400 hover:border-b"
          >
            Cerrar sesión
          </a>
        </div>

        {/* Mobile Menu (Hamburger Icon) */}
        <button
          className="lg:hidden rounded-md p-2 text-white hover:bg-gray-100"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
