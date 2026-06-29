import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { District, Province } from './address.types.ts';

export const addressApi = createApi({
  reducerPath: 'addressApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://provinces.open-api.vn/api' }),
  endpoints: (builder) => ({
    getProvinces: builder.query<Province[], void>({
      query: () => 'p/',
    }),
    getDistricts: builder.query<Province, number>({
      query: (provinceCode) => `p/${provinceCode}?depth=2`,
    }),
    getWards: builder.query<District, number>({
      query: (districtCode) => `d/${districtCode}?depth=2`,
    }),
  }),
});

export const { useGetProvincesQuery, useGetDistrictsQuery, useGetWardsQuery } = addressApi;
