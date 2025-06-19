import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod/v4";

/**
 * Schemas for validation
 */

// Login Schema
const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});

export type LoginBody = z.infer<typeof loginSchema>;

// Signup Schema
const signupSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});

/**
 * Validation functions
 */

// Login Validation
export const loginValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors:
          error?.issues?.map((issue) => issue?.path + ": " + issue?.message) ||
          "Something went wrong",
      });
    } else {
      console.log("first");
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Signup Validation
export const signupValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    signupSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors:
          error?.issues?.map((issue) => issue?.path + ": " + issue?.message) ||
          "Something went wrong",
      });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
