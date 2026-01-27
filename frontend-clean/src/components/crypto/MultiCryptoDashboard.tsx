'use client';

import { useState, useEffect } from 'react';
import { 
  Bitcoin, 
  TrendingUp, 
  ArrowDownUp, 
  Wallet, 
  Activity,
  DollarSign,
  Zap,
  Shield,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';

interface CryptoCurrency {
  symbol: string;
  name: string;
  network: string;
  decimals: number;
  contractAddress?: string;
  enabled: boolean;
  fees: {
    deposit: number;
    withdraw: number;
    exchange: number;
  };
  limits: {
    minDeposit: number;
    maxDeposit: number;
    minWithdraw: number;
    maxWithdraw: number;
  };
}

interface CryptoTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'exchange' | 'payment';
  currency: string;
  amount: number;
  network: string;
  address?: string;
  txHash?: string;
  confirmations: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  fee: number;
  netAmount: number;
  timestamp: Date;
  metadata: any;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
  source: string;
}

export function MultiCryptoDashboard() {
  const [currencies, setCurrencies] = useState<CryptoCurrency[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'exchange' | 'transactions'>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [exchangeFrom, setExchangeFrom] = useState('BTC');
  const [exchangeTo, setExchangeTo] = useState('USDT');
  const [exchangeAmount, setExchangeAmount] = useState('');

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      
      // Fetch currencies
      const currenciesResponse = await fetch('/api/crypto/currencies');
      const currenciesData = await currenciesResponse.json();
      if (currenciesData.success) {
        setCurrencies(currenciesData.currencies);
      }
      
      // Fetch exchange rates
      const ratesResponse = await fetch('/api/crypto/exchange-rates');
      const ratesData = await ratesResponse.json();
      if (ratesData.success) {
        setExchangeRates(ratesData.rates);
      }
      
      // Fetch user transactions
      const transactionsResponse = await fetch('/api/crypto/transactions/user123');
      const transactionsData = await transactionsResponse.json();
      if (transactionsData.success) {
        setTransactions(transactionsData.transactions);
      }
      
      // Fetch user balances
      const balancesResponse = await fetch('/api/crypto/balances/user123');
      const balancesData = await balancesResponse.json();
      if (balancesData.success) {
        setBalances(balancesData.balances);
      }
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    try {
      const response = await fetch('/api/crypto/deposit/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'user123',
          currency: selectedCurrency,
          amount: parseFloat(depositAmount)
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Deposit initiated successfully!');
        setDepositAmount('');
        fetchCryptoData();
      } else {
        alert('Failed to initiate deposit: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to initiate deposit:', error);
      alert('Failed to initiate deposit');
    }
  };

  const handleWithdrawal = async () => {
    try {
      const response = await fetch('/api/crypto/withdrawal/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'user123',
          currency: selectedCurrency,
          amount: parseFloat(withdrawAmount),
          address: withdrawAddress
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Withdrawal initiated successfully!');
        setWithdrawAmount('');
        setWithdrawAddress('');
        fetchCryptoData();
      } else {
        alert('Failed to initiate withdrawal: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to initiate withdrawal:', error);
      alert('Failed to initiate withdrawal');
    }
  };

  const handleExchange = async () => {
    try {
      const response = await fetch('/api/crypto/exchange/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'user123',
          fromCurrency: exchangeFrom,
          toCurrency: exchangeTo,
          amount: parseFloat(exchangeAmount)
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Exchange initiated successfully!');
        setExchangeAmount('');
        fetchCryptoData();
      } else {
        alert('Failed to initiate exchange: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to initiate exchange:', error);
      alert('Failed to initiate exchange');
    }
  };

  const getExchangeRate = (from: string, to: string): number => {
    const rate = exchangeRates.find(r => r.from === from && r.to === to);
    return rate ? rate.rate : 0;
  };

  const getCurrencyInfo = (symbol: string): CryptoCurrency | undefined => {
    return currencies.find(c => c.symbol === symbol);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAmount = (amount: number, decimals: number = 8): string => {
    return amount.toFixed(decimals);
  };

  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Crypto Payment Center</h1>
        <p className="text-gray-600">Manage your cryptocurrency portfolio with advanced features</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Bitcoin className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Total Balance</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatUSD(Object.values(balances).reduce((sum, balance) => sum + balance, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">24h Change</h3>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Transactions</h3>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Zap className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Active Currencies</h3>
              <p className="text-2xl font-bold text-gray-900">{currencies.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'deposit', label: 'Deposit', icon: ArrowDownUp },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowDownUp },
            { id: 'exchange', label: 'Exchange', icon: TrendingUp },
            { id: 'transactions', label: 'Transactions', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balances */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Your Balances</h3>
            <div className="space-y-3">
              {Object.entries(balances).map(([currency, balance]) => {
                const currencyInfo = getCurrencyInfo(currency);
                const rate = getExchangeRate(currency, 'USDT');
                const usdValue = balance * rate;
                
                return (
                  <div key={currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-blue-600">{currency.substring(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{currency}</p>
                        <p className="text-sm text-gray-600">{currencyInfo?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatAmount(balance, currencyInfo?.decimals || 8)}</p>
                      <p className="text-sm text-gray-600">{formatUSD(usdValue)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      transaction.status === 'completed' ? 'bg-green-500' :
                      transaction.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-gray-600">{transaction.currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAmount(transaction.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deposit' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Deposit Cryptocurrency</h3>
            
            <div className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.symbol} value={currency.symbol}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  step="any"
                />
              </div>

              {/* Deposit Info */}
              {getCurrencyInfo(selectedCurrency) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Deposit Information</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>Network: {getCurrencyInfo(selectedCurrency)?.network}</p>
                    <p>Minimum Deposit: {getCurrencyInfo(selectedCurrency)?.limits.minDeposit} {selectedCurrency}</p>
                    <p>Deposit Fee: {getCurrencyInfo(selectedCurrency)?.fees.deposit} {selectedCurrency}</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleDeposit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Initiate Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Withdraw Cryptocurrency</h3>
            
            <div className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.symbol} value={currency.symbol}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  step="any"
                />
              </div>

              {/* Withdrawal Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Address</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter withdrawal address"
                />
              </div>

              {/* Withdrawal Info */}
              {getCurrencyInfo(selectedCurrency) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Withdrawal Information</h4>
                  <div className="space-y-2 text-sm text-yellow-800">
                    <p>Network: {getCurrencyInfo(selectedCurrency)?.network}</p>
                    <p>Minimum Withdrawal: {getCurrencyInfo(selectedCurrency)?.limits.minWithdraw} {selectedCurrency}</p>
                    <p>Withdrawal Fee: {getCurrencyInfo(selectedCurrency)?.fees.withdraw} {selectedCurrency}</p>
                    <p className="text-red-600 font-medium">⚠️ Double-check the address before withdrawal</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleWithdrawal}
                disabled={!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0}
                className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Initiate Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exchange' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Exchange Cryptocurrency</h3>
            
            <div className="space-y-6">
              {/* From Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <select
                  value={exchangeFrom}
                  onChange={(e) => setExchangeFrom(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.symbol} value={currency.symbol}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  step="any"
                />
              </div>

              {/* Exchange Rate Display */}
              {exchangeAmount && getExchangeRate(exchangeFrom, exchangeTo) > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Exchange Rate</p>
                      <p className="font-medium">1 {exchangeFrom} = {getExchangeRate(exchangeFrom, exchangeTo)} {exchangeTo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">You'll receive</p>
                      <p className="font-medium">
                        {(parseFloat(exchangeAmount) * getExchangeRate(exchangeFrom, exchangeTo)).toFixed(6)} {exchangeTo}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* To Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <select
                  value={exchangeTo}
                  onChange={(e) => setExchangeTo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.symbol} value={currency.symbol}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exchange Info */}
              {getCurrencyInfo(exchangeFrom) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Exchange Information</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>Exchange Fee: {getCurrencyInfo(exchangeFrom)?.fees.exchange}%</p>
                    <p>Processing Time: ~5-10 minutes</p>
                    <p>Available 24/7</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleExchange}
                disabled={!exchangeAmount || parseFloat(exchangeAmount) <= 0 || getExchangeRate(exchangeFrom, exchangeTo) === 0}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Exchange Now
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Transaction History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize">{transaction.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-bold text-blue-600">{transaction.currency.substring(0, 2)}</span>
                        </div>
                        {transaction.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatAmount(transaction.fee)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.txHash && (
                        <button
                          onClick={() => copyToClipboard(transaction.txHash!)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      {transaction.txHash && (
                        <button className="text-blue-600 hover:text-blue-900">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
