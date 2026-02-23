// ── Mocks (must be declared before any imports) ──────────────────────────────

const mockWalletFindFirst = jest.fn();
const mockTransactionCreate = jest.fn();
const mockNotificationCreate = jest.fn();
const mockCryptoDepositUpsert = jest.fn();
const mockCryptoDepositFindUnique = jest.fn();
const mockWalletUpdate = jest.fn();
const mockPrismaTransaction = jest.fn();

jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    $transaction: mockPrismaTransaction,
    wallet: { findFirst: mockWalletFindFirst, update: mockWalletUpdate },
    transaction: { create: mockTransactionCreate },
    notification: { create: mockNotificationCreate },
    cryptoDeposit: {
      upsert: mockCryptoDepositUpsert,
      findUnique: mockCryptoDepositFindUnique,
    },
  },
}));

// nowPaymentsService mock — built as a controllable factory
const mockCreatePayment = jest.fn();
const mockVerifySig = jest.fn();
const mockGetStatus = jest.fn();
const mockGetCurrencies = jest.fn();
const mockGetEstimate = jest.fn();
const mockGetPaymentUrl = jest.fn().mockReturnValue("https://nowpayments.io/payment/?iid=pay_xyz");
const mockMapStatus = jest.fn().mockReturnValue("PENDING");
const mockIsFinal = jest.fn().mockReturnValue(false);

const mockNowPaymentsInstance = {
  createPayment: mockCreatePayment,
  verifyWebhookSignature: mockVerifySig,
  getPaymentStatus: mockGetStatus,
  getAvailableCurrencies: mockGetCurrencies,
  getEstimate: mockGetEstimate,
  getPaymentUrl: mockGetPaymentUrl,
  mapPaymentStatus: mockMapStatus,
  isFinalStatus: mockIsFinal,
};

let nowPaymentsEnabled = true;
jest.mock("../services/nowPaymentsService", () => ({
  getNowPaymentsService: jest.fn(() => nowPaymentsEnabled ? mockNowPaymentsInstance : null),
}));

jest.mock("../utils/walletValidation", () => ({
  validateCryptoAddress: jest.fn().mockReturnValue({ valid: true }),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import express from "express";
import request from "supertest";
import cryptoRouter from "../routes/crypto";
import { validateCryptoAddress } from "../utils/walletValidation";
import jwt from "jsonwebtoken";

// ── App factory ───────────────────────────────────────────────────────────────

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/crypto", cryptoRouter);
  return app;
}

/** Generate a valid JWT so the authenticate middleware passes */
function makeAuthHeader(userId = "user_abc", email = "test@example.com", role = "USER") {
  const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
  return "Bearer " + jwt.sign({ userId, email, role }, secret, { expiresIn: "1h" });
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  nowPaymentsEnabled = true;
  process.env.FRONTEND_URL = "http://localhost:3000";
  process.env.BACKEND_URL = "http://localhost:4000";
});

// ── POST /api/crypto/create-payment ──────────────────────────────────────────

describe("POST /api/crypto/create-payment", () => {
  it("returns 503 when NowPayments is not configured", async () => {
    nowPaymentsEnabled = false;
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/create-payment")
      .set("Authorization", makeAuthHeader())
      .send({ amount: 50, currency: "USD", payCurrency: "BTC" });
    expect(res.status).toBe(503);
  });

  it("returns 400 when required fields are missing", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/create-payment")
      .set("Authorization", makeAuthHeader())
      .send({ amount: 50 }); // missing currency and payCurrency
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/currency/i);
  });

  it("returns payment details on success", async () => {
    mockCreatePayment.mockResolvedValueOnce({
      payment_id: "pay_xyz",
      pay_address: "bc1qtest",
      pay_amount: 0.001,
      pay_currency: "BTC",
    });

    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/create-payment")
      .set("Authorization", makeAuthHeader())
      .send({ amount: 50, currency: "USD", payCurrency: "BTC", orderId: "ord_1" });

    expect(res.status).toBe(200);
    expect(res.body.paymentId).toBe("pay_xyz");
    expect(res.body.payAddress).toBe("bc1qtest");
    expect(res.body.payAmount).toBe(0.001);
    expect(mockCreatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        price_amount: 50,
        price_currency: "USD",
        pay_currency: "BTC",
        order_id: "ord_1",
        ipn_callback_url: "http://localhost:4000/api/crypto/webhook",
      })
    );
  });

  it("passes success/cancel URLs from FRONTEND_URL env var", async () => {
    mockCreatePayment.mockResolvedValueOnce({ payment_id: "p1", pay_address: "addr", pay_amount: 0.01, pay_currency: "ETH" });
    process.env.FRONTEND_URL = "https://myapp.com";

    const app = buildApp();
    await request(app)
      .post("/api/crypto/create-payment")
      .set("Authorization", makeAuthHeader())
      .send({ amount: 100, currency: "USD", payCurrency: "ETH" });

    expect(mockCreatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: "https://myapp.com/payment/success",
        cancel_url: "https://myapp.com/payment/cancel",
      })
    );
  });
});

// ── GET /api/crypto/currencies ────────────────────────────────────────────────

describe("GET /api/crypto/currencies", () => {
  it("returns 503 when service is not configured", async () => {
    nowPaymentsEnabled = false;
    const app = buildApp();
    const res = await request(app)
      .get("/api/crypto/currencies")
      .set("Authorization", makeAuthHeader());
    expect(res.status).toBe(503);
  });

  it("returns currencies array and count", async () => {
    mockGetCurrencies.mockResolvedValueOnce(["BTC", "ETH", "USDT"]);
    const app = buildApp();
    const res = await request(app)
      .get("/api/crypto/currencies")
      .set("Authorization", makeAuthHeader());
    expect(res.status).toBe(200);
    expect(res.body.currencies).toEqual(["BTC", "ETH", "USDT"]);
    expect(res.body.count).toBe(3);
  });
});

// ── POST /api/crypto/estimate ─────────────────────────────────────────────────

describe("POST /api/crypto/estimate", () => {
  it("returns 400 when required fields are missing", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/estimate")
      .set("Authorization", makeAuthHeader())
      .send({ fromCurrency: "USD" }); // missing toCurrency and amount
    expect(res.status).toBe(400);
  });

  it("proxies estimate from NowPayments service", async () => {
    mockGetEstimate.mockResolvedValueOnce({ estimated_amount: 0.002, currency_from: "usd", currency_to: "btc" });
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/estimate")
      .set("Authorization", makeAuthHeader())
      .send({ fromCurrency: "USD", toCurrency: "BTC", amount: 100 });
    expect(res.status).toBe(200);
    expect(res.body.estimated_amount).toBe(0.002);
  });
});

// ── POST /api/crypto/validate-address ────────────────────────────────────────

describe("POST /api/crypto/validate-address", () => {
  it("returns 400 when address or cryptoType is missing", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/validate-address")
      .set("Authorization", makeAuthHeader())
      .send({ address: "bc1qtest" }); // missing cryptoType
    expect(res.status).toBe(400);
  });

  it("returns valid=true for a valid address", async () => {
    (validateCryptoAddress as jest.Mock).mockReturnValueOnce({ valid: true });
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/validate-address")
      .set("Authorization", makeAuthHeader())
      .send({ address: "bc1qtest", cryptoType: "BTC" });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.address).toBe("bc1qtest");
    expect(res.body.cryptoType).toBe("BTC");
  });

  it("returns valid=false with error message for invalid address", async () => {
    (validateCryptoAddress as jest.Mock).mockReturnValueOnce({ valid: false, error: "Invalid BTC address" });
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/validate-address")
      .set("Authorization", makeAuthHeader())
      .send({ address: "bad_address", cryptoType: "BTC" });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(false);
    expect(res.body.error).toBe("Invalid BTC address");
  });
});

// ── POST /api/crypto/webhook ──────────────────────────────────────────────────

describe("POST /api/crypto/webhook", () => {
  it("returns 503 when service is not configured", async () => {
    nowPaymentsEnabled = false;
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/webhook")
      .send({ payment_status: "finished" });
    expect(res.status).toBe(503);
  });

  it("returns 401 when signature is invalid", async () => {
    mockVerifySig.mockReturnValueOnce(false);
    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/webhook")
      .set("x-nowpayments-sig", "bad_sig")
      .send({ payment_status: "finished", payment_id: "pay_1" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid signature/);
  });

  it("processes 'finished' status: credits wallet via $transaction", async () => {
    mockVerifySig.mockReturnValueOnce(true);

    const fakeWallet = { id: "wallet_1", balance: 100 };
    // $transaction invokes its callback
    mockPrismaTransaction.mockImplementationOnce(async (cb: any) => cb({
      wallet: {
        findFirst: jest.fn().mockResolvedValue(fakeWallet),
        update: jest.fn().mockResolvedValue({ balance: 150 }),
      },
      cryptoDeposit: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({ id: "deposit_1" }),
      },
      transaction: { create: jest.fn().mockResolvedValue({}) },
      notification: { create: jest.fn().mockResolvedValue({}) },
    }));

    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/webhook")
      .set("x-nowpayments-sig", "valid_sig")
      .send({
        payment_id: "pay_fin1",
        payment_status: "finished",
        pay_amount: "0.01",
        pay_currency: "BTC",
        price_amount: "50",
        price_currency: "USD",
        order_id: "user_abc",
        actually_paid: "0.01",
        outcome_amount: "50",
        outcome_currency: "USD",
        pay_address: "bc1qtest",
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(mockPrismaTransaction).toHaveBeenCalledTimes(1);
  });

  it("skips duplicate 'finished' webhook (idempotency)", async () => {
    mockVerifySig.mockReturnValueOnce(true);

    mockPrismaTransaction.mockImplementationOnce(async (cb: any) => cb({
      wallet: { findFirst: jest.fn().mockResolvedValue({ id: "w1" }), update: jest.fn() },
      cryptoDeposit: {
        findUnique: jest.fn().mockResolvedValue({ id: "dep_1", status: "CONFIRMED" }),
        upsert: jest.fn(),
      },
      transaction: { create: jest.fn() },
      notification: { create: jest.fn() },
    }));

    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/webhook")
      .set("x-nowpayments-sig", "valid_sig")
      .send({
        payment_id: "pay_dup1",
        payment_status: "finished",
        order_id: "user_abc",
        price_amount: "50",
        price_currency: "USD",
      });

    expect(res.status).toBe(200);
  });

  it("records 'failed' status in cryptoDeposit table", async () => {
    mockVerifySig.mockReturnValueOnce(true);
    mockWalletFindFirst.mockResolvedValueOnce({ id: "wallet_1" });
    mockCryptoDepositUpsert.mockResolvedValueOnce({});

    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/webhook")
      .set("x-nowpayments-sig", "valid_sig")
      .send({
        payment_id: "pay_fail1",
        payment_status: "failed",
        pay_amount: "0.01",
        pay_currency: "BTC",
        price_amount: "50",
        price_currency: "USD",
        order_id: "user_abc",
      });

    expect(res.status).toBe(200);
    expect(mockCryptoDepositUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { txHash: "pay_fail1" },
        update: expect.objectContaining({ status: "FAILED" }),
      })
    );
  });

  it("records 'expired' status the same as failed", async () => {
    mockVerifySig.mockReturnValueOnce(true);
    mockWalletFindFirst.mockResolvedValueOnce({ id: "wallet_1" });
    mockCryptoDepositUpsert.mockResolvedValueOnce({});

    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/webhook")
      .set("x-nowpayments-sig", "valid_sig")
      .send({
        payment_id: "pay_exp1",
        payment_status: "expired",
        pay_amount: "0",
        pay_currency: "ETH",
        price_amount: "100",
        price_currency: "USD",
        order_id: "user_abc",
      });

    expect(res.status).toBe(200);
    expect(mockCryptoDepositUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ status: "FAILED" }),
      })
    );
  });

  it("returns 200 for unhandled statuses (e.g., 'waiting')", async () => {
    mockVerifySig.mockReturnValueOnce(true);

    const app = buildApp();
    const res = await request(app)
      .post("/api/crypto/webhook")
      .set("x-nowpayments-sig", "valid_sig")
      .send({
        payment_id: "pay_wait1",
        payment_status: "waiting",
        order_id: "user_abc",
        price_amount: "50",
        price_currency: "USD",
      });

    expect(res.status).toBe(200);
  });
});
