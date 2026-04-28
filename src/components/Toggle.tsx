import { cn } from '../lib/utils';

type ToggleSize = 'small' | 'medium';

type ToggleProps = {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: ToggleSize;
};

const getSizeClasses = (size: ToggleSize) => {
  switch (size) {
    case 'small':
      return {
        track: 'h-4 w-8',
        thumb: 'h-3 w-3',
        translate: (on: boolean) => (on ? 'translate-x-4' : 'translate-x-0'),
      };
    case 'medium':
    default:
      return {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: (on: boolean) => (on ? 'translate-x-5' : 'translate-x-0'),
      };
  }
};

export default function Toggle({ enabled, onToggle, disabled, className, size = 'medium' }: ToggleProps) {
  const sc = getSizeClasses(size);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onToggle(!enabled)}
      className={cn(
        enabled ? 'bg-ew-primary' : 'bg-gray-200',
        'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ew-primary focus:ring-offset-2',
        sc.track,
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={cn(
          sc.translate(enabled),
          'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          sc.thumb,
        )}
      />
    </button>
  );
}
