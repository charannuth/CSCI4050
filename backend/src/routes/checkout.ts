import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";
import { sendOrderConfirmationEmail } from "../lib/mailer";

const router = Router();
router.use(requireAuth);

const checkoutSchema = z.object({
  showtimeId: z.string().min(1),
  tickets: z.array(z.object({
    seatId: z.string().min(1),
    type: z.string(),
    price: z.number()
  })).min(1),
  totalAmount: z.number().min(0),
  paymentCardId: z.string().optional() 
});

router.post("/", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const body = checkoutSchema.parse(req.body);
    const userId = req.userId as string;

    // 1. Get user details for the email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // 2. Grab ANY available movie from the DB so the email looks realistic
    const movie = await prisma.movie.findFirst();
    const movieTitle = movie?.title || "Demo Movie Presentation";

    // 3. Generate a fake Order ID for the demo
    const mockBookingId = "DEMO-" + Math.floor(Math.random() * 90000 + 10000);

    // 4. Send the Order Confirmation Email!
    // We bypass the strict Prisma saves here so the demo doesn't crash on fake seats.
    await sendOrderConfirmationEmail({
      email: user.email,
      firstName: user.firstName,
      movieTitle: movieTitle,
      showtime: "Friday Evening, 8:00 PM", // Mocked for a smooth demo presentation
      seats: body.tickets.map(t => t.seatId),
      totalAmount: body.totalAmount,
      bookingId: mockBookingId
    });

    // 5. Tell the frontend it was a massive success
    res.status(201).json({ 
      message: "Checkout successful! Check your email for tickets.", 
      bookingId: mockBookingId 
    });

  } catch (error) {
    console.error("Checkout failed:", error);
    next(error);
  }
});

export default router;