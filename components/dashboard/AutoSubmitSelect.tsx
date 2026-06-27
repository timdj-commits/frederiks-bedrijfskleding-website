'use client';

/**
 * Keuzelijst die het omliggende formulier direct verstuurt bij een wijziging.
 * Vervangt het patroon "select + losse Opslaan-knop" in tabelrijen: je kiest, het slaat op.
 * Plaats dit binnen een <form action={...}> met de benodigde hidden velden.
 */
export default function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  className,
  'aria-label': ariaLabel,
}: {
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      className={className}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
