import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';

export function logErrors(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error Logger]:', err);
  next(err);
}

export function wrapErrors(err: any, req: Request, res: Response, next: NextFunction) {
  if (!Boom.isBoom(err)) {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    next(new Boom.Boom(message, { statusCode }));
  } else {
    next(err);
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const { output: { statusCode, payload } } = err;
  
  // Send the JSON response. We map payload.message to the 'error' field 
  // so that frontend libraries expecting `error.response.data.error` remain fully compatible.
  res.status(statusCode).json({
    statusCode,
    error: payload.message || payload.error,
    message: payload.message
  });
}
