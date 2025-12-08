import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessCreationContext } from './BusinessCreationContext';

interface Step {
  number: number;
  title: string;
}

const steps: Step[] = [
  { number: 1, title: 'Informations' },
  { number: 2, title: 'Localisation' },
  { number: 3, title: 'Contact' },
];

export const StepIndicator = () => {
  const { currentStep } = useBusinessCreationContext();

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;

        return (
          <div key={step.number} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : step.number}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-1',
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
