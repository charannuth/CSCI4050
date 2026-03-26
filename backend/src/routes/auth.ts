import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const router = Router();
const prisma = new PrismaClient();

// --- ADDED: Set up the Email Sender ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    // --- ADDED: Send the Confirmation Email ---
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: 'Welcome to Cinema E-Booking! Please Activate Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #e50914;">Welcome to the Cinema, ${newUser.firstName}!</h2>
          <p>Your account has been successfully created.</p>
          <p>Your current account status is: <strong>INACTIVE</strong>.</p>
          <p><em>(Note: For this prototype, an Admin will activate your account, or you can click the placeholder link below).</em></p>
          <a href="http://localhost:5173/login" style="background-color: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
            Go to Login
          </a>
        </div>
      `
    };

    // Tell nodemailer to send it!
    await transporter.sendMail(mailOptions);
    // ------------------------------------------

    res.status(201).json({ message: "Registration successful. Confirmation email sent!", userId: newUser.id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

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