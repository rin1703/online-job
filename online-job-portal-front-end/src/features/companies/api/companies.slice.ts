import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GetCompaniesParams } from "./company.type";

interface CompanyState {
  queryParams: GetCompaniesParams;
  selectedCompanyId: string | null;
}

const initialState: CompanyState = {
  queryParams: {
    page: 1,
    limit: 10,
  },
  selectedCompanyId: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompanyParams: (state, action: PayloadAction<GetCompaniesParams>) => {
      state.queryParams = { ...state.queryParams, ...action.payload };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.queryParams.page = action.payload;
    },
    resetParams: (state) => {
      state.queryParams = initialState.queryParams;
    },
    setSelectedCompanyId: (state, action: PayloadAction<string | null>) => {
      state.selectedCompanyId = action.payload;
    },
  },
});

export const { setCompanyParams, setPage, resetParams, setSelectedCompanyId } =
  companySlice.actions;

export default companySlice.reducer;
