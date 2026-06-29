import React from "react";

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img 
        src="/src/assets/logo.png" 
        alt="JOB Logo" 
        className="h-10 w-auto"
        onError={(e) => {
          // Fallback nếu không tìm thấy ảnh
          e.currentTarget.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.className = 'flex items-center gap-1';
          fallback.innerHTML = `
            <span class="text-2xl font-bold text-orange-500">J</span>
            <span class="text-2xl font-bold text-orange-400">O</span>
            <span class="text-2xl font-bold text-orange-500">B</span>
            <span class="text-xl">🔍</span>
          `;
          e.currentTarget.parentElement?.appendChild(fallback);
        }}
      />
    </div>
  );
};