import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type SliderFieldProps = {
  label: ReactNode;
  value: number | string;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  minLabel?: ReactNode;
  maxLabel?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  onBlur?: () => void;
};

const Wrapper = styled.div<{ $tokens: BrandTokens }>`
  display: grid;
  gap: ${({ $tokens }) => $tokens.spacing['6']};
`;

const Header = styled.div<{ $tokens: BrandTokens }>`
  display: block;
`;

const Label = styled.label<{ $tokens: BrandTokens }>`
  min-width: 0;
  color: ${({ $tokens }) => $tokens.colors.text};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
`;

const RequiredMark = styled.span`
  color: inherit;
`;

const SliderFrame = styled.div<{ $tokens: BrandTokens; $progress: number; $disabled: boolean }>`
  position: relative;
  min-width: 0;
  opacity: ${({ $disabled }) => ($disabled ? 0.62 : 1)};
`;

const SliderRow = styled.div<{ $tokens: BrandTokens }>`
  display: grid;
  grid-template-columns: minmax(74px, max-content) minmax(120px, 1fr) minmax(74px, max-content);
  align-items: center;
  gap: ${({ $tokens }) => $tokens.spacing['8']};
  min-width: 0;
`;

const TrackVisual = styled.span<{ $tokens: BrandTokens; $progress: number }>`
  position: absolute;
  right: 10px;
  bottom: 16px;
  left: 10px;
  height: 7px;
  border-radius: 999px;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.68) 0 1px, transparent 1.5px) 0 50% / 10% 100% repeat-x,
    linear-gradient(
      90deg,
      ${({ $tokens }) => $tokens.biteplanerContext.accentStrong} 0%,
      ${({ $tokens }) => $tokens.biteplanerContext.accentStrong} ${({ $progress }) => $progress}%,
      ${({ $tokens }) => $tokens.biteplanerContext.accentSubtle} ${({ $progress }) => $progress}%,
      ${({ $tokens }) => $tokens.biteplanerContext.accentSubtle} 100%
    );
  box-shadow: inset 0 0 0 1px rgba(28, 94, 58, 0.12);
  pointer-events: none;
`;

const CurrentValue = styled.output<{ $tokens: BrandTokens; $progress: number; $visible: boolean }>`
  position: absolute;
  top: -24px;
  left: ${({ $progress }) => $progress}%;
  z-index: 2;
  display: inline-grid;
  place-items: center;
  min-width: 30px;
  min-height: 24px;
  padding: 3px 8px;
  border-radius: 4px;
  background: ${({ $tokens }) => $tokens.biteplanerContext.accentStrong};
  color: ${({ $tokens }) => $tokens.colors.accentContrast};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  font-weight: 800;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: none;
  transform: translateX(-50%) translateY(${({ $visible }) => ($visible ? '0' : '6px')}) scale(${({ $visible }) => ($visible ? 1 : 0.96)});
  box-shadow: 0 10px 22px rgba(28, 94, 58, 0.22);
  transition:
    opacity ${({ $tokens }) => $tokens.motion.fast} ease,
    transform ${({ $tokens }) => $tokens.motion.fast} ease;

  &::after {
    position: absolute;
    bottom: -5px;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: inherit;
    content: '';
    transform: translateX(-50%) rotate(45deg);
  }
`;

const RangeInput = styled.input<{ $tokens: BrandTokens; $progress: number }>`
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 44px;
  min-width: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;

  &:disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    height: 7px;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    width: 26px;
    height: 26px;
    margin-top: -9.5px;
    border: 3px solid ${({ $tokens }) => $tokens.colors.surface};
    border-radius: 999px;
    background: ${({ $tokens }) => $tokens.biteplanerContext.accentStrong};
    box-shadow:
      0 0 0 0 rgba(118, 183, 142, 0.28),
      0 8px 18px rgba(28, 94, 58, 0.24);
    appearance: none;
    transition:
      box-shadow ${({ $tokens }) => $tokens.motion.fast} ease,
      transform ${({ $tokens }) => $tokens.motion.fast} ease;
  }

  &:hover::-webkit-slider-thumb,
  &:focus-visible::-webkit-slider-thumb {
    box-shadow:
      0 0 0 18px rgba(118, 183, 142, 0.2),
      0 10px 22px rgba(28, 94, 58, 0.26);
  }

  &:active::-webkit-slider-thumb {
    transform: scale(0.94);
    box-shadow:
      0 0 0 24px rgba(118, 183, 142, 0.32),
      0 10px 22px rgba(28, 94, 58, 0.3);
  }

  &::-moz-range-track {
    height: 7px;
    background: transparent;
  }

  &::-moz-range-progress {
    height: 7px;
    background: transparent;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border: 3px solid ${({ $tokens }) => $tokens.colors.surface};
    border-radius: 999px;
    background: ${({ $tokens }) => $tokens.biteplanerContext.accentStrong};
    box-shadow:
      0 0 0 0 rgba(118, 183, 142, 0.28),
      0 8px 18px rgba(28, 94, 58, 0.24);
    transition:
      box-shadow ${({ $tokens }) => $tokens.motion.fast} ease,
      transform ${({ $tokens }) => $tokens.motion.fast} ease;
  }

  &:hover::-moz-range-thumb,
  &:focus-visible::-moz-range-thumb {
    box-shadow:
      0 0 0 18px rgba(118, 183, 142, 0.2),
      0 10px 22px rgba(28, 94, 58, 0.26);
  }

  &:active::-moz-range-thumb {
    transform: scale(0.94);
    box-shadow:
      0 0 0 24px rgba(118, 183, 142, 0.32),
      0 10px 22px rgba(28, 94, 58, 0.3);
  }
`;

const Endpoints = styled.div<{ $tokens: BrandTokens }>`
  display: contents;
`;

const Endpoint = styled.span<{ $tokens: BrandTokens; $align: 'start' | 'end' }>`
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  line-height: 1.35;
  text-align: ${({ $align }) => $align};
  white-space: normal;
`;

const Message = styled.span<{ $tokens: BrandTokens; $tone: 'hint' | 'error' }>`
  color: ${({ $tokens, $tone }) =>
    $tone === 'error' ? $tokens.colors.danger : $tokens.colors.textSoft};
  font-family: ${({ $tokens }) => $tokens.fonts.body};
  font-size: 12px;
  line-height: 1.4;
`;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseValue(value: number | string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  minLabel,
  maxLabel,
  hint,
  error,
  required,
  disabled,
  id,
  name,
  onBlur,
}: SliderFieldProps) {
  const { tokens } = useDesignSystem();
  const autoId = useId();
  const fieldId = id ?? autoId;
  const numericValue = clamp(parseValue(value, min), min, max);
  const range = max - min;
  const progress = range > 0 ? ((numericValue - min) / range) * 100 : 0;
  const [isValueVisible, setIsValueVisible] = useState(false);
  const hideValueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideValueTimeoutRef.current) {
        clearTimeout(hideValueTimeoutRef.current);
      }
    };
  }, []);

  function showValueTemporarily() {
    if (disabled) {
      return;
    }

    if (hideValueTimeoutRef.current) {
      clearTimeout(hideValueTimeoutRef.current);
    }

    setIsValueVisible(true);
    hideValueTimeoutRef.current = setTimeout(() => {
      setIsValueVisible(false);
      hideValueTimeoutRef.current = null;
    }, 1000);
  }

  function commitValue(nextValue: number) {
    showValueTemporarily();
    onChange(clamp(nextValue, min, max));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const keyActions: Record<string, number> = {
      ArrowRight: numericValue + step,
      ArrowUp: numericValue + step,
      ArrowLeft: numericValue - step,
      ArrowDown: numericValue - step,
      Home: min,
      End: max,
    };

    if (!(event.key in keyActions)) {
      return;
    }

    event.preventDefault();
    commitValue(keyActions[event.key]);
  }

  return (
    <Wrapper $tokens={tokens}>
      <Header $tokens={tokens}>
        <Label $tokens={tokens} htmlFor={fieldId}>
          {label}
          {required ? <> <RequiredMark>(*)</RequiredMark></> : null}
        </Label>
      </Header>
      <SliderRow $tokens={tokens}>
        <Endpoints $tokens={tokens}>
          <Endpoint $tokens={tokens} $align="start">{minLabel ?? min}</Endpoint>
        </Endpoints>
        <SliderFrame $tokens={tokens} $progress={progress} $disabled={Boolean(disabled)}>
          <CurrentValue
            $tokens={tokens}
            $progress={progress}
            $visible={isValueVisible}
            aria-hidden={!isValueVisible}
            aria-live="polite"
          >
            {numericValue}
          </CurrentValue>
          <TrackVisual $tokens={tokens} $progress={progress} aria-hidden="true" />
          <RangeInput
            $tokens={tokens}
            $progress={progress}
            id={fieldId}
            name={name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={numericValue}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={numericValue}
            aria-valuetext={`${numericValue} de ${max}`}
            onChange={(event) => commitValue(Number(event.target.value))}
            onKeyDown={handleKeyDown}
            onPointerDown={showValueTemporarily}
            onTouchStart={showValueTemporarily}
            onFocus={showValueTemporarily}
            onBlur={() => {
              setIsValueVisible(false);
              onBlur?.();
            }}
          />
        </SliderFrame>
        <Endpoint $tokens={tokens} $align="end">{maxLabel ?? max}</Endpoint>
      </SliderRow>
      {error ? <Message $tokens={tokens} $tone="error" role="alert">{error}</Message> : null}
      {!error && hint ? <Message $tokens={tokens} $tone="hint">{hint}</Message> : null}
    </Wrapper>
  );
}
