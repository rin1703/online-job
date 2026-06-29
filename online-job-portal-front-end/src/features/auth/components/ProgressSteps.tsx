import React from "react";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="relative mb-6">
      {/* Progress bar background */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2" />
      
      {/* Progress bar filled */}
      <div 
        className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
      
      {/* Step indicator */}
      <div className="relative flex justify-start">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold">
          {currentStep}
        </div>
      </div>
    </div>
  );
};