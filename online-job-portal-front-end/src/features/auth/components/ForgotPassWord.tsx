import React, { useRef, useState } from "react";
import { Mail, Eye, EyeOff, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoUrl from "@/assets/logo.png";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { toast } from "sonner";

type Step = 1 | 2 | 3;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [resendIn, setResendIn] = useState<number>(0);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passErr, setPassErr] = useState("");

  // API Mutations
  const [forgotPassword, { isLoading: isSendingOTP }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const goSignIn = () => navigate("/auth/sign-in");
  const goHome = () => navigate("/");

  const isValidEmail = (v: string) => EMAIL_REGEX.test(v);

  const handleSendOtp = async () => {
    if (!email.trim()) return setEmailErr("Please enter your email before sending OTP.");
    if (!isValidEmail(email))
      return setEmailErr("Invalid email format. Example: example@gmail.com");
    setEmailErr("");

    try {
      const response = await forgotPassword({ email }).unwrap();
      if (response.success) {
        toast.success(response.message || "OTP sent to your email!");
        setStep(2);
        startResendCountdown(60);
      } else {
        toast.error(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      const errorMessage = error?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
      setEmailErr(errorMessage);
    }
  };

  const startResendCountdown = (sec: number) => {
    setResendIn(sec);
    const t = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < otp.length - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length !== 6) return alert("OTP must be 6 digits.");
    setStep(3);
  };

  const handleResendOtp = async () => {
    if (resendIn > 0) return;
    setOtp(["", "", "", "", "", ""]);

    try {
      const response = await forgotPassword({ email }).unwrap();
      if (response.success) {
        toast.success("New OTP sent to your email!");
        otpRefs.current[0]?.focus();
        startResendCountdown(60);
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Failed to resend OTP:", error);
      toast.error(error?.data?.message || "Failed to resend OTP");
    }
  };

  const validatePassword = () => {
    if (!newPass || !confirmPass) return "Please fill in both password fields.";
    if (newPass.length < 8) return "Password must be at least 8 characters.";
    if (newPass !== confirmPass) return "Passwords do not match.";
    return "";
  };

  const handleResetPassword = async () => {
    const err = validatePassword();
    setPassErr(err);
    if (err) return;

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setPassErr("Please enter valid 6-digit OTP");
      return;
    }

    try {
      const response = await resetPassword({
        email,
        otp: otpCode,
        newPassword: newPass,
        confirmPassword: confirmPass,
      }).unwrap();

      if (response.success) {
        toast.success(response.message || "Password reset successfully!");
        // Reset form and redirect to sign in
        setStep(1);
        setEmail("");
        setOtp(["", "", "", "", "", ""]);
        setNewPass("");
        setConfirmPass("");
        setTimeout(() => navigate("/auth/sign-in"), 1500);
      } else {
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Failed to reset password:", error);
      const errorMessage = error?.data?.message || "Failed to reset password. Please try again.";
      toast.error(errorMessage);
      setPassErr(errorMessage);
    }
  };

  const renderStep1 = () => (
    <>
      <h2 className="text-orange-500 text-xl font-semibold mb-1">Forgot password</h2>
      <p className="text-gray-500 text-sm mb-4">Enter your email to receive the confirmation code</p>

      <div className="relative mb-2">
        <input
          type="email"
          placeholder="Email"
          className={`w-full border ${emailErr ? "border-red-500" : "border-gray-300"} rounded-md py-2 px-4 pr-10 text-sm`}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
        />
        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
      </div>

      {emailErr && <p className="text-red-500 text-sm mb-3">{emailErr}</p>}

      <button
        type="button"
        onClick={handleSendOtp}
        className="hover:brightness-105 disabled:opacity-50 text-white py-2 px-4 rounded w-full mb-2 font-medium transition-all duration-300"
        style={{ backgroundColor: "#E65100" }}
        disabled={!email || isSendingOTP}
      >
        {isSendingOTP ? "Sending..." : "Send OTP code"}
      </button>

      <button
        type="button"
        onClick={goSignIn}
        style={{
          background: "transparent",
          border: "none",
          boxShadow: "none",
          padding: 0,
          cursor: "pointer",
          color: "#E65100",
          fontSize: "0.875rem",
          display: "block",
          margin: "0 auto",
        }}
        onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        Return to sign in
      </button>
    </>
  );

  const renderStep2 = () => (
    <>
      <h2 className="text-orange-500 text-xl font-semibold mb-1">Confirm OTP</h2>
      <p className="text-gray-500 text-sm mb-4">Enter the OTP code sent to your email</p>

      <div className="flex justify-center gap-px sm:gap-[6px] mb-4">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { otpRefs.current[idx] = el; }}
            value={digit}
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={(e) => handleOtpChange(e.target.value, idx)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded text-center text-lg border border-orange-500 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-500/40"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleVerifyOtp}
        className="hover:brightness-105 text-white py-2 px-4 rounded w-full mb-2 font-medium transition-all duration-300"
        style={{ backgroundColor: "#E65100" }}
      >
        Verify OTP
      </button>

      <button
        type="button"
        onClick={handleResendOtp}
        disabled={resendIn > 0}
        style={{
          background: "transparent",
          border: "none",
          boxShadow: "none",
          padding: 0,
          cursor: resendIn > 0 ? "not-allowed" : "pointer",
          color: resendIn > 0 ? "#9CA3AF" : "#E65100",
          fontSize: "0.875rem",
        }}
        onMouseOver={(e) => {
          if (!resendIn) e.currentTarget.style.textDecoration = "underline";
        }}
        onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP code"}
      </button>
    </>
  );

  // ✅ Step 3 fix TypeScript + remove default reveal icons
  const renderStep3 = () => (
    <>
      <style>{`
        input::-ms-reveal, input::-ms-clear { display: none; }
      `}</style>

      <h2 className="text-orange-500 text-xl font-semibold mb-1">Reset password</h2>
      <p className="text-gray-500 text-sm mb-4">Please enter your new password</p>

      {/* New password */}
      <div className="relative mb-3">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New password"
          className="w-full border border-gray-300 rounded-md py-2 px-4 pr-10 text-sm appearance-none"
          style={
            { ...(showPassword ? { WebkitTextSecurity: "none" } : {}) } as React.CSSProperties
          }
          value={newPass}
          onChange={(e) => {
            setNewPass(e.target.value);
            setPassErr("");
          }}
        />
        <button
          type="button"
          aria-label="Toggle password visibility"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" strokeWidth={2} />
          ) : (
            <Eye className="w-5 h-5" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Confirm password */}
      <div className="relative mb-1">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm new password"
          className="w-full border border-gray-300 rounded-md py-2 px-4 pr-10 text-sm appearance-none"
          style={
            { ...(showConfirmPassword ? { WebkitTextSecurity: "none" } : {}) } as React.CSSProperties
          }
          value={confirmPass}
          onChange={(e) => {
            setConfirmPass(e.target.value);
            setPassErr("");
          }}
        />
        <button
          type="button"
          aria-label="Toggle confirm password visibility"
          onClick={() => setShowConfirmPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
        >
          {showConfirmPassword ? (
            <EyeOff className="w-5 h-5" strokeWidth={2} />
          ) : (
            <Eye className="w-5 h-5" strokeWidth={2} />
          )}
        </button>
      </div>

      {passErr && <p className="text-red-500 text-sm mb-3">{passErr}</p>}

      <button
        type="button"
        onClick={handleResetPassword}
        className="hover:brightness-105 disabled:opacity-50 text-white py-2 px-4 rounded w-full mb-2 font-medium transition-all duration-300"
        style={{ backgroundColor: "#E65100" }}
        disabled={isResetting}
      >
        {isResetting ? "Resetting..." : "Reset password"}
      </button>

      <button
        type="button"
        onClick={goSignIn}
        style={{
          background: "transparent",
          border: "none",
          boxShadow: "none",
          padding: 0,
          cursor: "pointer",
          color: "#E65100",
          fontSize: "0.875rem",
          display: "block",
          margin: "0 auto",
        }}
        onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        Return to sign in
      </button>
    </>
  );

  return (
    <div
      className="flex flex-col justify-center items-center relative"
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(to right, #FFF3E0 40%, #FFFFFF 100%)",
      }}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default ForgotPassword;
