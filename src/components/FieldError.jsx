// src/components/FieldError.jsx
export default function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="field-error">⚠ {msg}</p>;
}
