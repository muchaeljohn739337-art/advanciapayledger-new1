import { waitFor } from '@testing-library/react';
import {
  mockLoginResponse,
  renderLoginPage,
  resetAuthTestEnv,
  submitLoginForm,
} from '../test-utils/loginTestUtils';
import { mockPush } from '../test-utils/routerMock';

describe('Login page - pending approval flow', () => {
  beforeEach(() => {
    resetAuthTestEnv();
  });

  it('redirects to pending approval page when API returns PENDING_APPROVAL', async () => {
    mockLoginResponse({ code: 'PENDING_APPROVAL', error: 'Account pending approval' }, 403, false);

    renderLoginPage();

    submitLoginForm('user@example.com', 'password123');

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/pending-approval');
    });
  });
});