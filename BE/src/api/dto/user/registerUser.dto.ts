export class RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  phone: string;
  role: string;

  constructor(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthday: Date;
    phone: string;
    role?: string;
  }) {
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.birthday = data.birthday;
    this.phone = data.phone;
    this.role = data.role;
  }
}


