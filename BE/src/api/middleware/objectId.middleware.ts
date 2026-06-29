import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { sendBadRequestResponse } from "../../helper/response.helper";
import { ERROR_MESSAGES } from "../../helper/constants.helper";

/**
 * Creates middleware to validate MongoDB ObjectId in route parameters
 * Ensures ID format is valid before processing request
 * 
 * @param parameterName - Name of the route parameter to validate (e.g., "userId", "expId")
 * @returns Express middleware function
 * 
 * @example
 * router.get('/users/:userId', validateObjectIdParam('userId'), getUser);
 */
export function validateObjectIdParam(parameterName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parameterValue = req.params[parameterName];
    
if (!isValidObjectId(String(parameterValue))) {
      const errorMessage = `${ERROR_MESSAGES.INVALID_OBJECT_ID}: ${parameterName}`;
      sendBadRequestResponse(res, errorMessage);
      return;
    }
    
    next();
  };
}

/**
 * Validates if a string is a valid MongoDB ObjectId
 * 
 * @param id - String to validate
 * @returns True if valid ObjectId format, false otherwise
 */
function isValidObjectId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}
