import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

function Smoke() {
  return <div>Test OK</div>;
}

describe('Smoke', () => {
  it('renders', () => {
    render(<Smoke />);
    expect(screen.getByText('Test OK')).toBeInTheDocument();
  });
});
