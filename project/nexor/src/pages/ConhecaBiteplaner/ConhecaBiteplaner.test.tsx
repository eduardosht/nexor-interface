import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConhecaBiteplaner } from './index';

describe('ConhecaBiteplaner', () => {
  it('renders an empty main landmark for the QR destination route', () => {
    render(<ConhecaBiteplaner />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toBeEmptyDOMElement();
  });
});
