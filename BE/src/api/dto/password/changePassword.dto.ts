export class ChangePasswordDTO {
    userId: string;
    oldPassword: string;
    newPassword: string;
  
    constructor(data: {
      userId: string;
      oldPassword: string;
      newPassword: string;
    }) {
      this.userId = data.userId;
      this.oldPassword = data.oldPassword;
      this.newPassword = data.newPassword;
    }
  }
