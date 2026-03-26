import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/users/favorites
 * Adds a movie to the user's favorite list
 */
router.post('/favorites', async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, userId } = req.body; 

    console.log("---- INCOMING FAVORITE REQUEST ----");
    console.log("Received Movie ID:", movieId);
    console.log("Received User ID:", userId);

    if (!movieId || !userId) {
      res.status(400).json({ error: "Movie ID and User ID are required" });
      return;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId }, // Uses the real ID of the logged-in user
      data: {
        favoriteMovies: {
          connect: { id: movieId } 
        }
      },
      include: { favoriteMovies: true }
    });

    res.status(200).json({ 
      message: "Movie added to favorites", 
      favorites: updatedUser.favoriteMovies 
    });

  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Failed to add movie to favorites" });
  }
});

/**
 * DELETE /api/users/favorites
 * Removes a movie from the user's favorite list
 */
router.delete('/favorites', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Extract BOTH movieId and userId from the frontend request
    const { movieId, userId } = req.body;

    // 2. Make sure both IDs were actually sent
    if (!movieId || !userId) {
      res.status(400).json({ error: "Movie ID and User ID are required" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId }, // Uses the real ID of the logged-in user
      data: {
        favoriteMovies: {
          disconnect: { id: movieId }
        }
      },
      include: { favoriteMovies: true }
    });

    res.status(200).json({ 
      message: "Movie removed from favorites",
      favorites: updatedUser.favoriteMovies
    });

  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Failed to remove movie from favorites" });
  }
});

export default router;