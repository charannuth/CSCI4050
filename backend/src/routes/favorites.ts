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
    const { movieId } = req.body;
    
    // TEMPORARY: Replace this string with a real ID from your User table after registering!
    const userId = "placeholder-user-id"; 

    if (!movieId) {
      res.status(400).json({ error: "Movie ID is required" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        favoriteMovies: {
          connect: { id: movieId } // No Number() wrapper needed for cuid Strings
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
    const { movieId } = req.body;
    const userId = "placeholder-user-id"; 

    if (!movieId) {
      res.status(400).json({ error: "Movie ID is required" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
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