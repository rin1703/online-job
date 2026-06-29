import { Request, Response, NextFunction } from "express";

// ============== USER REGISTRATION VALIDATION ==============

export const validateUserRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { firstName, lastName, email, password, phone, birthday, role } = req.body;

  const errors: string[] = [];

  // Validate firstName
  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    errors.push("Tên không được để trống");
  } else if (firstName.trim().length < 1) {
    errors.push("Tên phải có ít nhất 1 ký tự");
  } else if (firstName.trim().length > 50) {
    errors.push("Tên không được vượt quá 50 ký tự");
  }

  // Validate lastName
  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    errors.push("Họ không được để trống");
  } else if (lastName.trim().length < 1) {
    errors.push("Họ phải có ít nhất 1 ký tự");
  } else if (lastName.trim().length > 50) {
    errors.push("Họ không được vượt quá 50 ký tự");
  }

  // Check if full name is empty (firstName + lastName)
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName.length === 0) {
    errors.push("Họ tên không được để trống");
  }

  // Validate email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email không được để trống");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Email không hợp lệ");
    }
  }

  // Validate password
  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Mật khẩu không được để trống");
  } else if (password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  } else if (password.length > 128) {
    errors.push("Mật khẩu không được vượt quá 128 ký tự");
  }

  // Validate phone (optional)
  if (phone !== undefined && phone !== null) {
    if (typeof phone !== "string") {
      errors.push("Số điện thoại phải là chuỗi");
    } else if (phone.trim().length > 0) {
      const phoneRegex = /^[0-9+\-() ]{8,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        errors.push("Số điện thoại không hợp lệ (8-20 ký tự, chỉ chứa số, +, -, (, ), khoảng trắng)");
      }
    }
  }

  // Validate birthday (required)
  if (!birthday) {
    errors.push("Ngày sinh không được để trống");
  } else {
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) {
      errors.push("Ngày sinh không hợp lệ");
    } else {
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 100) {
        errors.push("Tuổi phải từ 18 đến 100");
      }
    }
  }

  // Default missing role to job_seeker for this endpoint
  if (!role) {
    req.body.role = "job_seeker";
  } else if (role !== "job_seeker") {
    errors.push("Role phải là 'job_seeker' cho đăng ký người tìm việc");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
    return;
  }

  next();
};

// ============== RECRUITER REGISTRATION VALIDATION ==============

export const validateRecruiterRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    birthday,
    companyName,
    taxCode,
    location
  } = req.body;

  const errors: string[] = [];

  // Validate firstName
  if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
    errors.push("Tên không được để trống");
  } else if (firstName.trim().length < 1) {
    errors.push("Tên phải có ít nhất 1 ký tự");
  } else if (firstName.trim().length > 50) {
    errors.push("Tên không được vượt quá 50 ký tự");
  }

  // Validate lastName
  if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
    errors.push("Họ không được để trống");
  } else if (lastName.trim().length < 1) {
    errors.push("Họ phải có ít nhất 1 ký tự");
  } else if (lastName.trim().length > 50) {
    errors.push("Họ không được vượt quá 50 ký tự");
  }

  // Check if full name is empty (firstName + lastName)
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName.length === 0) {
    errors.push("Họ tên không được để trống");
  }

  // Validate email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email không được để trống");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Email không hợp lệ");
    }
  }

  // Validate password
  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Mật khẩu không được để trống");
  } else if (password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  } else if (password.length > 128) {
    errors.push("Mật khẩu không được vượt quá 128 ký tự");
  }

  // Validate phone (required for recruiter)
  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    errors.push("Số điện thoại không được để trống");
  } else {
    const phoneRegex = /^[0-9+\-() ]{8,20}$/;
    if (!phoneRegex.test(phone.trim())) {
      errors.push("Số điện thoại không hợp lệ (8-20 ký tự, chỉ chứa số, +, -, (, ), khoảng trắng)");
    }
  }

  // Validate birthday (required)
  if (!birthday) {
    errors.push("Ngày sinh không được để trống");
  } else {
    const birthDate = new Date(birthday);
    if (isNaN(birthDate.getTime())) {
      errors.push("Ngày sinh không hợp lệ");
    } else {
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 100) {
        errors.push("Tuổi phải từ 18 đến 100");
      }
    }
  }

  // Validate companyName (REQUIRED for recruiter)
  if (!companyName || typeof companyName !== "string" || companyName.trim().length === 0) {
    errors.push("Tên công ty không được để trống");
  } else if (companyName.trim().length < 2) {
    errors.push("Tên công ty phải có ít nhất 2 ký tự");
  } else if (companyName.trim().length > 200) {
    errors.push("Tên công ty không được vượt quá 200 ký tự");
  }

  // Validate taxCode (REQUIRED for recruiter)
  if (!taxCode || typeof taxCode !== "string" || taxCode.trim().length === 0) {
    errors.push("Mã số thuế không được để trống");
  } else if (taxCode.trim().length < 10) {
    errors.push("Mã số thuế phải có ít nhất 10 ký tự");
  } else if (taxCode.trim().length > 20) {
    errors.push("Mã số thuế không được vượt quá 20 ký tự");
  } else {
    // Basic tax code validation (numbers and letters)
    const taxCodeRegex = /^[A-Z0-9\-]+$/;
    if (!taxCodeRegex.test(taxCode.trim())) {
      errors.push("Mã số thuế chỉ được chứa chữ cái in hoa, số và dấu gạch ngang");
    }
  }

  // Validate location (REQUIRED for recruiter)
  if (!location || typeof location !== "object") {
    errors.push("Thông tin địa chỉ không hợp lệ");
  } else {
    if (!location.address || typeof location.address !== "string" || location.address.trim().length === 0) {
      errors.push("Địa chỉ không được để trống");
    } else if (location.address.trim().length < 5) {
      errors.push("Địa chỉ phải có ít nhất 5 ký tự");
    } else if (location.address.trim().length > 200) {
      errors.push("Địa chỉ không được vượt quá 200 ký tự");
    }

    if (!location.district || typeof location.district !== "string" || location.district.trim().length === 0) {
      errors.push("Quận/huyện không được để trống");
    }

    if (!location.city || typeof location.city !== "string" || location.city.trim().length === 0) {
      errors.push("Thành phố không được để trống");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
    return;
  }

  next();
};

// ============== LOGIN VALIDATION ==============

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  const errors: string[] = [];

  // Validate email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email không được để trống");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Email không hợp lệ");
    }
  }

  // Validate password
  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Mật khẩu không được để trống");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
    return;
  }

  next();
};

// ============== CHANGE PASSWORD VALIDATION ==============

export const validateChangePassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { oldPassword, newPassword } = req.body;

  const errors: string[] = [];

  // Validate oldPassword
  if (!oldPassword || typeof oldPassword !== "string" || oldPassword.length === 0) {
    errors.push("Mật khẩu cũ không được để trống");
  }

  // Validate newPassword
  if (!newPassword || typeof newPassword !== "string" || newPassword.length === 0) {
    errors.push("Mật khẩu mới không được để trống");
  } else if (newPassword.length < 6) {
    errors.push("Mật khẩu mới phải có ít nhất 6 ký tự");
  } else if (newPassword.length > 128) {
    errors.push("Mật khẩu mới không được vượt quá 128 ký tự");
  }

  // Validate that oldPassword and newPassword are different
  if (oldPassword && newPassword && oldPassword === newPassword) {
    errors.push("Mật khẩu mới phải khác mật khẩu cũ");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
    return;
  }

  next();
};

// ============== FORGOT PASSWORD VALIDATION ==============

export const validateForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;

  const errors: string[] = [];

  // Validate email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email không được để trống");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Email không hợp lệ");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
    return;
  }

  next();
};

// ============== RESET PASSWORD VALIDATION ==============

export const validateResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, otp, newPassword } = req.body;

  const errors: string[] = [];

  // Validate email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email không được để trống");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Email không hợp lệ");
    }
  }

  // Validate OTP
  if (!otp || typeof otp !== "string" || otp.trim().length === 0) {
    errors.push("Mã OTP không được để trống");
  } else if (!/^\d{6}$/.test(otp.trim())) {
    errors.push("Mã OTP phải là 6 chữ số");
  }

  // Validate newPassword
  if (!newPassword || typeof newPassword !== "string" || newPassword.length === 0) {
    errors.push("Mật khẩu mới không được để trống");
  } else if (newPassword.length < 6) {
    errors.push("Mật khẩu mới phải có ít nhất 6 ký tự");
  } else if (newPassword.length > 128) {
    errors.push("Mật khẩu mới không được vượt quá 128 ký tự");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors,
    });
    return;
  }

  next();
};
