// Utility functions for validation and parsing

export const parseIntParam = (param: string | undefined, paramName: string): number => {
  if (!param) {
    throw new Error(`${paramName} is required`);
  }
  
  const parsed = parseInt(param);
  if (isNaN(parsed)) {
    throw new Error(`Invalid ${paramName}`);
  }
  
  return parsed;
};

export const parseOptionalIntParam = (param: string | undefined): number | undefined => {
  if (!param) return undefined;
  
  const parsed = parseInt(param);
  return isNaN(parsed) ? undefined : parsed;
};