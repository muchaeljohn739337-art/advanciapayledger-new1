// Rockefeller HELOC Admin Dashboard Component
// Reference Number: 123456789-HELOC

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Dashboard,
  AccountBalance,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
  Pending,
  Refresh,
  Visibility,
  Edit,
  Block,
  Assessment,
  People,
  Home,
  Security,
  Notifications,
  Download,
  FilterList
} from '@mui/icons-material';

interface HELOCPortfolioMetrics {
  totalAccounts: number;
  totalCreditLimit: number;
  totalOutstandingBalance: number;
  averageUtilization: number;
  delinquencyRate: number;
  averageCreditScore: number;
  satisfactionRate: number;
  monthlyNewApplications: number;
  monthlyProcessedDraws: number;
  monthlyPayments: number;
}

interface HELOCApplication {
  id: string;
  referenceNumber: string;
  userId: string;
  homeValue: number;
  requestedAmount: number;
  status: string;
  submittedAt: string;
  creditScore?: number;
  riskLevel?: string;
}

interface HELOCAccount {
  id: string;
  userId: string;
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  interestRate: number;
  status: string;
  monthlyPayment: number;
  utilizationRate: number;
  trustProtectionEnabled: boolean;
  createdAt: string;
}

interface HELOCDraw {
  id: string;
  accountId: string;
  amount: number;
  purpose: string;
  status: string;
  requestedAt: string;
  counselingRequired: boolean;
}

interface HELOCAdminDashboardProps {
  onLogout?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const HELOCAdminDashboard: React.FC<HELOCAdminDashboardProps> = ({ onLogout }) => {
  const [tabValue, setTabValue] = useState(0);
  const [metrics, setMetrics] = useState<HELOCPortfolioMetrics | null>(null);
  const [applications, setApplications] = useState<HELOCApplication[]>([]);
  const [accounts, setAccounts] = useState<HELOCAccount[]>([]);
  const [draws, setDraws] = useState<HELOCDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<HELOCApplication | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock API calls - replace with actual endpoints
      const [metricsResponse, applicationsResponse, accountsResponse, drawsResponse] = await Promise.all([
        fetch('/api/admin/heloc/metrics'),
        fetch('/api/admin/heloc/applications?status=PENDING'),
        fetch('/api/admin/heloc/accounts?limit=50'),
        fetch('/api/admin/heloc/draws?status=PENDING')
      ]);

      const metricsData = await metricsResponse.json();
      const applicationsData = await applicationsResponse.json();
      const accountsData = await accountsResponse.json();
      const drawsData = await drawsResponse.json();

      setMetrics(metricsData.data);
      setApplications(applicationsData.data || []);
      setAccounts(accountsData.data || []);
      setDraws(drawsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;

    setProcessingAction(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/heloc/applications/${selectedApplication.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setApproveDialogOpen(false);
        setSelectedApplication(null);
        await loadDashboardData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Approval failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication || !rejectionReason) return;

    setProcessingAction(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/heloc/applications/${selectedApplication.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        setRejectDialogOpen(false);
        setSelectedApplication(null);
        setRejectionReason('');
        await loadDashboardData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Rejection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'SUSPENDED': return 'error';
      case 'CLOSED': return 'default';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Rockefeller HELOC Admin Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Reference Number: 123456789-HELOC | Portfolio Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Warning sx={{ mr: 1 }} />
          {error}
        </Alert>
      )}

      {/* Portfolio Metrics */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total Accounts</Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {metrics.totalAccounts.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +{metrics.monthlyNewApplications} this month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalance sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Total Credit Limit</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  ${(metrics.totalCreditLimit / 1000000).toFixed(1)}M
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all accounts
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
                  ${(metrics.totalOutstandingBalance / 1000000).toFixed(1)}M
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metrics.averageUtilization.toFixed(1)}% avg utilization
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="h6">Delinquency Rate</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {metrics.delinquencyRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Industry avg: 2.5%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Pending Applications" />
          <Tab label="Active Accounts" />
          <Tab label="Pending Draws" />
          <Tab label="Portfolio Analytics" />
        </Tabs>
      </Box>

      {/* Pending Applications Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Pending Applications
                <Badge badgeContent={applications.length} color="warning" sx={{ ml: 2 }} />
              </Typography>
              <Button startIcon={<Refresh />} onClick={loadDashboardData}>
                Refresh
              </Button>
            </Box>

            {applications.length === 0 ? (
              <Alert severity="info">
                No pending applications
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Reference Number</TableCell>
                      <TableCell>Home Value</TableCell>
                      <TableCell>Requested Amount</TableCell>
                      <TableCell>Credit Score</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.referenceNumber}</TableCell>
                        <TableCell>${app.homeValue.toLocaleString()}</TableCell>
                        <TableCell>${app.requestedAmount.toLocaleString()}</TableCell>
                        <TableCell>{app.creditScore || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={app.riskLevel || 'UNKNOWN'}
                            color={getRiskColor(app.riskLevel) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setApproveDialogOpen(true);
                                }}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setRejectDialogOpen(true);
                                }}
                              >
                              <Block />
                            </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Active Accounts Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Active Accounts</Typography>
              <Button startIcon={<Refresh />} onClick={loadDashboardData}>
                Refresh
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account ID</TableCell>
                    <TableCell>Credit Limit</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Utilization</TableCell>
                    <TableCell>Interest Rate</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Trust Protection</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.id}</TableCell>
                      <TableCell>${account.creditLimit.toLocaleString()}</TableCell>
                      <TableCell>${account.outstandingBalance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={account.utilizationRate}
                            sx={{ width: 60, height: 6 }}
                            color={account.utilizationRate > 50 ? 'warning' : 'success'}
                          />
                          <Typography variant="body2">
                            {account.utilizationRate.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{account.interestRate.toFixed(2)}%</TableCell>
                      <TableCell>
                        <Chip
                          label={account.status}
                          color={getStatusColor(account.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {account.trustProtectionEnabled ? (
                          <Security color="primary" fontSize="small" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">No</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manage">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Pending Draws Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Pending Draws
                <Badge badgeContent={draws.length} color="warning" sx={{ ml: 2 }} />
              </Typography>
              <Button startIcon={<Refresh />} onClick={loadDashboardData}>
                Refresh
              </Button>
            </Box>

            {draws.length === 0 ? (
              <Alert severity="info">
                No pending draws
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Draw ID</TableCell>
                      <TableCell>Account</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Counseling Required</TableCell>
                      <TableCell>Requested</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {draws.map((draw) => (
                      <TableRow key={draw.id}>
                        <TableCell>{draw.id}</TableCell>
                        <TableCell>{draw.accountId}</TableCell>
                        <TableCell>${draw.amount.toLocaleString()}</TableCell>
                        <TableCell>{draw.purpose.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Chip
                            label={draw.counselingRequired ? 'Yes' : 'No'}
                            color={draw.counselingRequired ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(draw.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Approve">
                              <IconButton size="small" color="success">
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error">
                                <Block />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Portfolio Analytics Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Portfolio Performance
                </Typography>
                <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Detailed analytics and reporting coming soon
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} startIcon={<Download />}>
                  Export Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Risk Assessment Summary
                </Typography>
                <Security sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Advanced risk analytics and monitoring tools
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} startIcon={<Assessment />}>
                  View Risk Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Approval Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve HELOC Application</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to approve this application?
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  Reference: {selectedApplication.referenceNumber}
                </Typography>
                <Typography variant="body2">
                  Requested Amount: ${selectedApplication.requestedAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Home Value: ${selectedApplication.homeValue.toLocaleString()}
                </Typography>
                {selectedApplication.creditScore && (
                  <Typography variant="body2">
                    Credit Score: {selectedApplication.creditScore}
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApproveApplication}
            variant="contained"
            color="success"
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={20} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject HELOC Application</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Please provide a reason for rejecting this application:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRejectApplication}
            variant="contained"
            color="error"
            disabled={processingAction || !rejectionReason}
          >
            {processingAction ? <CircularProgress size={20} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HELOCAdminDashboard;
