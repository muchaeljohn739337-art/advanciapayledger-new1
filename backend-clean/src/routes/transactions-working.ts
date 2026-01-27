import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Get all transactions
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      message: "Transactions endpoint working",
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions"
    });
  }
});

export default router;
