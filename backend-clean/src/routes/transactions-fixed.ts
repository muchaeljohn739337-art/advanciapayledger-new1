import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import {
  sendCSVResponse,
  sendExcelResponse,
  formatCurrency,
  formatDateTime,
  formatStatus,
  generateFilename,
} from "../utils/exportHelpers";

// In-memory transactions store for the MVP backend.
// This keeps TypeScript and the build clean without requiring Prisma
// configuration, while still matching the API shape used by Retool.

type Transaction = {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  createdAt: Date;
};

const transactions: Transaction[] = [];

function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const end = start + limit;
  const slice = items.slice(start, end);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { data: slice, total, page, totalPages };
}

const router = Router();

router.get("/", (req: any, res: any) => {
  const page = parseInt(String(req.query.page ?? "1"), 10) || 1;
  const limit = parseInt(String(req.query.limit ?? "50"), 10) || 50;

  const status = req.query.status
    ? String(req.query.status).toUpperCase()
    : undefined;
  const method = req.query.method
    ? String(req.query.method).toUpperCase()
    : undefined;

  let filteredTransactions = transactions;

  if (status) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.status === status
    );
  }

  if (method) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.type === method
    );
  }

  const paginatedTransactions = paginate(
    filteredTransactions,
    page,
    limit
  );

  res.json({
    success: true,
    ...paginatedTransactions,
  });
});

router.get("/export", (req: any, res: any) => {
  const format = req.query.format as string;
  const status = req.query.status
    ? String(req.query.status).toUpperCase()
    : undefined;
  const method = req.query.method
    ? String(req.query.method).toUpperCase()
    : undefined;

  let filteredTransactions = transactions;

  if (status) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.status === status
    );
  }

  if (method) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.type === method
    );
  }

  const filename = generateFilename("transactions", format);

  if (format === "csv") {
    sendCSVResponse(res, filteredTransactions, filename);
  } else if (format === "excel") {
    sendExcelResponse(res, filteredTransactions, filename);
  } else {
    res.status(400).json({
      success: false,
      error: "Invalid format. Use 'csv' or 'excel'.",
    });
  }
});

export default router;
