import { waitFor } from '@testing-library/react';
import {
  mockLoginResponse,
  renderLoginPage,
  resetAuthTestEnv,
  submitLoginForm,
} from '../test-utils/loginTestUtils';
import { mockPush } from '../test-utils/routerMock';

describe('Login page - success flow', () => {
  beforeEach(() => {
    resetAuthTestEnv({ clearStorage: true });
  });

  it('stores auth data and redirects admin users to admin dashboard', async () => {
    mockLoginResponse({
      token: 'token_admin_123',
      user: { id: 'user-1', role: 'ADMIN', email: 'admin@example.com' },
    });

    renderLoginPage();

    submitLoginForm('admin@example.com', 'password123');

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });

    expect(sessionStorage.getItem('auth_token')).toBe('token_admin_123');
    expect(localStorage.getItem('user_data')).toContain('"role":"ADMIN"');
  });

  it('stores auth token in localStorage when remember me is checked', async () => {
    mockLoginResponse({
      token: 'token_doctor_123',
      user: { id: 'user-2', role: 'DOCTOR', email: 'doctor@example.com' },
    });

    renderLoginPage();

    submitLoginForm('doctor@example.com', 'password123', true);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/doctor/dashboard');
    });

    expect(localStorage.getItem('auth_token')).toBe('token_doctor_123');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('user_data')).toContain('"role":"DOCTOR"');
  });

  it('redirects non-admin and non-doctor roles to /dashboard', async () => {
    mockLoginResponse({
      token: 'token_user_123',
      user: { id: 'user-3', role: 'USER', email: 'user@example.com' },
    });

    renderLoginPage();

    submitLoginForm('user@example.com', 'password123');

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    expect(sessionStorage.getItem('auth_token')).toBe('token_user_123');
    expect(localStorage.getItem('user_data')).toContain('"role":"USER"');
  });
});