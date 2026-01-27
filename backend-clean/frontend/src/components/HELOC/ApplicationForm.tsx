// Rockefeller HELOC Application Form Component
// Reference Number: 123456789-HELOC

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import {
  Home,
  AttachMoney,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';

interface HELOCApplicationData {
  protectionPlanId: string;
  homeValue: number;
  requestedAmount: number;
  homeAddress: string;
  propertyType: string;
  yearBuilt: number;
  primaryResidence: boolean;
  employmentStatus: string;
  annualIncome: number;
  monthlyDebts: number;
  creditScore: number;
}

interface HELOCApplicationFormProps {
  protectionPlanId: string;
  onSubmit: (applicationData: HELOCApplicationData) => Promise<void>;
  onBack?: () => void;
}

const steps = [
  'Property Information',
  'Financial Details',
  'Review & Submit'
];

export const HELOCApplicationForm: React.FC<HELOCApplicationFormProps> = ({
  protectionPlanId,
  onSubmit,
  onBack
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<HELOCApplicationData>({
    protectionPlanId,
    homeValue: 0,
    requestedAmount: 0,
    homeAddress: '',
    propertyType: '',
    yearBuilt: new Date().getFullYear(),
    primaryResidence: true,
    employmentStatus: '',
    annualIncome: 0,
    monthlyDebts: 0,
    creditScore: 0
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Calculate maximum eligible amount based on home value
  const maxEligibleAmount = applicationData.homeValue * 0.85; // 85% LTV
  const recommendedAmount = Math.min(maxEligibleAmount, applicationData.homeValue * 0.8);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // Property Information
        if (!applicationData.homeAddress) errors.homeAddress = 'Home address is required';
        if (!applicationData.propertyType) errors.propertyType = 'Property type is required';
        if (applicationData.homeValue < 100000) errors.homeValue = 'Home value must be at least $100,000';
        if (applicationData.yearBuilt < 1900 || applicationData.yearBuilt > new Date().getFullYear()) {
          errors.yearBuilt = 'Invalid year built';
        }
        break;

      case 1: // Financial Details
        if (!applicationData.employmentStatus) errors.employmentStatus = 'Employment status is required';
        if (applicationData.annualIncome < 12000) errors.annualIncome = 'Annual income must be at least $12,000';
        if (applicationData.requestedAmount < 25000) errors.requestedAmount = 'Minimum HELOC amount is $25,000';
        if (applicationData.requestedAmount > maxEligibleAmount) {
          errors.requestedAmount = `Maximum eligible amount is $${maxEligibleAmount.toLocaleString()}`;
        }
        if (applicationData.creditScore < 680) errors.creditScore = 'Minimum credit score is 680';
        break;

      case 2: // Review
        // Final validation
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError(null);

    try {
      await onSubmit(applicationData);
      // Success will be handled by parent component
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application submission failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Home sx={{ mr: 1, verticalAlign: 'middle' }} />
                Property Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tell us about the property you'd like to use for your HELOC
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Home Address"
                value={applicationData.homeAddress}
                onChange={(e) => setApplicationData(prev => ({ ...prev, homeAddress: e.target.value }))}
                error={!!validationErrors.homeAddress}
                helperText={validationErrors.homeAddress}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Type"
                select
                value={applicationData.propertyType}
                onChange={(e) => setApplicationData(prev => ({ ...prev, propertyType: e.target.value }))}
                error={!!validationErrors.propertyType}
                helperText={validationErrors.propertyType}
                required
                SelectProps={{ native: true }}
              >
                <option value="">Select property type</option>
                <option value="single_family">Single Family Home</option>
                <option value="condo">Condominium</option>
                <option value="townhouse">Townhouse</option>
                <option value="multi_family">Multi-Family Home</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Year Built"
                type="number"
                value={applicationData.yearBuilt}
                onChange={(e) => setApplicationData(prev => ({ ...prev, yearBuilt: parseInt(e.target.value) }))}
                error={!!validationErrors.yearBuilt}
                helperText={validationErrors.yearBuilt}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estimated Home Value"
                type="number"
                value={applicationData.homeValue}
                onChange={(e) => setApplicationData(prev => ({ ...prev, homeValue: parseFloat(e.target.value) }))}
                error={!!validationErrors.homeValue}
                helperText={validationErrors.homeValue || 'Current market value of your home'}
                required
                InputProps={{
                  startAdornment: '$',
                  inputProps: { min: 100000, step: 10000 }
                }}
              />
            </Grid>

            {applicationData.homeValue > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
                  <Typography variant="body2" color="info.dark">
                    <AttachMoney sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Based on your home value of ${applicationData.homeValue.toLocaleString()}, you may be eligible for up to 
                    ${maxEligibleAmount.toLocaleString()} (85% LTV)
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                Financial Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Help us assess your financial situation for the HELOC
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employment Status"
                select
                value={applicationData.employmentStatus}
                onChange={(e) => setApplicationData(prev => ({ ...prev, employmentStatus: e.target.value }))}
                error={!!validationErrors.employmentStatus}
                helperText={validationErrors.employmentStatus}
                required
                SelectProps={{ native: true }}
              >
                <option value="">Select employment status</option>
                <option value="employed">Employed</option>
                <option value="self_employed">Self-Employed</option>
                <option value="retired">Retired</option>
                <option value="business_owner">Business Owner</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Annual Income"
                type="number"
                value={applicationData.annualIncome}
                onChange={(e) => setApplicationData(prev => ({ ...prev, annualIncome: parseFloat(e.target.value) }))}
                error={!!validationErrors.annualIncome}
                helperText={validationErrors.annualIncome || 'Gross annual income before taxes'}
                required
                InputProps={{
                  startAdornment: '$',
                  inputProps: { min: 12000, step: 1000 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Debt Payments"
                type="number"
                value={applicationData.monthlyDebts}
                onChange={(e) => setApplicationData(prev => ({ ...prev, monthlyDebts: parseFloat(e.target.value) }))}
                helperText="Total monthly debt payments (excluding mortgage)"
                InputProps={{
                  startAdornment: '$',
                  inputProps: { min: 0, step: 100 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Credit Score"
                type="number"
                value={applicationData.creditScore}
                onChange={(e) => setApplicationData(prev => ({ ...prev, creditScore: parseInt(e.target.value) }))}
                error={!!validationErrors.creditScore}
                helperText={validationErrors.creditScore || 'Estimated credit score (300-850)'}
                required
                InputProps={{
                  inputProps: { min: 300, max: 850 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requested HELOC Amount"
                type="number"
                value={applicationData.requestedAmount}
                onChange={(e) => setApplicationData(prev => ({ ...prev, requestedAmount: parseFloat(e.target.value) }))}
                error={!!validationErrors.requestedAmount}
                helperText={validationErrors.requestedAmount || `Amount you'd like to borrow (Min: $25,000, Max: $${maxEligibleAmount.toLocaleString()})`}
                required
                InputProps={{
                  startAdornment: '$',
                  inputProps: { min: 25000, max: maxEligibleAmount, step: 5000 }
                }}
              />
            </Grid>

            {applicationData.requestedAmount > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'success.lighter' }}>
                  <Typography variant="body2" color="success.dark">
                    <CheckCircle sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Recommended amount based on your profile: ${recommendedAmount.toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Review & Submit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please review your application before submitting
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Property Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1">{applicationData.homeAddress}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Property Type</Typography>
                      <Typography variant="body1">{applicationData.propertyType.replace('_', ' ').toUpperCase()}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Year Built</Typography>
                      <Typography variant="body1">{applicationData.yearBuilt}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Home Value</Typography>
                      <Typography variant="body1">${applicationData.homeValue.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Financial Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Employment Status</Typography>
                      <Typography variant="body1">{applicationData.employmentStatus.replace('_', ' ').toUpperCase()}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Annual Income</Typography>
                      <Typography variant="body1">${applicationData.annualIncome.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Monthly Debts</Typography>
                      <Typography variant="body1">${applicationData.monthlyDebts.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                      <Typography variant="body1">{applicationData.creditScore}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: 'primary.lighter' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    HELOC Request
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Requested Amount</Typography>
                      <Typography variant="h6">${applicationData.requestedAmount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Maximum Eligible</Typography>
                      <Typography variant="body1">${maxEligibleAmount.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    By submitting this application, you authorize Rockefeller Home Protection Plan to review your credit 
                    and verify the information provided.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Rockefeller HELOC Application
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Reference Number: 123456789-HELOC
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Error sx={{ mr: 1 }} />
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={onBack || handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                  size="large"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  size="large"
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HELOCApplicationForm;
