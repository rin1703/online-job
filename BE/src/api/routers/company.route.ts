import { Router } from "express";
import {
    getAllCompaniesController,
    getCompanyByIdController,
    createCompanyController,
    updateCompanyController,
    deleteCompanyController,
    getMyCompanyController,
    getAllCompaniesAdminController,
    getCompanyDetailRecruiterController,
    getCompanyDetailAdminController,
    filterCompaniesController,
    getIndustriesController,
} from "../controller/company.controller";
import {
    validateCreateCompany,
    validateUpdateCompany,
    validateObjectId,
} from "../middleware/companyValidation.middleware";
import {
    authMiddleware,
    requireRole,
} from "../middleware/auth.middleware";
import { UserRole } from "../models/enum/userRole.enum";

const router: Router = Router();

/* ---------- PUBLIC ROUTES ---------- */

/**
 * GET /api/v1/companies - Get all companies with pagination
 * Query params: page (default: 1), limit (default: 10)
 */
router.get("/", getAllCompaniesController);

/**
 * GET /api/v1/companies/my-company - Get company of logged-in user
 */
router.get("/my-company", authMiddleware, getMyCompanyController);

/**
 * GET /api/v1/companies/filter - Filter companies with optional sorting
 * Query params: name, employeeCount, foundedYearFrom, foundedYearTo, industry, sort (asc|desc), page, limit
 */
router.get("/filter", filterCompaniesController);

/**
 * GET /api/v1/companies/industries - Get all industries
 */
router.get("/industries", getIndustriesController);

/**
 * GET /api/v1/companies/:id - Get company by ID
 */
router.get("/:id", validateObjectId, getCompanyByIdController);


/* ---------- PROTECTED ROUTES ---------- */

/**
 * GET /api/v1/companies/admin/all - Get all companies for Admin
 * Requires: ADMIN role
 */
router.get(
    "/admin/all",
    authMiddleware,
    requireRole(UserRole.ADMIN),
    getAllCompaniesAdminController
);

/**
 * GET /api/v1/companies/admin/:id - Get company detail for Admin
 * Requires: ADMIN role
 */
router.get(
    "/admin/:id",
    authMiddleware,
    requireRole(UserRole.ADMIN),
    validateObjectId,
    getCompanyDetailAdminController
);


/**
 * GET /api/v1/companies/recruiter/my-company - Get company detail for Recruiter
 * Requires: RECRUITER role
 */
router.get(
    "/recruiter/my-company",
    authMiddleware,
    requireRole(UserRole.RECRUITER),
    getCompanyDetailRecruiterController
);



/**
 * POST /api/v1/companies - Create a new company
 * Requires: ADMIN or RECRUITER role
 */
router.post(
    "/",
    authMiddleware,
    requireRole(UserRole.ADMIN, UserRole.RECRUITER),
    validateCreateCompany,
    createCompanyController
);

/**
 * PUT /api/v1/companies/:id - Update company by ID
 * Requires: ADMIN or RECRUITER role
 */
router.put(
    "/:id",
    authMiddleware,
    requireRole(UserRole.ADMIN, UserRole.RECRUITER),
    validateObjectId,
    validateUpdateCompany,
    updateCompanyController
);

/**
 * DELETE /api/v1/companies/:id - Delete company by ID
 * Requires: ADMIN role only
 */
router.delete(
    "/:id",
    authMiddleware,
    requireRole(UserRole.ADMIN),
    validateObjectId,
    deleteCompanyController
);

export default router;
