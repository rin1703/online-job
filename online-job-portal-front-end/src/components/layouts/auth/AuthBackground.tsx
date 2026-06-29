import React from "react";
import { useLocation } from "react-router-dom";

export const AuthBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isSignIn = location.pathname === "/auth/sign-in";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Diagonal stripes background */}
      <div className="absolute inset-0">
        {/* Orange diagonal stripe - left */}
        {isSignIn ? (
          <>
            {/* Orange diagonal stripe - bottom left */}
            <div
              className="absolute bg-[#F97A00]/60"
              style={{
                width: "15%",
                height: "180%",
                bottom: "-35%",
                right: "63%",
                transform: "rotate(-40deg)", // Đảo ngược hướng nghiêng
              }}
            />

            {/* Green diagonal stripe - middle left */}
            <div
              className="absolute bg-[#60D57F]/60"
              style={{
                width: "15%",
                height: "150%",
                bottom: "-35%",
                right: "82%",
                transform: "rotate(-40deg)",
              }}
            />

            {/* Blue diagonal stripe - far left */}
            <div
              className="absolute bg-[#006BB2]/60"
              style={{
                width: "10%",
                height: "150%",
                bottom: "-50%",
                left: "-10%",
                transform: "rotate(-40deg)",
              }}
            />
          </>
        ) : (
          <>
            {/* Orange diagonal stripe - left */}
            <div
              className="absolute bg-[#F97A00]/60"
              style={{
                width: "15%",
                height: "180%",
                top: "-35%",
                left: "63%",
                transform: "rotate(-40deg)",
              }}
            />

            {/* Green diagonal stripe - middle */}
            <div
              className="absolute bg-[#60D57F]/60"
              style={{
                width: "15%",
                height: "150%",
                top: "-35%",
                left: "82%",
                transform: "rotate(-40deg)",
              }}
            />

            {/* Blue diagonal stripe - right */}
            <div
              className="absolute bg-[#006BB2]/60"
              style={{
                width: "10%",
                height: "150%",
                top: "-50%",
                right: "-10%",
                transform: "rotate(-40deg)",
              }}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};