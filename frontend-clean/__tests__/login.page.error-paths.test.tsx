import { screen, waitFor } from '@testing-library/react';
import { renderLoginPage, resetAuthTestEnv, submitLoginForm } from '../test-utils/loginTestUtils';
import { mockPush } from '../test-utils/routerMock';

describe('Login page - generic error flows', () => {
  beforeEach(() => {
    resetAuthTestEnv();
  });

  it('shows API error message for non-403 auth errors and does not redirect', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    }) as unknown as typeof fetch;

    renderLoginPage();
    submitLoginForm('user@example.com', 'wrong-password');

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows fallback error when API response has no message (e.g. 500)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    renderLoginPage();
    submitLoginForm('user@example.com', 'password123');

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows network error when request fails and does not redirect', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network unavailable')) as unknown as typeof fetch;

    renderLoginPage();
    submitLoginForm('user@example.com', 'password123');

    await waitFor(() => {
      expect(screen.getByText(/network unavailable/i)).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});