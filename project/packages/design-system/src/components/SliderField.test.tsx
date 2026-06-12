import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesignSystemProvider } from '../provider';
import { SliderField } from './SliderField';

describe('SliderField', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a labelled range with endpoint descriptions', () => {
    render(
      <DesignSystemProvider brand="nexor">
        <SliderField
          label="Qualidade do sono"
          value={5}
          min={0}
          max={10}
          minLabel="Pior caso"
          maxLabel="Melhor caso"
          onChange={() => undefined}
        />
      </DesignSystemProvider>,
    );

    expect(screen.getByRole('slider', { name: /qualidade do sono/i })).toHaveAttribute('aria-valuemin', '0');
    expect(screen.getByRole('slider', { name: /qualidade do sono/i })).toHaveAttribute('aria-valuemax', '10');
    expect(screen.getByRole('slider', { name: /qualidade do sono/i })).toHaveAttribute('aria-valuenow', '5');
    expect(screen.getByText('Pior caso')).toBeInTheDocument();
    expect(screen.getByText('Melhor caso')).toBeInTheDocument();
  });

  it('updates value with keyboard arrows and clamps to the configured range', () => {
    const handleChange = vi.fn();

    render(
      <DesignSystemProvider brand="nexor">
        <SliderField
          label="Nível de estresse"
          value={5}
          min={0}
          max={10}
          onChange={handleChange}
        />
      </DesignSystemProvider>,
    );

    const slider = screen.getByRole('slider', { name: /nível de estresse/i });

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    fireEvent.keyDown(slider, { key: 'Home' });
    fireEvent.keyDown(slider, { key: 'End' });

    expect(handleChange).toHaveBeenNthCalledWith(1, 6);
    expect(handleChange).toHaveBeenNthCalledWith(2, 4);
    expect(handleChange).toHaveBeenNthCalledWith(3, 0);
    expect(handleChange).toHaveBeenNthCalledWith(4, 10);
  });

  it('shows the current score only while the user is interacting', () => {
    vi.useFakeTimers();

    render(
      <DesignSystemProvider brand="nexor">
        <SliderField
          label="Qualidade do sono"
          value={5}
          min={0}
          max={10}
          onChange={() => undefined}
        />
      </DesignSystemProvider>,
    );

    const slider = screen.getByRole('slider', { name: /qualidade do sono/i });
    const currentValue = screen.getByText('5');

    expect(currentValue).toHaveStyle({ opacity: '0' });

    fireEvent.pointerDown(slider);

    expect(currentValue).toHaveStyle({ opacity: '1' });

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(currentValue).toHaveStyle({ opacity: '1' });

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(currentValue).toHaveStyle({ opacity: '0' });
  });
});
