import { useMemo, useState } from 'react';
import { ResultPanel } from './components/ResultPanel';
import { SimulationForm } from './components/SimulationForm';
import { DEFAULT_SIMULATION_PARAMETERS } from './domain/parameters';
import { simulateSac, validateSacInput, type SacField } from './domain/sac';

export default function App() {
  const [propertyValue, setPropertyValue] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const input = useMemo(
    () => ({
      propertyValue: Number(propertyValue),
      downPayment: Number(downPayment),
      monthlyIncome: Number(monthlyIncome),
    }),
    [propertyValue, downPayment, monthlyIncome],
  );

  const validationErrors = useMemo(() => validateSacInput(input), [input]);
  const hasErrors = Object.keys(validationErrors).length > 0;
  const result = useMemo(() => (hasErrors ? null : simulateSac(input)), [hasErrors, input]);

  const handleChange = (field: SacField, value: string) => {
    if (field === 'propertyValue') {
      setPropertyValue(value);
    } else if (field === 'downPayment') {
      setDownPayment(value);
    } else {
      setMonthlyIncome(value);
    }
  };

  return (
    <main className="app">
      <h1>SimulaImóvel</h1>
      <p className="app__intro">
        Estime o valor financiado, as parcelas e o comprometimento da renda de um financiamento
        pelo sistema SAC.
      </p>
      <SimulationForm
        values={{ propertyValue, downPayment, monthlyIncome }}
        onChange={handleChange}
        errors={validationErrors}
      />
      {result ? <ResultPanel result={result} parameters={DEFAULT_SIMULATION_PARAMETERS} /> : null}
    </main>
  );
}

