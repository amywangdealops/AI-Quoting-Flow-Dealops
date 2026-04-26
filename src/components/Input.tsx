import * as React from 'react';
import { cn } from '../lib/utils';

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    prefix?: React.ReactNode;
    error?: string;
    wrapperClassName?: string;
  }
>(({ className, type, prefix, error, wrapperClassName, ...props }, ref) => {
  return (
    <div className={wrapperClassName}>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-500 text-sm">{prefix}</span>
        )}
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-800 focus-visible:border-gray-800 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
            type === 'number' &&
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            error && 'border-red-500',
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
