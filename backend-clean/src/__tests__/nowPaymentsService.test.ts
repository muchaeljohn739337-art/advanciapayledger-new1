// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('axios');

// ── Imports ───────────────────────────────────────────────────────────────────

import axios from 'axios';
import crypto from 'crypto';
import { NowPaymentsService } from '../services/nowPaymentsService';

const axiosMock = axios as jest.Mocked<typeof axios>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const TEST_API_KEY   = 'test_api_key_12345';
const TEST_IPN_SECRET = 'test_ipn_secret_abc';

function makeService() {
  process.env.NOWPAYMENTS_API_KEY   = TEST_API_KEY;
  process.env.NOWPAYMENTS_IPN_SECRET = TEST_IPN_SECRET;
  return new NowPaymentsService();
}

function buildValidSignature(payload: string, secret: string) {
  return crypto.createHmac('sha512', secret).update(payload, 'utf8').digest('hex');
}

// ── constructor ───────────────────────────────────────────────────────────────

describe('NowPaymentsService constructor', () => {
  it('throws when API key is missing', () => {
    delete process.env.NOWPAYMENTS_API_KEY;
    process.env.NOWPAYMENTS_IPN_SECRET = TEST_IPN_SECRET;
    expect(() => new NowPaymentsService()).toThrow(/required/i);
    process.env.NOWPAYMENTS_API_KEY = TEST_API_KEY;
  });

  it('throws when IPN secret is missing', () => {
    process.env.NOWPAYMENTS_API_KEY = TEST_API_KEY;
    delete process.env.NOWPAYMENTS_IPN_SECRET;
    expect(() => new NowPaymentsService()).toThrow(/required/i);
    process.env.NOWPAYMENTS_IPN_SECRET = TEST_IPN_SECRET;
  });

  it('constructs successfully with both env vars set', () => {
    expect(() => makeService()).not.toThrow();
  });
});

// ── createPayment ─────────────────────────────────────────────────────────────

describe('createPayment', () => {
  let service: NowPaymentsService;

  beforeEach(() => {
    service = makeService();
    jest.clearAllMocks();
  });

  const params = {
    price_amount: 100,
    price_currency: 'USD',
    pay_currency: 'BTC',
    order_id: 'order_123',
    order_description: 'Test payment',
    ipn_callback_url: 'https://api.example.com/webhook',
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
  };

  it('calls the NOWPayments API with correct headers', async () => {
    (axiosMock.post as jest.Mock).mockResolvedValueOnce({
      data: { payment_id: 'pay_abc', pay_address: '1BTC...', pay_amount: 0.002 },
    });

    const result = await service.createPayment(params);

    expect(axiosMock.post).toHaveBeenCalledWith(
      'https://api.nowpayments.io/v1/payment',
      params,
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-api-key': TEST_API_KEY }),
      })
    );
    expect(result.payment_id).toBe('pay_abc');
  });

  it('throws a user-friendly error on 429', async () => {
    const err: any = new Error('Rate limit');
    err.response = { status: 429, data: {} };
    (axiosMock.post as jest.Mock).mockRejectedValueOnce(err);
    await expect(service.createPayment(params)).rejects.toThrow(/rate limit/i);
  });

  it('throws a user-friendly error on 500+', async () => {
    const err: any = new Error('Server error');
    err.response = { status: 503, data: {} };
    (axiosMock.post as jest.Mock).mockRejectedValueOnce(err);
    await expect(service.createPayment(params)).rejects.toThrow(/unavailable/i);
  });
});

// ── verifyWebhookSignature ────────────────────────────────────────────────────

describe('verifyWebhookSignature', () => {
  let service: NowPaymentsService;
  beforeEach(() => { service = makeService(); });

  it('returns false for empty payload', () => {
    expect(service.verifyWebhookSignature('', 'sig')).toBe(false);
  });

  it('returns false for empty signature', () => {
    expect(service.verifyWebhookSignature('{"id":1}', '')).toBe(false);
  });

  it('returns false for wrong signature', () => {
    const payload = JSON.stringify({ payment_id: 'pay_1', status: 'finished' });
    const badSig = 'a'.repeat(128); // wrong hex
    expect(service.verifyWebhookSignature(payload, badSig)).toBe(false);
  });

  it('returns true for a correctly signed payload', () => {
    const payload = JSON.stringify({ payment_id: 'pay_1', payment_status: 'finished' });
    const validSig = buildValidSignature(payload, TEST_IPN_SECRET);
    expect(service.verifyWebhookSignature(payload, validSig)).toBe(true);
  });

  it('returns false when payload is tampered', () => {
    const payload = JSON.stringify({ payment_id: 'pay_1', payment_status: 'finished' });
    const validSig = buildValidSignature(payload, TEST_IPN_SECRET);
    const tamperedPayload = JSON.stringify({ payment_id: 'pay_1', payment_status: 'failed' });
    expect(service.verifyWebhookSignature(tamperedPayload, validSig)).toBe(false);
  });
});

// ── getPaymentStatus ──────────────────────────────────────────────────────────

describe('getPaymentStatus', () => {
  let service: NowPaymentsService;
  beforeEach(() => { service = makeService(); jest.clearAllMocks(); });

  it('returns payment status data from API', async () => {
    const mockStatus = {
      payment_id: 'pay_123',
      payment_status: 'finished',
      pay_address: '1BTCabc',
      pay_amount: 0.002,
      pay_currency: 'BTC',
      price_amount: 100,
      price_currency: 'USD',
    };
    (axiosMock.get as jest.Mock).mockResolvedValueOnce({ data: mockStatus });

    const result = await service.getPaymentStatus('pay_123');
    expect(result).toEqual(mockStatus);
    expect(axiosMock.get).toHaveBeenCalledWith(
      'https://api.nowpayments.io/v1/payment/pay_123',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-api-key': TEST_API_KEY }),
      })
    );
  });

  it('throws on API error', async () => {
    const err: any = new Error('Not found');
    err.response = { status: 404, data: { message: 'Payment not found' } };
    (axiosMock.get as jest.Mock).mockRejectedValueOnce(err);
    await expect(service.getPaymentStatus('bad_id')).rejects.toThrow(/Payment not found/i);
  });
});

// ── getAvailableCurrencies ────────────────────────────────────────────────────

describe('getAvailableCurrencies', () => {
  let service: NowPaymentsService;
  beforeEach(() => { service = makeService(); jest.clearAllMocks(); });

  it('returns the currencies array from the API', async () => {
    (axiosMock.get as jest.Mock).mockResolvedValueOnce({
      data: { currencies: ['BTC', 'ETH', 'USDC'] },
    });
    const result = await service.getAvailableCurrencies();
    expect(result).toEqual(['BTC', 'ETH', 'USDC']);
  });
});

// ── getEstimate ───────────────────────────────────────────────────────────────

describe('getEstimate', () => {
  let service: NowPaymentsService;
  beforeEach(() => { service = makeService(); jest.clearAllMocks(); });

  it('calls estimate endpoint with lowercased currencies', async () => {
    const estimateData = { estimated_amount: 0.0025, currency_from: 'usd', currency_to: 'btc' };
    (axiosMock.get as jest.Mock).mockResolvedValueOnce({ data: estimateData });

    const result = await service.getEstimate('USD', 'BTC', 100);
    expect(result).toEqual(estimateData);
    expect(axiosMock.get).toHaveBeenCalledWith(
      'https://api.nowpayments.io/v1/estimate',
      expect.objectContaining({
        params: { amount: 100, currency_from: 'usd', currency_to: 'btc' },
      })
    );
  });
});

// ── mapPaymentStatus ──────────────────────────────────────────────────────────

describe('mapPaymentStatus', () => {
  let service: NowPaymentsService;
  beforeEach(() => { service = makeService(); });

  const cases: [string, string][] = [
    ['waiting',       'pending'],
    ['confirming',    'confirming'],
    ['confirmed',     'confirmed'],
    ['sending',       'processing'],
    ['partially_paid','partial'],
    ['finished',      'completed'],
    ['failed',        'failed'],
    ['refunded',      'refunded'],
    ['expired',       'expired'],
    ['unknown_status','unknown'],
  ];

  test.each(cases)('%s → %s', (raw, expected) => {
    expect(service.mapPaymentStatus(raw)).toBe(expected);
  });
});

// ── isFinalStatus ─────────────────────────────────────────────────────────────

describe('isFinalStatus', () => {
  let service: NowPaymentsService;
  beforeEach(() => { service = makeService(); });

  it.each(['finished', 'failed', 'refunded', 'expired'])(
    'considers "%s" as final',
    (status) => expect(service.isFinalStatus(status)).toBe(true)
  );

  it.each(['waiting', 'confirming', 'confirmed', 'sending', 'partially_paid'])(
    'does not consider "%s" as final',
    (status) => expect(service.isFinalStatus(status)).toBe(false)
  );
});

// ── getPaymentUrl ─────────────────────────────────────────────────────────────

describe('getPaymentUrl', () => {
  it('returns the correct NOWPayments hosted checkout URL', () => {
    const service = makeService();
    const url = service.getPaymentUrl('pay_xyz');
    expect(url).toBe('https://nowpayments.io/payment/?iid=pay_xyz');
  });
});
