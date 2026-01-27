/**
 * Empty Response Middleware - Advancia Pay Ledger
 * 
 * Intercepts all user/client requests and returns empty responses
 */

import { Request, Response, NextFunction } from 'express';
import { shouldReturnEmptyResponse, getEmptyResponseTemplate, logEmptyResponse } from '../config/emptyResponse.config';

export interface EmptyRequest extends Request {
  isEmptyResponse?: boolean;
}

/**
 * Empty Response Middleware
 * Returns empty responses for all user/client interactions
 */
export const emptyResponseMiddleware = (req: EmptyRequest, res: Response, next: NextFunction) => {
  // Check if request should return empty response
  if (shouldReturnEmptyResponse(req)) {
    req.isEmptyResponse = true;
    
    // Log the empty response
    logEmptyResponse(req);
    
    // Get empty response template
    const emptyResponse = getEmptyResponseTemplate(req.method);
    
    return res.json(emptyResponse);
  }

  // Allow admin/system requests to proceed
  next();
};

/**
 * Empty Data Filter Middleware
 * Filters out any data from responses to users/clients
 */
export const emptyDataFilter = (req: EmptyRequest, res: Response, next: NextFunction) => {
  // Store original res.json method
  const originalJson = res.json;

  // Override res.json to filter data for non-admin requests
  res.json = function(data: any) {
    if (shouldReturnEmptyResponse(req) && data) {
      // Return empty response structure
      const emptyResponse = getEmptyResponseTemplate(req.method);
      return originalJson.call(this, emptyResponse);
    }

    // Return original data for admin requests
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Empty Content Middleware
 * Ensures all content is empty for user/client requests
 */
export const emptyContentMiddleware = (req: EmptyRequest, res: Response, next: NextFunction) => {
  if (shouldReturnEmptyResponse(req)) {
    // Clear request body for non-admin requests
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        req.body[key] = null;
      });
    }

    // Clear query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        req.query[key] = '';
      });
    }

    // Clear params
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        req.params[key] = '';
      });
    }
  }

  next();
};

/**
 * Complete Empty Response System
 * Combines all empty response middleware
 */
export const completeEmptyResponse = [
  emptyContentMiddleware,
  emptyResponseMiddleware,
  emptyDataFilter
];
