// Rockefeller HELOC Account Dashboard Component
// Reference Number: 123456789-HELOC

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AccountBalance,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
  Add,
  History,
  Payment,
  Shield,
  Info,
  Refresh,
  Download
} from '@mui/icons-material';

interface HELOCAccount {
  id: string;
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  interestRate: number;
  monthlyPayment: number;
  nextPaymentDue: string;
  status: string;
  trustProtectionEnabled: boolean;
  drawPeriodEndDate: string;
  utilizationRate: number;
}

interface HELOCDraw {
  id: string;
  amount: number;
  purpose: string;
  description: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
}

interface HELOCRepayment {
  id: string;
  amount: number;
  type: string;
  paymentDate: string;
  method: string;
  trustCovered: boolean;
}

interface HELOCNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  createdAt: string;
}

interface HELOCAccountDashboardProps {
  accountId: string;
  onLogout?: () => void;
}

export const HELOCAccountDashboard: React.FC<HELOCAccountDashboardProps> = ({
  accountId,
  onLogout
}) => {
  const [account, setAccount] = useState<HELOCAccount | null>(null);
  const [recentDraws, setRecentDraws] = useState<HELOCDraw[]>([]);
  const [recentPayments, setRecentPayments] = useState<HELOCRepayment[]>([]);
  const [notifications, setNotifications] = useState<HELOCNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Draw request dialog state
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [drawAmount, setDrawAmount] = useState('');
  const [drawPurpose, setDrawPurpose] = useState('');
  const [drawDescription, setDrawDescription] = useState('');
  const [submittingDraw, setSubmittingDraw] = useState(false);

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadAccountData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock API calls - replace with actual API endpoints
      const accountResponse = await fetch(`/api/heloc/accounts/${accountId}`);
      const accountData = await accountResponse.json();
      
      const drawsResponse = await fetch(`/api/heloc/accounts/${accountId}/draws?limit=5`);
      const drawsData = await drawsResponse.json();
      
      const paymentsResponse = await fetch(`/api/heloc/accounts/${accountId}/payments?limit=5`);
      const paymentsData = await paymentsResponse.json();
      
      const notificationsResponse = await fetch(`/api/heloc/accounts/${accountId}/notifications?limit=5`);
      const notificationsData = await notificationsResponse.json();

      setAccount(accountData.data);
      setRecentDraws(drawsData.data || []);
      setRecentPayments(paymentsData.data || []);
      setNotifications(notificationsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, [accountId]);

  const handleDrawRequest = async () => {
    if (!account || !drawAmount || !drawPurpose) return;

    setSubmittingDraw(true);
    setError(null);

    try {
      const response = await fetch(`/api/heloc/accounts/${accountId}/draws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(drawAmount),
          purpose: drawPurpose,
          description: drawDescription
        })
      });

      if (response.ok) {
        setDrawDialogOpen(false);
        setDrawAmount('');
        setDrawPurpose('');
        setDrawDescription('');
        await loadAccountData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Draw request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draw request failed');
    } finally {
      setSubmittingDraw(false);
    }
  };

  const handlePayment = async () => {
    if (!account || !paymentAmount) return;

    setSubmittingPayment(true);
    setError(null);

    try {
      const response = await fetch(`/api/heloc/accounts/${accountId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          type: 'REGULAR',
          method: 'BANK_TRANSFER'
        })
      });

      if (response.ok) {
        setPaymentDialogOpen(false);
        setPaymentAmount('');
        await loadAccountData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate < 30) return 'success';
    if (rate < 50) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'SUSPENDED': return 'warning';
      case 'CLOSED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Warning sx={{ mr: 1 }} />
          {error}
        </Alert>
        <Button onClick={loadAccountData} startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!account) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Account not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Rockefeller HELOC Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Reference Number: 123456789-HELOC | Account ID: {accountId}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Warning sx={{ mr: 1 }} />
          {error}
        </Alert>
      )}

      {/* Account Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Credit Limit</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                ${account.creditLimit.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Available Credit</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ${account.availableCredit.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Outstanding Balance</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                ${account.outstandingBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Payment sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Monthly Payment</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                ${account.monthlyPayment.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Due: {new Date(account.nextPaymentDue).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Credit Utilization and Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Credit Utilization
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {account.utilizationRate.toFixed(1)}% of credit limit used
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={account.utilizationRate}
                  color={getUtilizationColor(account.utilizationRate) as any}
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setDrawDialogOpen(true)}
                  disabled={account.availableCredit < 25000}
                >
                  Request Draw
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Payment />}
                  onClick={() => setPaymentDialogOpen(true)}
                  disabled={account.outstandingBalance === 0}
                >
                  Make Payment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<History />}
                  onClick={() => window.open(`/heloc/accounts/${accountId}/history`, '_blank')}
                >
                  Full History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={account.status}
                  color={getStatusColor(account.status) as any}
                  sx={{ mr: 1 }}
                />
                {account.trustProtectionEnabled && (
                  <Tooltip title="Trust Protection Enabled">
                    <Shield color="primary" />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Interest Rate: {account.interestRate.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Draw Period Ends: {new Date(account.drawPeriodEndDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Draws
              </Typography>
              {recentDraws.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent draws
                </Typography>
              ) : (
                <List>
                  {recentDraws.map((draw) => (
                    <ListItem key={draw.id} divider>
                      <ListItemIcon>
                        <AttachMoney color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`$${draw.amount.toLocaleString()} - ${draw.purpose.replace('_', ' ')}`}
                        secondary={`${draw.status} • ${new Date(draw.requestedAt).toLocaleDateString()}`}
                      />
                      <Chip
                        label={draw.status}
                        size="small"
                        color={draw.status === 'PROCESSED' ? 'success' : 'warning'}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Payments
              </Typography>
              {recentPayments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent payments
                </Typography>
              ) : (
                <List>
                  {recentPayments.map((payment) => (
                    <ListItem key={payment.id} divider>
                      <ListItemIcon>
                        <Payment color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`$${payment.amount.toLocaleString()} - ${payment.type.replace('_', ' ')}`}
                        secondary={`${payment.method} • ${new Date(payment.paymentDate).toLocaleDateString()}`}
                      />
                      {payment.trustCovered && (
                        <Tooltip title="Trust Payment">
                          <Shield color="primary" fontSize="small" />
                        </Tooltip>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <List>
              {notifications.map((notification) => (
                <ListItem key={notification.id} divider>
                  <ListItemIcon>
                    <Info color={notification.priority === 'HIGH' ? 'error' : 'info'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                  />
                  <Chip
                    label={notification.priority}
                    size="small"
                    color={notification.priority === 'HIGH' ? 'error' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Draw Request Dialog */}
      <Dialog open={drawDialogOpen} onClose={() => setDrawDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request HELOC Draw</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Draw Amount"
              type="number"
              value={drawAmount}
              onChange={(e) => setDrawAmount(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: '$',
                inputProps: { min: 25000, max: account.availableCredit, step: 1000 }
              }}
              helperText={`Available: $${account.availableCredit.toLocaleString()}`}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Label>Purpose</Label>
              <Select
                value={drawPurpose}
                onChange={(e) => setDrawPurpose(e.target.value)}
              >
                <MenuItem value="EMERGENCY">Emergency</MenuItem>
                <MenuItem value="MEDICAL">Medical</MenuItem>
                <MenuItem value="HOME_IMPROVEMENT">Home Improvement</MenuItem>
                <MenuItem value="EDUCATION">Education</MenuItem>
                <MenuItem value="DEBT_CONSOLIDATION">Debt Consolidation</MenuItem>
                <MenuItem value="INVESTMENT">Investment</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={drawDescription}
              onChange={(e) => setDrawDescription(e.target.value)}
              placeholder="Please describe the purpose of this draw..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrawDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDrawRequest}
            variant="contained"
            disabled={submittingDraw || !drawAmount || !drawPurpose}
          >
            {submittingDraw ? <CircularProgress size={20} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: '$',
                inputProps: { min: 1, max: account.outstandingBalance, step: 50 }
              }}
              helperText={`Outstanding Balance: $${account.outstandingBalance.toLocaleString()}`}
            />
            <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
              <Typography variant="body2" color="info.dark">
                <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Regular monthly payment: ${account.monthlyPayment.toLocaleString()}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={submittingPayment || !paymentAmount}
          >
            {submittingPayment ? <CircularProgress size={20} /> : 'Process Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HELOCAccountDashboard;
