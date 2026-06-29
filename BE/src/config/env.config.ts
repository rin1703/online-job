/**
 * Environment Configuration
 * Loads and validates environment variables from .env file
 * Must be imported first before any other modules that use process.env
 */

import dotenv from "dotenv";

dotenv.config();

/**
 * Required environment variable names
 */
const REQUIRED_ENV_VARIABLE_NAMES = [
  "CLOUDINARY_NAME",
  "CLOUDINARY_KEY",
  "CLOUDINARY_SECRET",
  "MONGODB_URI",
  "PAYOS_CLIENT_ID",
  "PAYOS_API_KEY",
  "PAYOS_CHECKSUM_KEY",
] as const;

/**
 * Interface for required environment variables
 */
interface RequiredEnvironmentVariables {
  CLOUDINARY_NAME: string | undefined;
  CLOUDINARY_KEY: string | undefined;
  CLOUDINARY_SECRET: string | undefined;
  MONGODB_URI: string | undefined;
  PAYOS_CLIENT_ID: string | undefined;
  PAYOS_API_KEY: string | undefined;
  PAYOS_CHECKSUM_KEY: string | undefined;
}

/**
 * Retrieves required environment variables
 * 
 * @returns Object containing required environment variable values
 */
function getRequiredEnvironmentVariables(): RequiredEnvironmentVariables {
  return {
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
    PAYOS_API_KEY: process.env.PAYOS_API_KEY,
    PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,
  };
}

/**
 * Logs environment variable status for debugging
 * Masks sensitive values for security
 */
function logEnvironmentVariableStatus(): void {
  const envVariables = getRequiredEnvironmentVariables();
  
  console.log("🔍 Environment Variables Check:");
  
  for (const [key, value] of Object.entries(envVariables)) {
    logEnvironmentVariable(key, value);
  }
}

/**
 * Logs individual environment variable status
 * Shows masked value for secrets and keys
 * 
 * @param variableName - Name of the environment variable
 * @param value - Value of the environment variable
 */
function logEnvironmentVariable(variableName: string, value: string | undefined): void {
  if (!value) {
    console.log(`  ⚠️  ${variableName}: Missing`);
    return;
  }
  
  const shouldMaskValue = isSensitiveVariable(variableName);
  const displayValue = shouldMaskValue ? maskValue(value) : value;
  
  console.log(`  ✅ ${variableName}: ${displayValue}`);
}

/**
 * Determines if variable contains sensitive information
 * 
 * @param variableName - Name of the variable
 * @returns True if variable should be masked
 */
function isSensitiveVariable(variableName: string): boolean {
  const sensitiveKeywords = ["SECRET", "KEY", "PASSWORD", "TOKEN"];
  
  return sensitiveKeywords.some(keyword => 
    variableName.includes(keyword)
  );
}

/**
 * Masks sensitive value for logging
 * Shows only first 4 characters
 * 
 * @param value - Value to mask
 * @returns Masked value string
 */
function maskValue(value: string): string {
  const visibleCharacters = 4;
  return value.substring(0, visibleCharacters) + "...";
}

logEnvironmentVariableStatus();

const requiredEnvVars = getRequiredEnvironmentVariables();
export default requiredEnvVars;

