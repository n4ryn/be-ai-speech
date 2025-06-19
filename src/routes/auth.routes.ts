import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";

// Models
import User from "../models/user.model";

// Validations
import {
  loginValidation,
  signupValidation,
} from "../validations/auth.validation";

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
        res.status(400).json({ message: "User already exists" });
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

      res
        .cookie("token", token, {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          httpOnly: true,
        })
        .status(201)
        .json({
          message: "Signup successful",
          data: { token, user: newUser },
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
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
        res.status(404).json({ message: "User doesn't exists" });
        return;
      }

      // Validate password
      const isPasswordValid = await existingUser.validatePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT token
      const token = await existingUser.generateJWT();

      res
        .cookie("token", token, {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          httpOnly: true,
        })
        .status(200)
        .send({
          message: "Login successful",
          data: { token, user: existingUser },
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

// Logout
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    res
      .cookie("token", "", { expires: new Date(Date.now()) })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
