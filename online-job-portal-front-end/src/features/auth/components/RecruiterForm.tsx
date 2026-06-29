import React, { useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import { ButtonLowercase } from '@/components/ui/button-lowercase.tsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Icons } from '@/components/icons/icons';
import { CompactLocationInput } from './CompactLocationInput';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

import { type RecruiterFormData } from '../auth.schema';

interface RecruiterFormProps {
  form: UseFormReturn<RecruiterFormData>;
  onSubmit: (data: RecruiterFormData) => void;
  isLoading: boolean;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export const RecruiterForm: React.FC<RecruiterFormProps> = ({
  form,
  onSubmit,
  isLoading,
  currentStep,
  onStepChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    trigger,
  } = form;

  const watchedFields = watch();
  const isStep1Valid =
    watchedFields.email &&
    watchedFields.password &&
    watchedFields.confirmPassword &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;
  const isStep2Valid =
    watchedFields.firstName &&
    watchedFields.lastName &&
    watchedFields.birthday &&
    watchedFields.phone &&
    watchedFields.companyName &&
    watchedFields.taxCode &&
    watchedFields.houseNumber &&
    watchedFields.streetName &&
    watchedFields.location &&
    watchedFields.acceptTerms &&
    !errors.firstName &&
    !errors.lastName &&
    !errors.birthday &&
    !errors.phone &&
    !errors.companyName &&
    !errors.taxCode &&
    !errors.houseNumber &&
    !errors.streetName &&
    !errors.location &&
    !errors.acceptTerms;

  const handleNextStep = async () => {
    // Validate step 1 fields before moving to step 2
    const result = await trigger(['email', 'password', 'confirmPassword']);
    if (result && isStep1Valid) {
      onStepChange(2);
    }
  };

  if (currentStep === 1) {
    return (
      <form className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            icon={<Icons.email className="w-5 h-5" />}
            {...register('email')}
            onBlur={() => trigger('email')}
            className="h-12"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <Icons.eyeOff className="w-5 h-5" />
                ) : (
                  <Icons.eye className="w-5 h-5" />
                )}
              </button>
            }
            {...register('password')}
            onBlur={() => trigger('password')}
            className="h-12"
          />
          <PasswordStrengthIndicator password={watchedFields.password || ''} />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            icon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <Icons.eyeOff className="w-5 h-5" />
                ) : (
                  <Icons.eye className="w-5 h-5" />
                )}
              </button>
            }
            {...register('confirmPassword')}
            onBlur={() => trigger('confirmPassword')}
            className="h-12"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <ButtonLowercase
          type="button"
          variant={isStep1Valid ? 'orange' : 'gray'}
          className="w-full h-12 text-white transition-colors"
          onClick={handleNextStep}
          disabled={!isStep1Valid}
        >
          Next
        </ButtonLowercase>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Input
            type="text"
            placeholder="First name"
            icon={<Icons.user className="w-5 h-5" />}
            {...register('firstName')}
            onBlur={() => trigger('firstName')}
            className="h-12"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Input
            type="text"
            placeholder="Last name"
            {...register('lastName')}
            onBlur={() => trigger('lastName')}
            className="h-12"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Input
            type="date"
            placeholder="Birthday"
            icon={<Icons.calendar className="w-5 h-5" />}
            {...register('birthday')}
            onBlur={() => trigger('birthday')}
            className="h-12"
          />
          {errors.birthday && (
            <p className="text-red-500 text-xs mt-1">{errors.birthday.message}</p>
          )}
        </div>
        <div>
          <Input
            type="tel"
            placeholder="Phone"
            icon={<Icons.phone className="w-5 h-5" />}
            {...register('phone')}
            onBlur={() => trigger('phone')}
            className="h-12"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="mb-2">
        <Input
          type="text"
          placeholder="Company name"
          icon={<Icons.building className="w-5 h-5" />}
          {...register('companyName')}
          onBlur={() => trigger('companyName')}
          className="h-12"
        />
        {errors.companyName && (
          <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
        )}
      </div>

      <div className="mb-2">
        <Input
          type="text"
          placeholder="Tax code (uppercase letters, numbers, hyphens)"
          icon={<Icons.fileText className="w-5 h-5" />}
          {...register('taxCode')}
          onChange={(e) => {
            const upperValue = e.target.value.toUpperCase();
            form.setValue('taxCode', upperValue);
            trigger('taxCode');
          }}
          onBlur={() => trigger('taxCode')}
          className="h-12"
        />
        {errors.taxCode && (
          <p className="text-red-500 text-xs mt-1">{errors.taxCode.message}</p>
        )}
      </div>

      <div>
        <Input
          type="url"
          placeholder="Company website (optional)"
          icon={<Icons.globe className="w-5 h-5" />}
          {...register('companyWebsite')}
          onBlur={() => trigger('companyWebsite')}
          className="h-12"
        />
        {errors.companyWebsite && (
          <p className="text-red-500 text-xs mt-1">{errors.companyWebsite.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Input
            type="text"
            placeholder="House number"
            icon={<Icons.building className="w-5 h-5" />}
            {...register('houseNumber')}
            onBlur={() => trigger('houseNumber')}
            className="h-12"
          />
          {errors.houseNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.houseNumber.message}</p>
          )}
        </div>
        <div>
          <Input
            type="text"
            placeholder="Street name"
            {...register('streetName')}
            onBlur={() => trigger('streetName')}
            className="h-12"
          />
          {errors.streetName && (
            <p className="text-red-500 text-xs mt-1">{errors.streetName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Location <span className="text-red-500">*</span>
        </label>
        <CompactLocationInput
          value={watchedFields.location || ''}
          onChange={(newLocation) => {
            form.setValue('location', newLocation);
            trigger('location');
          }}
          error={errors.location?.message}
          disabled={false}
        />
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <input
          type="checkbox"
          {...register('acceptTerms')}
          id="terms"
          onChange={(e) => {
            register('acceptTerms').onChange(e);
            trigger('acceptTerms');
          }}
          className="w-5 h-5 rounded border-2 border-gray-300 accent-orange-500 cursor-pointer flex-shrink-0 mt-0.5"
        />
        <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight flex-1">
          I agree to the{' '}
          <span className="text-orange-500 hover:underline cursor-pointer">terms</span> and{' '}
          <span className="text-orange-500 hover:underline cursor-pointer">policies</span> of{' '}
          <span className="font-semibold">
            <span className="text-blue-600">O</span>
            <span className="text-green-500">J</span>
            <span className="text-orange-500">P</span>
          </span>
        </Label>
      </div>

      {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>}

      <ButtonLowercase
        type="submit"
        className={`w-full h-12 text-white transition-colors font-medium mt-2`}
        variant={isStep2Valid ? 'orange' : 'gray'}
        disabled={isLoading || !isStep2Valid}
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </ButtonLowercase>
    </form>
  );
};
