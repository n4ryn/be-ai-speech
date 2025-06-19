import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";

// Models
import User from "../models/user.model";

// Validations
import {
  loginValidation,
  signupValidation,
} from "../validations/auth.validation";

// Utils
import sendResponse from "../utils/response.util";
import status from "../utils/status.json";

const router = Router();

// Signup
router.post(
  "/signup",
  signupValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists with same email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        sendResponse(res, status.HTTP_400_BAD_REQUEST, {
          error: "User already exists",
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = await newUser.generateJWT();

      // Save user to database
      await newUser.save();

      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      sendResponse(
        res,
        status.HTTP_201_CREATED,
        { data: { token, user: newUser } },
        [
          { type: "token", value: token, config: { expires, httpOnly: true } },
          {
            type: "user",
            value: JSON.stringify(newUser),
            config: { expires, httpOnly: false },
          },
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        sendResponse(res, status.HTTP_500_INTERNAL_SERVER_ERROR, {
          error: error.message,
        });
      } else {
        sendResponse(res, status.HTTP_500_INTERNAL_SERVER_ERROR, {
          error: "Internal server error",
        });
      }
    }
  }
);

// Login
router.post(
  "/login",
  loginValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        sendResponse(res, status.HTTP_404_NOT_FOUND, {
          error: "User doesn't exists",
        });
        return;
      }

      // Validate password
      const isPasswordValid = await existingUser.validatePassword(password);
      if (!isPasswordValid) {
        sendResponse(res, status.HTTP_401_UNAUTHORIZED, {
          error: "Invalid password",
        });
        return;
      }

      // Generate JWT token
      const token = await existingUser.generateJWT();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      sendResponse(
        res,
        status.HTTP_200_OK,
        { data: { token, user: existingUser } },
        [
          { type: "token", value: token, config: { expires, httpOnly: true } },
          {
            type: "user",
            value: JSON.stringify(existingUser),
            config: { expires, httpOnly: false },
          },
        ]
      );
    } catch (error) {
      if (error instanceof Error) {
        sendResponse(res, status.HTTP_500_INTERNAL_SERVER_ERROR, {
          error: error.message,
        });
      } else {
        sendResponse(res, status.HTTP_500_INTERNAL_SERVER_ERROR, {
          error: "Internal server error",
        });
      }
    }
  }
);

// Logout
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const expires = new Date(Date.now());

    sendResponse(res, status.HTTP_200_OK, {}, [
      { type: "token", value: "", config: { expires, httpOnly: true } },
      { type: "user", value: "", config: { expires, httpOnly: false } },
    ]);
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, status.HTTP_500_INTERNAL_SERVER_ERROR, {
        error: error.message,
      });
    } else {
      sendResponse(res, status.HTTP_500_INTERNAL_SERVER_ERROR, {
        error: "Internal server error",
      });
    }
  }
});

export default router;
