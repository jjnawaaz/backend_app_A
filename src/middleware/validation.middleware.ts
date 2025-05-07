import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validate(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      // Instead of returning the response, just send it and return
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    next(); // No return needed here
  };
}