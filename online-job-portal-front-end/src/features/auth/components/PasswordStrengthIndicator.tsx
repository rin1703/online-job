import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (pwd: string): { score: number; label: string; color: string; textColor: string } => {
    let score = 0;

    if (!pwd) return { score: 0, label: '', color: '', textColor: '' };

    if (pwd.length >= 6) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z\d]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
    if (score <= 5) return { score: 3, label: 'Good', color: 'bg-orange-500', textColor: 'text-orange-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-500' };
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">
          Password Strength: <span className="text-gray-500">(min 6 chars, uppercase, lowercase, number)</span>
        </span>
        <span className={`text-xs font-semibold ${strength.textColor}`}>
          {strength.label}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i <= strength.score ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
