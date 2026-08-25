export interface Education {
  degree: string;
  institute: string;
  yearPassed: string;
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  education: Education[];
}