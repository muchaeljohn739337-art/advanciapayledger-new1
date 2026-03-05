import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { mockPush } from './routerMock';

type LoginResponse = {
  token?: string;
  user?: {
    id: string;
    role: string;
    email: string;
  };
  code?: string;
  error?: string;
};

export function mockLoginResponse(response: LoginResponse, status = 200, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
  }) as unknown as typeof fetch;
}

export function renderLoginPage() {
  render(<LoginPage />);
}

export function submitLoginForm(email: string, password: string, rememberMe = false) {
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  });

  if (rememberMe) {
    fireEvent.click(screen.getByRole('checkbox', { name: /remember me/i }));
  }

  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

export function resetAuthTestEnv({ clearStorage = false }: { clearStorage?: boolean } = {}) {
  mockPush.mockReset();
  (global.fetch as jest.Mock | undefined)?.mockReset?.();

  if (clearStorage) {
    localStorage.clear();
    sessionStorage.clear();
  }
}