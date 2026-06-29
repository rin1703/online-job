import React from "react";

export const SignUpBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F0EB]">
      {/* Diagonal stripes background - hidden on mobile */}
      <div className="absolute inset-0 hidden lg:block">
        {/* Orange diagonal stripe */}
        <div 
          className="absolute bg-[#FBAD62]"
          style={{
            width: '15%',
            height: '180%',
            top: '-38%',
            left: '62%',
            transform: 'rotate(-45deg)',
          }}
        />
        
        {/* Green diagonal stripe */}
        <div 
          className="absolute bg-[#9FE4AE]"
          style={{
            width: '15%',
            height: '150%',
            top: '-35%',
            left: '82%',
            transform: 'rotate(-45deg)',
          }}
        />
        
        {/* Blue diagonal stripe */}
        <div 
          className="absolute bg-[#66A4CD]"
          style={{
            width: '15%',
            height: '150%',
            top: '-50%',
            right: '-15%',
            transform: 'rotate(-45deg)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};