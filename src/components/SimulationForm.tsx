import type { SacField, SacValidationErrors } from '../domain/sac';

export interface SimulationFormValues {
  propertyValue: string;
  downPayment: string;
  monthlyIncome: string;
}

export interface SimulationFormProps {
  values: SimulationFormValues;
  onChange: (field: SacField, value: string) => void;
  errors: SacValidationErrors;
}

/** A tela expõe exatamente estes três campos — sem taxa, prazo ou limite. */
const FIELDS: Array<{ field: SacField; id: string; label: string }> = [
  { field: 'propertyValue', id: 'property-value', label: 'Valor do imóvel (R$)' },
  { field: 'downPayment', id: 'down-payment', label: 'Valor da entrada (R$)' },
  { field: 'monthlyIncome', id: 'monthly-income', label: 'Renda bruta mensal (R$)' },
];

export function SimulationForm({ values, onChange, errors }: SimulationFormProps) {
  return (
    <form className="simulation-form" onSubmit={(event) => event.preventDefault()}>
      {FIELDS.map(({ field, id, label }) => {
        const error = errors[field];
        const errorId = `${id}-error`;
        return (
          <div className="field" key={field}>
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              name={field}
              type="number"
              min={0}
              step="any"
              value={values[field]}
              onChange={(event) => onChange(field, event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            {error ? (
              <p className="field-error" id={errorId} role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}
    </form>
  );
}
