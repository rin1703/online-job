import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Icons } from "@/components/icons/icons";
import { setCredentials } from "@/features/auth/api/auth.slice";
import type { AuthUser } from "@/features/auth/api/auth.type";
import { decodeUserFromToken } from "@/lib/jwt";
import { useSignInMutation } from "@/redux/features/auth/authApi";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function SignInForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signIn, { isLoading }] = useSignInMutation();

  // State để quản lý hiển thị/ẩn password
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("[SignInForm] Login attempt with email:", values.email);
      const response = await signIn(values).unwrap();

      console.log("[SignInForm] Response received:", {
        success: response.success,
        message: response.message,
        dataKeys: response.data ? Object.keys(response.data) : "no data",
        hasToken: !!response.data?.token,
      });

      if (!response.success) {
        console.error("[SignInForm] Login failed - response.success is false");
        toast.error(response.message || "Login failed");
        return;
      }

      if (!response.data?.token) {
        console.error("[SignInForm] Login failed - no token in response");
        console.error("[SignInForm] Response data:", response.data);
        toast.error("No token received from server");
        return;
      }

      const { token } = response.data;
      console.log("[SignInForm] Token received from server:", {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + "...",
      });

      // Decode token to get user information
      const decodedUser = decodeUserFromToken(token);

      if (!decodedUser) {
        console.error("[SignInForm] Failed to decode token");
        toast.error("Failed to process login token");
        return;
      }

      console.log("[SignInForm] Token decoded successfully:", {
        userId: decodedUser.userId,
        email: decodedUser.email,
        role: decodedUser.role,
      });

      // Convert decoded token to AuthUser
      const user: AuthUser = decodedUser;

      // Save to localStorage
      console.log("[SignInForm] Saving credentials to localStorage");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch to Redux
      console.log("[SignInForm] Dispatching credentials to Redux");
      dispatch(setCredentials({ token, user }));

      // Show success message
      toast.success(response.message || "Login successful!");
      console.log("[SignInForm] Login successful, redirecting...");

      // Redirect based on user role
      switch (user.role) {
        case "recruiter":
          console.log("[SignInForm] Redirecting to recruiter overview");
          navigate("/recruiter/overview");
          break;
        case "admin":
          console.log("[SignInForm] Redirecting to admin dashboard");
          navigate("/admin");
          break;
        case "job_seeker":
        default:
          console.log("[SignInForm] Redirecting to jobs");
          navigate("/jobs");
          break;
      }
    } catch (error: any) {
      console.error("[SignInForm] Login error:", {
        errorType: error?.status ? "HTTP Error" : "Other Error",
        status: error?.status,
        data: error?.data,
        message: error?.message,
        fullError: error,
      });
      const errorMessage =
        error?.data?.message || error?.message || "Invalid credentials or server error";
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8.5 max-w-3xl mx-auto">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Email" type="email" icon={<Icons.mail />} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <Icons.eyeOff /> : <Icons.eye />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ButtonLowercase
          type="submit"
          className="w-full h-12 text-white transition-colors font-black text-lg"
          variant="orange"
          disabled={isLoading}
        >
          Login
        </ButtonLowercase>
      </form>
    </Form>
  );
}
