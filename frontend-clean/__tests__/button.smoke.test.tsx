import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button component', () => {
  it('renders and is accessible by role', () => {
    render(<Button>Continue</Button>);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });
});