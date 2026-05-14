export interface StatusIndicatorProps {
  color: string;
  label: string;
}

export function StatusIndicator({ color, label }: StatusIndicatorProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      <span>{label}</span>
    </span>
  );
}
