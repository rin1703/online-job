interface LocationDTO {
  address: string;
  district: string;
  city: string;
}

export class RegisterRecruiterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthday: Date;
  role: string;

  companyName: string;
  taxCode: string;

  location: LocationDTO;

  constructor(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthday: Date;
    phone: string;
    role: string;
    companyName: string;
    taxCode: string;
    location: LocationDTO;
  }) {
    this.email = data.email.trim().toLowerCase();
    this.password = data.password;
    this.firstName = data.firstName.trim();
    this.lastName = data.lastName.trim();
    this.birthday = data.birthday;
    this.phone = data.phone.trim();
    this.role = data.role;
    this.companyName = data.companyName.trim();
    this.taxCode = data.taxCode.trim();
    this.location = {
      address: data.location.address.trim(),
      district: data.location.district.trim(),
      city: data.location.city.trim(),
    };
  }
}
