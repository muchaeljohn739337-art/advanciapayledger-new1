import { render, screen } from '@testing-library/react';
import TermsPage from '@/app/terms/page';

describe('Terms page', () => {
  it('renders primary heading and key navigation links', () => {
    render(<TermsPage />);

    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /faq/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /login/i }).length).toBeGreaterThan(0);
  });
});