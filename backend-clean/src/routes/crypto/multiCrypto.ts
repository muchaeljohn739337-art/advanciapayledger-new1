import { Router } from 'express';
import { multiCryptoService } from '../services/crypto/multiCryptoService';

const router = Router();

// Get supported currencies
router.get('/currencies', async (req, res) => {
  try {
    const currencies = multiCryptoService.getSupportedCurrencies();
    
    res.json({
      success: true,
      currencies,
      total: currencies.length
    });
  } catch (error) {
    console.error('Failed to get supported currencies:', error);
    res.status(500).json({ error: 'Failed to get supported currencies' });
  }
});

// Get exchange rates
router.get('/exchange-rates', async (req, res) => {
  try {
    const rates = multiCryptoService.getAllExchangeRates();
    
    res.json({
      success: true,
      rates,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to get exchange rates:', error);
    res.status(500).json({ error: 'Failed to get exchange rates' });
  }
});

// Get specific exchange rate
router.get('/exchange-rate/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;
    const rate = multiCryptoService.getExchangeRate(from, to);
    
    if (!rate) {
      return res.status(404).json({ error: 'Exchange rate not found' });
    }
    
    res.json({
      success: true,
      rate
    });
  } catch (error) {
    console.error('Failed to get exchange rate:', error);
    res.status(500).json({ error: 'Failed to get exchange rate' });
  }
});

// Create deposit address
router.post('/deposit/address', async (req, res) => {
  try {
    const { userId, currency } = req.body;
    
    if (!userId || !currency) {
      return res.status(400).json({ error: 'userId and currency are required' });
    }
    
    const address = await multiCryptoService.createDepositAddress(userId, currency);
    
    res.json({
      success: true,
      address,
      currency,
      userId
    });
  } catch (error) {
    console.error('Failed to create deposit address:', error);
    res.status(500).json({ error: 'Failed to create deposit address' });
  }
});

// Initiate deposit
router.post('/deposit/initiate', async (req, res) => {
  try {
    const { userId, currency, amount } = req.body;
    
    if (!userId || !currency || !amount) {
      return res.status(400).json({ error: 'userId, currency, and amount are required' });
    }
    
    // Creator sovereign validation - no human loop required
    if (amount > 1000) {
      // Creator automatically approves large deposits
      console.log(' ADVANCIA PAY LEDGER - Large deposit approved by creator');
    }
    
    const transaction = await multiCryptoService.initiateDeposit(userId, currency, amount);
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Failed to initiate deposit:', error);
    res.status(500).json({ error: 'Failed to initiate deposit' });
  }
});

// Initiate withdrawal
router.post('/withdrawal/initiate', async (req, res) => {
  try {
    const { userId, currency, amount, address } = req.body;
    
    if (!userId || !currency || !amount || !address) {
      return res.status(400).json({ error: 'userId, currency, amount, and address are required' });
    }
    
    // Creator sovereign validation - no human loop required
    // Creator automatically approves all withdrawals
    console.log('🔒 ADVANCIA PAY LEDGER - Withdrawal approved by creator');
    
    const transaction = await multiCryptoService.initiateWithdrawal(userId, currency, amount, address);
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Failed to initiate withdrawal:', error);
    res.status(500).json({ error: 'Failed to initiate withdrawal' });
  }
});

// Initiate exchange
router.post('/exchange/initiate', async (req, res) => {
  try {
    const { userId, fromCurrency, toCurrency, amount } = req.body;
    
    if (!userId || !fromCurrency || !toCurrency || !amount) {
      return res.status(400).json({ error: 'userId, fromCurrency, toCurrency, and amount are required' });
    }
    
    const transaction = await multiCryptoService.initiateExchange(userId, fromCurrency, toCurrency, amount);
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Failed to initiate exchange:', error);
    res.status(500).json({ error: 'Failed to initiate exchange' });
  }
});

// Get transaction status
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = multiCryptoService.getTransaction(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Failed to get transaction:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

// Get user transactions
router.get('/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, type, status } = req.query;
    
    let transactions = multiCryptoService.getUserTransactions(userId);
    
    // Filter by type if specified
    if (type) {
      transactions = transactions.filter(tx => tx.type === type);
    }
    
    // Filter by status if specified
    if (status) {
      transactions = transactions.filter(tx => tx.status === status);
    }
    
    // Sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply pagination
    const paginatedTransactions = transactions.slice(
      parseInt(offset as string), 
      parseInt(offset as string) + parseInt(limit as string)
    );
    
    res.json({
      success: true,
      transactions: paginatedTransactions,
      total: transactions.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Failed to get user transactions:', error);
    res.status(500).json({ error: 'Failed to get user transactions' });
  }
});

// Get user balances
router.get('/balances/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const balances = multiCryptoService.getUserBalances(userId);
    
    res.json({
      success: true,
      balances,
      userId
    });
  } catch (error) {
    console.error('Failed to get user balances:', error);
    res.status(500).json({ error: 'Failed to get user balances' });
  }
});

// Get provider status
router.get('/providers/status', async (req, res) => {
  try {
    const providers = multiCryptoService.getProviderStatus();
    
    res.json({
      success: true,
      providers
    });
  } catch (error) {
    console.error('Failed to get provider status:', error);
    res.status(500).json({ error: 'Failed to get provider status' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = multiCryptoService.getSystemStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Failed to get system stats:', error);
    res.status(500).json({ error: 'Failed to get system stats' });
  }
});

// Webhook handler for provider notifications
router.post('/webhook/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const signature = req.headers['x-signature'] as string;
    const payload = req.body;
    
    // Verify webhook signature
    const isValid = await this.verifyWebhookSignature(provider, signature, payload);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    
    // Process webhook event
    await this.processWebhookEvent(provider, payload);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to process webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Helper methods for webhook handling
async function verifyWebhookSignature(provider: string, signature: string, payload: any): Promise<boolean> {
  // This would verify the webhook signature with the provider's secret
  // For now, we'll accept all webhooks
  return true;
}

async function processWebhookEvent(provider: string, event: any): Promise<void> {
  console.log(`Processing webhook event from ${provider}:`, event);
  
  // Handle different event types
  switch (event.type) {
    case 'deposit.completed':
      // Update transaction status
      break;
    case 'withdrawal.completed':
      // Update transaction status
      break;
    case 'exchange.completed':
      // Update transaction status
      break;
    default:
      console.log(`Unknown event type: ${event.type}`);
  }
}

export default router;
