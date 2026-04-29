import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";
import { sendOrderConfirmationEmail } from "../lib/mailer";

const router = Router();
router.use(requireAuth);

const checkoutSchema = z.object({
  showtimeId: z.string().min(1),
  tickets: z
    .array(
      z.object({
        seatLabel: z
          .string()
          .trim()
          .toUpperCase()
          .regex(/^[A-Z]\d{1,2}$/),
        type: z.string(),
        price: z.number().min(0)
      })
    )
    .min(1),
  totalAmount: z.number().min(0),
  paymentCardId: z.string().optional()
});

router.post("/", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const body = checkoutSchema.parse(req.body);
    const userId = req.userId as string;

    const [user, showtime] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.showtime.findUnique({
        where: { id: body.showtimeId },
        include: {
          movie: true,
          auditorium: true
        }
      })
    ]);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!showtime) {
      res.status(404).json({ error: "Showtime not found." });
      return;
    }

    if (body.paymentCardId) {
      const savedCard = await prisma.paymentCard.findFirst({
        where: {
          id: body.paymentCardId,
          userId
        }
      });
      if (!savedCard) {
        res.status(400).json({ error: "Selected payment card is invalid." });
        return;
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId,
          totalAmount: body.totalAmount,
          status: "CONFIRMED"
        }
      });

      for (const ticket of body.tickets) {
        const match = /^([A-Z])(\d{1,2})$/.exec(ticket.seatLabel);
        if (!match) {
          throw new Error(`Invalid seat label: ${ticket.seatLabel}`);
        }

        const row = match[1];
        const number = Number(match[2]);
        if (number < 1 || number > 99) {
          throw new Error(`Invalid seat label: ${ticket.seatLabel}`);
        }

        let seat = await tx.seat.findFirst({
          where: {
            auditoriumId: showtime.auditoriumId,
            row,
            number
          }
        });

        if (!seat) {
          seat = await tx.seat.create({
            data: {
              auditoriumId: showtime.auditoriumId,
              row,
              number
            }
          });
        }

        await tx.ticket.create({
          data: {
            bookingId: booking.id,
            showtimeId: showtime.id,
            seatId: seat.id,
            type: ticket.type.toUpperCase(),
            price: ticket.price
          }
        });
      }

      return booking;
    });

    const displayShowtime = showtime.startsAt.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });

    let emailDelivered = true;
    try {
      await sendOrderConfirmationEmail({
        email: user.email,
        firstName: user.firstName,
        movieTitle: showtime.movie.title,
        showtime: `${displayShowtime} (${showtime.auditorium.name})`,
        seats: body.tickets.map((t) => t.seatLabel),
        totalAmount: body.totalAmount,
        bookingId: created.id
      });
    } catch (mailError) {
      emailDelivered = false;
      // eslint-disable-next-line no-console
      console.error("Order email failed, but booking succeeded:", mailError);
    }

    res.status(201).json({
      message: emailDelivered
        ? "Checkout successful! Check your email for tickets."
        : "Checkout successful! Booking is confirmed, but confirmation email could not be sent.",
      bookingId: created.id,
      emailDelivered
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      res.status(409).json({ error: "One or more selected seats were already booked. Please choose different seats." });
      return;
    }
    next(error);
  }
});

export default router;