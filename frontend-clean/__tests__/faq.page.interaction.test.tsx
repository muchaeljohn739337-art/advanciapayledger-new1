import { fireEvent, render, screen } from '@testing-library/react';
import FAQPage from '@/app/faq/page';

describe('FAQ page interactions', () => {
  it('expands and collapses an FAQ answer when its question is clicked', () => {
    render(<FAQPage />);

    const question = screen.getByRole('button', {
      name: /how quickly can i start using advancia pay\?/i,
    });

    expect(
      screen.queryByText(/your account review typically completes within 1-2 business days/i),
    ).not.toBeInTheDocument();

    fireEvent.click(question);

    expect(
      screen.getByText(/your account review typically completes within 1-2 business days/i),
    ).toBeInTheDocument();

    fireEvent.click(question);

    expect(
      screen.queryByText(/your account review typically completes within 1-2 business days/i),
    ).not.toBeInTheDocument();
  });
});