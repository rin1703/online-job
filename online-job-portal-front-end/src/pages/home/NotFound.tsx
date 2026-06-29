// src/pages/NotFound.tsx
import React from "react";
import { SearchX, Home, ArrowLeft, Globe } from "lucide-react";
import logoUrl from "@/assets/logo.png";

const NotFound: React.FC = () => {
  const goHome = () => (window.location.href = "/");
  const goBack = () => (window.history.length > 1 ? window.history.back() : goHome());
  const goSignIn = () => (window.location.href = "/sign-in");

  return (
    <div
      className="w-screen h-screen flex flex-col bg-gradient-to-r from-[#FFF3E0] to-white overflow-hidden"
    >
      {/* Header: toàn bộ bên phải */}
      <header className="w-full flex justify-end items-center gap-6 px-10 py-4">
        {/* Globe (ngôn ngữ) */}
        <button
          type="button"
          className="flex items-center gap-2 text-base font-medium text-gray-800 hover:opacity-80 transition"
          style={{ background: "transparent" }}
        >
          <Globe className="w-5 h-5 text-black" strokeWidth={2} />
          <span>English</span>
        </button>

        {/* Sign in */}
        <button
          type="button"
          onClick={goSignIn}
          className="text-base text-gray-800 hover:underline transition"
          style={{ background: "transparent" }}
        >
          Sign in
        </button>

        {/* Logo JOB */}
        <img
          src={logoUrl}
          alt="JOB logo"
          className="w-20 h-auto object-contain select-none pointer-events-none"
        />
      </header>

      {/* Nội dung 404 căn giữa toàn màn hình */}
      <main className="flex-grow flex items-center justify-center">
        <div
          className="bg-white shadow-xl rounded-2xl p-8 md:p-10 w-[90%] max-w-lg text-center"
          style={{
            boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full"
            style={{ backgroundColor: "rgba(230,81,0,0.12)" }}
          >
            <SearchX className="w-8 h-8" style={{ color: "#E65100" }} />
          </div>

          <h1
            className="text-5xl font-extrabold tracking-tight mb-2"
            style={{ color: "#E65100" }}
          >
            404
          </h1>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Page not found
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            The page you’re looking for doesn’t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={goHome}
              className="flex-1 inline-flex items-center justify-center gap-2 text-white py-2.5 px-4 rounded-lg font-medium hover:brightness-105 transition"
              style={{ backgroundColor: "#E65100" }}
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>

            <button
              type="button"
              onClick={goBack}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-orange-600 hover:underline"
              style={{ background: "transparent" }}
            >
              <ArrowLeft className="w-5 h-5" />
              Go back
            </button>
          </div>

          <button
            type="button"
            onClick={goSignIn}
            className="mt-4 text-sm text-orange-600 hover:underline"
            style={{ background: "transparent" }}
          >
            Return to sign in
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4">
        <p className="text-xs text-gray-400 tracking-wide">
          © 2025 JOB ONLINE PORTAL
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
