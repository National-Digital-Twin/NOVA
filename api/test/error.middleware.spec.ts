import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../src/middleware/error.middleware';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should log the error to console', () => {
    const error = new Error('Test error');

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred:', error);
  });

  it('should log the full stack trace to console', () => {
    const error = new Error('Test error');

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Stack trace:', error.stack);
  });

  it('should return a 400 status code', () => {
    const error = new Error('Test error');

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('should return the error message in JSON format', () => {
    const error = new Error('Test error');

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Test error'
    });
  });

  it('should use a default message if error message is empty', () => {
    const error = new Error();

    errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'An unexpected error occurred'
    });
  });
});
