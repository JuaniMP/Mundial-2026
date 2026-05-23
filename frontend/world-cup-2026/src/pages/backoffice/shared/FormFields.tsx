export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontSize: 13,
        }}
      />
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ v: string; label: string }>;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontSize: 13,
          background: '#ffffff',
        }}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: '#f9fafb',
        padding: '10px 12px',
        borderRadius: 8,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, color: '#0D1B2A' }}>{value}</div>
      <div
        style={{
          fontSize: 11,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
    </div>
  );
}
