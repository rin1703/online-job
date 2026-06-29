import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {  } else {  }
});

/**
 * ========== EMAIL TEMPLATES & SENDING FUNCTIONS ==========
 */

const baseStyles = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  color: #333;
  line-height: 1.6;
`;

const headerStyle = `
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 5px 5px 0 0;
  text-align: center;
`;

const footerStyle = `
  background-color: #f5f5f5;
  padding: 20px;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #999;
  text-align: center;
`;

// Gửi OTP qua email
export const sendOTPEmail = async (
  email: string,
  otp: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Password Reset OTP Code",
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">Reset Your Password</h2>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello,</p>
            <p>You have requested to reset your password for your Job Portal account. Use the OTP code below to continue:</p>
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p><strong>This OTP code is valid for 5 minutes.</strong></p>
            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
          <div style="${footerStyle}">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);    return true;
  } catch (error: any) {    throw new Error(`Unable to send email: ${error.message}`);
  }
};

// Send application status notification
export const sendApplicationStatusEmail = async (
  email: string,
  jobSeekerName: string,
  jobTitle: string,
  companyName: string,
  status: "approved" | "rejected",
  note?: string
): Promise<boolean> => {
  try {
    const statusColor = status === "approved" ? "#4CAF50" : "#f44336";
    const statusText = status === "approved" ? "Approved" : "Rejected";

    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `${statusText} - Your Job Application`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">Application Status Update</h2>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello ${jobSeekerName},</p>
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 10px 0;"><strong>Company:</strong> ${companyName}</p>
              <p style="margin: 10px 0; color: ${statusColor}; font-size: 16px; font-weight: bold;">${statusText}</p>
            </div>
            ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
            <p>Thank you for your interest in Job Portal!</p>
          </div>
          <div style="${footerStyle}">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);    return true;
  } catch (error: any) {    throw new Error(`Unable to send email: ${error.message}`);
  }
};

// Send interview invitation
export const sendInterviewInvitationEmail = async (
  email: string,
  jobSeekerName: string,
  jobTitle: string,
  companyName: string,
  scheduledDate: Date,
  scheduledTime: string,
  location: string,
  meetingLink?: string,
  note?: string
): Promise<boolean> => {
  try {
    const formattedDate = new Date(scheduledDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Interview Invitation - ${jobTitle}`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">Interview Invitation</h2>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello ${jobSeekerName},</p>
            <p>Congratulations! You have been invited to an interview for the following position:</p>
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 10px 0;"><strong>Company:</strong> ${companyName}</p>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${scheduledTime}</p>
              <p style="margin: 10px 0;"><strong>Location:</strong> ${location}</p>
              ${meetingLink ? `<p style="margin: 10px 0;"><strong>Meeting:</strong> <a href="${meetingLink}">Join video call</a></p>` : ""}
              ${note ? `<p style="margin: 10px 0;"><strong>Note:</strong> ${note}</p>` : ""}
            </div>
            <p>Please confirm your attendance through the Job Portal system.</p>
          </div>
          <div style="${footerStyle}">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);    return true;
  } catch (error: any) {    throw new Error(`Unable to send email: ${error.message}`);
  }
};

// Send interview response notification to recruiter
export const sendInterviewResponseEmail = async (
  email: string,
  jobSeekerName: string,
  jobTitle: string,
  accepted: boolean,
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const statusColor = accepted ? "#4CAF50" : "#f44336";
    const statusText = accepted ? "Accepted" : "Declined";

    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `${statusText} - Interview for ${jobTitle}`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">Interview Response</h2>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello,</p>
            <p>Candidate <strong>${jobSeekerName}</strong> has responded to the interview invitation:</p>
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 10px 0; color: ${statusColor}; font-size: 16px; font-weight: bold;">${statusText}</p>
              ${rejectionReason ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${rejectionReason}</p>` : ""}
            </div>
            <p>Please check the details on the Job Portal system.</p>
          </div>
          <div style="${footerStyle}">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);    return true;
  } catch (error: any) {    throw new Error(`Unable to send email: ${error.message}`);
  }
};

// Send interview schedule update notification

// Send interview schedule update notification
export const sendInterviewUpdateEmail = async (
  email: string,
  jobSeekerName: string,
  jobTitle: string,
  companyName: string,
  scheduledDate: Date | string,
  scheduledTime: string,
  location: string,
  meetingLink?: string,
  note?: string
): Promise<boolean> => {
  try {
    // Convert scheduledDate to Date object if it's a string
    const dateObj = scheduledDate instanceof Date ? scheduledDate : new Date(scheduledDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Interview Schedule Updated - ${jobTitle}`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">Interview Schedule Updated</h2>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello ${jobSeekerName},</p>
            <p>Your interview schedule has been updated with the following details:</p>
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 10px 0;"><strong>Company:</strong> ${companyName}</p>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${scheduledTime}</p>
              <p style="margin: 10px 0;"><strong>Location:</strong> ${location}</p>
              ${meetingLink ? `<p style="margin: 10px 0;"><strong>Meeting:</strong> <a href="${meetingLink}">Join video call</a></p>` : ""}
              ${note ? `<p style="margin: 10px 0;"><strong>Note:</strong> ${note}</p>` : ""}
            </div>
            <p>Please note the new time and location so you don't miss the interview!</p>
          </div>
          <div style="${footerStyle}">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);    return true;
  } catch (error: any) {    throw new Error(`Unable to send email: ${error.message}`);
  }
};

// Send report notification to admin
export const sendReportNotificationEmail = async (
  recipientEmail: string,
  reporterName: string,
  reportType: "job" | "user",
  reason: string,
  description: string
): Promise<boolean> => {
  try {
    const reportTitle = reportType === "job" ? "Job Report" : "User Report";

    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: recipientEmail,
      subject: `New ${reportTitle}`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">${reportTitle}</h2>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello Admin,</p>
            <p>A new ${reportType === "job" ? "job" : "user"} report has been submitted by <strong>${reporterName}</strong>:</p>
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Report Type:</strong> ${reportTitle}</p>
              <p style="margin: 10px 0;"><strong>Reporter:</strong> ${reporterName}</p>
              <p style="margin: 10px 0;"><strong>Reason:</strong> ${reason}</p>
              <p style="margin: 10px 0;"><strong>Details:</strong> ${description}</p>
            </div>
            <p>Please review and take action on the Job Portal system.</p>
          </div>
          <div style="${footerStyle}">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);    return true;
  } catch (error: any) {    throw new Error(`Unable to send email: ${error.message}`);
  }
};

// Send broadcast notification from admin
export const sendBroadcastEmail = async (
  email: string,
  title: string,
  content: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `${title}`,
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">${title}</h2>
          </div>
          <div style="padding: 30px; background: white;">
            ${content}
          </div>
          <div style="${footerStyle}">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    const info = await transporter.sendMail(mailOptions);    return true;
  } catch (error: any) {    throw new Error(`Không thể gửi email: ${error.message}`);
  }
};

/**
 * Send account activation email to recruiter
 * Email contains activation link button with token
 */
export const sendActivationEmail = async (
  email: string,
  recruiterName: string,
  token: string
): Promise<boolean> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const activationLink = `${frontendUrl}/auth/activate/${token}`;

    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Recruiter Account Approved - Activate Now!",
      html: `
        <div style="${baseStyles}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">Congratulations! Your Account Has Been Approved</h2>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello <strong>${recruiterName}</strong>,</p>
            <p>We are pleased to inform you that your <strong>Recruiter</strong> account has been <strong style="color: #4CAF50;">approved by admin</strong>!</p>
            
            <p>To complete the registration process and start posting job listings, please activate your account by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" 
                 style="display: inline-block; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Activate Account
              </a>
            </div>
            
            <p style="color: #ff9800; font-weight: bold;">Important Notes:</p>
            <ul style="color: #666;">
              <li>This activation link is valid for <strong>30 minutes</strong> only</li>
              <li>After activation, you will be redirected to the login page</li>
              <li>This link can only be used once</li>
            </ul>
            
            <p style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-left: 4px solid #667eea;">
              <small>If the button doesn't work, please copy and paste the following link into your browser:<br/>
              <a href="${activationLink}" style="color: #667eea; word-break: break-all;">${activationLink}</a></small>
            </p>
            
            <p>If you encounter any issues, please contact us.</p>
            
            <p style="margin-top: 30px;">Best regards,<br/><strong>Job Portal Team</strong></p>
          </div>
          <div style="${footerStyle}">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    throw new Error(`Unable to send activation email: ${error.message}`);
  }
};

/**
 * Send rejection notification email to recruiter
 */
export const sendRejectionEmail = async (
  email: string,
  recruiterName: string,
  rejectionReason: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Recruiter Account Status",
      html: `
        <div style="${baseStyles}">
          <div style="background: #f44336; color: white; padding: 30px; border-radius: 5px 5px 0 0; text-align: center;">
            <h2 style="margin: 0;">Notification from Job Portal</h2>
          </div>
          <div style="padding: 30px; background: white;">
            <p>Hello <strong>${recruiterName}</strong>,</p>
            
            <p>Thank you for registering a <strong>Recruiter</strong> account at Job Portal.</p>
            
            <p>Unfortunately, after careful review, we are unable to approve your account at this time.</p>
            
            <div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #856404;">Reason:</p>
              <p style="margin: 10px 0 0 0; color: #856404;">${rejectionReason}</p>
            </div>
            
            <p>If you believe this is a mistake or would like more information, please contact us:</p>
            
            <ul style="color: #666;">
              <li>Email: support@jobportal.com</li>
              <li>Hotline: 1900-xxxx</li>
            </ul>
            
            <p>We hope to have the opportunity to assist you in the future.</p>
            
            <p style="margin-top: 30px;">Best regards,<br/><strong>Job Portal Team</strong></p>
          </div>
          <div style="${footerStyle}">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    throw new Error(`Unable to send rejection email: ${error.message}`);
  }
};
