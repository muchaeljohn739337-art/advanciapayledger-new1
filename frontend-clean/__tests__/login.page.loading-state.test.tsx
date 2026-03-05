import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderLoginPage, resetAuthTestEnv } from '../test-utils/loginTestUtils';
import { mockPush } from '../test-utils/routerMock';

describe('Login page - loading state', () => {
  beforeEach(() => {
    resetAuthTestEnv({ clearStorage: true });
  });

  it('disables submit button and shows "Signing in..." while request is in flight', async () => {
    let resolveFetch: ((value: any) => void) | undefined;

    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    ) as unknown as typeof fetch;

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in\.\.\./i })).toBeDisabled();
    });

    resolveFetch?.({
      ok: true,
      status: 200,
      json: async () => ({
        token: 'token_user_loading',
        user: { id: 'user-loading', role: 'USER', email: 'user@example.com' },
      }),
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});