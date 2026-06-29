// DTO để yêu cầu gửi OTP
export class ForgotPasswordDTO {
    email: string;
  
    constructor(data: { email: string }) {
      this.email = data.email;
    }
  }
  
  // DTO để xác thực OTP và đặt lại mật khẩu
  export class ResetPasswordDTO {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  
    constructor(data: {
      email: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    }) {
      this.email = data.email;
      this.otp = data.otp;
      this.newPassword = data.newPassword;
      this.confirmPassword = data.confirmPassword;
    }
  }