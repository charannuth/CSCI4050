import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// --- REGISTRATION ROUTE ---
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        status: "INACTIVE", 
        role: "CUSTOMER"
      }
    });

    res.status(201).json({ message: "Registration successful", userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. ADDED: Tell Prisma to grab the user's favorite movies too!
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { favoriteMovies: true } 
    });
    
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // 2. ADDED: Send the favoriteMovies array back to the React frontend
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        favoriteMovies: user.favoriteMovies 
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

export default router;