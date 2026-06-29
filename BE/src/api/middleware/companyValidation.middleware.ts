import { Request, Response, NextFunction } from "express";
import { CreateCompanyDTO } from "../dto/company/createCompany.dto";
import { UpdateCompanyDTO } from "../dto/company/updateCompany.dto";

/**
 * Validate create company request
 */
export const validateCreateCompany = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const dto = new CreateCompanyDTO(req.body);
        req.body = dto; // Replace body with validated DTO
        next();
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Validation failed",
        });
    }
};

/**
 * Validate update company request
 */
export const validateUpdateCompany = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        // Check if body is empty
        if (Object.keys(req.body).length === 0) {
            throw new Error("Request body cannot be empty");
        }

        const dto = new UpdateCompanyDTO(req.body);
        req.body = dto; // Replace body with validated DTO
        next();
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Validation failed",
        });
    }
};

/**
 * Validate MongoDB ObjectId format
 */
export const validateObjectId = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    // MongoDB ObjectId is 24 hex characters
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!id || !objectIdRegex.test(id)) {
        res.status(400).json({
            success: false,
            message: "Invalid company ID format",
        });
        return;
    }

    next();
};
