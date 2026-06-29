import React, { useState } from "react";
import { type UseFormReturn } from "react-hook-form";

import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Icons } from "@/components/icons/icons";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

import { type JobSeekerFormData } from "../auth.schema";

interface JobSeekerFormProps {
  form: UseFormReturn<JobSeekerFormData>;
  onSubmit: (data: JobSeekerFormData) => void;
  isLoading: boolean;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export const JobSeekerForm: React.FC<JobSeekerFormProps> = ({
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
    watchedFields.acceptTerms &&
    !errors.firstName &&
    !errors.lastName &&
    !errors.birthday &&
    !errors.phone &&
    !errors.acceptTerms;

  const handleNextStep = async () => {
    // Validate step 1 fields before moving to step 2
    const result = await trigger(["email", "password", "confirmPassword"]);
    if (result && isStep1Valid) {
      onStepChange(2);
    }
  };

  if (currentStep === 1) {
    return (
      <form className="space-y-4" aria-label="Sign up step 1: Email and password">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            icon={<Icons.email className="w-5 h-5" />}
            {...register("email")}
            onBlur={() => trigger("email")}
            className="h-12"
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <Icons.eyeOff className="w-5 h-5" />
                ) : (
                  <Icons.eye className="w-5 h-5" />
                )}
              </button>
            }
            {...register("password")}
            onBlur={() => trigger("password")}
            className="h-12"
            aria-describedby={errors.password ? "password-error" : "password-requirements"}
          />
          <PasswordStrengthIndicator password={watchedFields.password || ""} />
          {errors.password && (
            <p id="password-error" className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            icon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? (
                  <Icons.eyeOff className="w-5 h-5" />
                ) : (
                  <Icons.eye className="w-5 h-5" />
                )}
              </button>
            }
            {...register("confirmPassword")}
            onBlur={() => trigger("confirmPassword")}
            className="h-12"
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <ButtonLowercase
          type="button"
          variant={isStep1Valid ? "orange" : "gray"}
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      aria-label="Sign up step 2: Personal information"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="sr-only">
            First name
          </label>
          <Input
            id="firstName"
            type="text"
            placeholder="First name"
            icon={<Icons.user className="w-5 h-5" />}
            {...register("firstName")}
            onBlur={() => trigger("firstName")}
            className="h-12"
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-red-500 text-xs mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="sr-only">
            Last name
          </label>
          <Input
            id="lastName"
            type="text"
            placeholder="Last name"
            {...register("lastName")}
            onBlur={() => trigger("lastName")}
            className="h-12"
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-red-500 text-xs mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="birthday" className="sr-only">
          Birthday
        </label>
        <Input
          id="birthday"
          type="date"
          placeholder="Birthday"
          icon={<Icons.calendar className="w-5 h-5" />}
          {...register("birthday")}
          onBlur={() => trigger("birthday")}
          className="h-12"
          aria-describedby={errors.birthday ? "birthday-error" : undefined}
        />
        {errors.birthday && (
          <p id="birthday-error" className="text-red-500 text-xs mt-1">
            {errors.birthday.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="sr-only">
          Phone number
        </label>
        <Input
          id="phone"
          type="tel"
          placeholder="Phone"
          icon={<Icons.phone className="w-5 h-5" />}
          {...register("phone")}
          onBlur={() => trigger("phone")}
          className="h-12"
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="text-red-500 text-xs mt-1">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <input
          type="checkbox"
          {...register("acceptTerms")}
          id="terms"
          onChange={(e) => {
            register("acceptTerms").onChange(e);
            trigger("acceptTerms");
          }}
          className="w-5 h-5 rounded border-2 border-gray-300 accent-orange-500 cursor-pointer flex-shrink-0 mt-0.5"
        />
        <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight flex-1">
          I agree to the{" "}
          <span className="text-orange-500 hover:underline cursor-pointer">terms</span> and{" "}
          <span className="text-orange-500 hover:underline cursor-pointer">policies</span> of{" "}
          <span className="font-semibold">
            <span className="text-blue-600">O</span>
            <span className="text-green-500">J</span>
            <span className="text-orange-500">P</span>
          </span>
        </Label>
      </div>

      {errors.acceptTerms && (
        <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>
      )}

      <ButtonLowercase
        type="submit"
        className={`w-full h-12 text-white transition-colors font-medium mt-2`}
        variant={isStep2Valid ? "orange" : "gray"}
        disabled={isLoading || !isStep2Valid}
      >
        {isLoading ? "Creating Account..." : "Sign Up"}
      </ButtonLowercase>
    </form>
  );
};
