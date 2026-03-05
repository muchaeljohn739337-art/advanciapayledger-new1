import { screen, waitFor } from '@testing-library/react';
import {
  mockLoginResponse,
  renderLoginPage,
  resetAuthTestEnv,
  submitLoginForm,
} from '../test-utils/loginTestUtils';
import { mockPush } from '../test-utils/routerMock';

describe('Login page - email not verified flow', () => {
  beforeEach(() => {
    resetAuthTestEnv();
  });

  it('shows verification error and does not redirect when API returns EMAIL_NOT_VERIFIED', async () => {
    mockLoginResponse({ code: 'EMAIL_NOT_VERIFIED', error: 'Email not verified' }, 403, false);

    renderLoginPage();

    submitLoginForm('user@example.com', 'password123');

    await waitFor(() => {
      expect(
        screen.getByText(/please verify your email address\. check your inbox\./i),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});