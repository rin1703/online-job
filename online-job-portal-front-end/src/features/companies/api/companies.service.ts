import { baseApi } from "@/redux/baseApi";
import type {
  GetCompaniesParams,
  GetCompaniesResponse,
  GetCompanyResponse,
  UpdateCompanyRequest,
  UpdateCompanyResponse,
  DeleteCompanyResponse,
  FilterCompaniesParams,
  GetIndustriesResponse,
} from "./company.type";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get All Companies
    getCompanies: builder.query<GetCompaniesResponse, GetCompaniesParams>({
      query: (params) => ({
        url: "companies",
        method: "GET",
        params: params,
      }),
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Company" as const, id: _id })),
              { type: "Company", id: "LIST" },
            ]
          : [{ type: "Company", id: "LIST" }],
    }),

    // API Get My Company
    getRecruiterCompany: builder.query<GetCompanyResponse, void>({
      query: () => ({
        url: "companies/recruiter/my-company",
        method: "GET",
      }),
      providesTags: (result) =>
        result && result.data
          ? [
              { type: "Company", id: result.data._id },
              { type: "Company", id: "LIST" },
            ]
          : [{ type: "Company", id: "LIST" }],
    }),

    // 2. Get Company by ID (Public/User)
    getCompanyById: builder.query<GetCompanyResponse, string>({
      query: (id) => ({
        url: `companies/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Company", id }],
    }),

    // --- NEW: Get Company by ID (Admin) ---
    getCompanyByIdAdmin: builder.query<GetCompanyResponse, string>({
      query: (id) => ({
        url: `companies/admin/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Company", id }],
    }),
    // -------------------------------------

    // 3. Update Company
    updateCompany: builder.mutation<UpdateCompanyResponse, UpdateCompanyRequest>({
      query: ({ _id, ...data }) => ({
        url: `companies/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { _id }) => [
        { type: "Company", id: _id },
        { type: "Company", id: "LIST" },
      ],
    }),

    // 4. Delete Company
    deleteCompany: builder.mutation<DeleteCompanyResponse, string>({
      query: (id) => ({
        url: `companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Company", id: "LIST" },
        { type: "Company", id },
      ],
    }),

    // 5. Filter Companies
    getFilteredCompanies: builder.query<GetCompaniesResponse, FilterCompaniesParams>({
      query: (params) => {
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v != null && v !== ""),
        );

        return {
          url: "companies/filter",
          method: "GET",
          params: cleanParams,
        };
      },
      providesTags: (result) =>
        result && result.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Company" as const, id: _id })),
              { type: "Company", id: "LIST" },
            ]
          : [{ type: "Company", id: "LIST" }],
    }),

    // Get all industries
    getIndustries: builder.query<GetIndustriesResponse, void>({
      query: () => ({
        url: "companies/industries",
        method: "GET",
      }),
      providesTags: [{ type: "Company", id: "INDUSTRIES" }],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetRecruiterCompanyQuery,
  useGetCompanyByIdQuery,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useGetFilteredCompaniesQuery,
  useGetCompanyByIdAdminQuery,
  useGetIndustriesQuery,
} = companyApi;
