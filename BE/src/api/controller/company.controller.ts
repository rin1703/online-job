// @ts-nocheck
import { Request, Response } from "express";
import {
    getAllCompanies,
    getCompanyById,
    getCompanyByUserId,
    createCompany,
    updateCompany,
    deleteCompany,
    getAllCompaniesAdmin,
    getCompanyDetailRecruiter,
    getCompanyDetailRecruiterByUserId,
    getCompanyDetailAdmin,
    filterCompanies,
    getIndustriesService,
} from "../service/company.service";

/**
 * GET /api/v1/companies - Get all companies with pagination
 */
export const getAllCompaniesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllCompanies(page, limit);
    res.status(200).json({
      success: true,
      data: result.companies,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch companies",
    });
  }
};

/**
 * GET /api/v1/companies/my-company - Get company of logged-in user
 */
export const getMyCompanyController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const company = await getCompanyByUserId(userId);
        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error: any) {
        const statusCode = error.message === "Company not found" || error.message === "User does not belong to any company" ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to fetch company",
        });
    }
};

/**
 * GET /api/v1/companies/:id - Get company by ID
 */
export const getCompanyByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const company = await getCompanyById(id);
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    const statusCode = error.message === "Company not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch company",
    });
  }
};

/**
 * POST /api/v1/companies - Create a new company
 */
export const createCompanyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await createCompany(req.body);
    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error: any) {
    const statusCode = error.message.includes("required") ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create company",
    });
  }
};

/**
 * PUT /api/v1/companies/:id - Update company by ID
 */
export const updateCompanyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const company = await updateCompany(id, req.body);
    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error: any) {
    const statusCode = error.message === "Company not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update company",
    });
  }
};

/**
 * DELETE /api/v1/companies/:id - Delete company by ID
 */
export const deleteCompanyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteCompany(id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.company,
    });
  } catch (error: any) {
    const statusCode = error.message === "Company not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete company",
    });
  }
};

/**
 * GET /api/v1/companies/admin/all - Get all companies for Admin
 */
export const getAllCompaniesAdminController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await getAllCompaniesAdmin(page, limit);
        res.status(200).json({
            success: true,
            data: result.companies,
            pagination: result.pagination,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch companies",
        });
    }
};

/**
 * GET /api/v1/companies/recruiter/my-company - Get company detail for Recruiter
 */
export const getCompanyDetailRecruiterController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const company = await getCompanyDetailRecruiterByUserId(userId);
        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error: any) {
        const statusCode = error.message === "Company not found" || error.message === "User does not belong to any company" ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to fetch company",
        });
    }
};

/**
 * GET /api/v1/companies/admin/:id - Get company detail for Admin
 */
export const getCompanyDetailAdminController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const company = await getCompanyDetailAdmin(id);
        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error: any) {
        const statusCode = error.message === "Company not found" ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Failed to fetch company",
        });
    }
};

/**
 * GET /api/v1/companies/filter - Filter companies with optional sorting
 * Query params: name, employeeCount, foundedYearFrom, foundedYearTo, industryId, industry, sort (asc|desc), page, limit
 */
export const filterCompaniesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters = {
      name: req.query.name as string,
      employeeCount: req.query.employeeCount as string,
      foundedYearFrom: req.query.foundedYearFrom as string,
      foundedYearTo: req.query.foundedYearTo as string,
      industry: req.query.industry as string,
      sort: req.query.sort as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    };

    const result = await filterCompanies(filters);
    res.status(200).json({
      success: true,
      data: result.companies,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to filter companies",
    });
  }
};

/**
 * GET /api/v1/companies/industries - Get all industries
 */
export const getIndustriesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const industries = await getIndustriesService();
    res.status(200).json({
      success: true,
      data: industries,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch industries",
    });
  }
};

