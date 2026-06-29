export type Province = {
  code: number;
  name: string;
  districts: District[];
}

export type District = {
  code: number;
  name: string;
  wards: Ward[];
}

export type Ward = {
  code: number;
  name: string;
}