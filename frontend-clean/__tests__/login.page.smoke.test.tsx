import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';

describe('Login page - rendering', () => {
  it('renders email/password fields and sign in button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /advancia pay/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});