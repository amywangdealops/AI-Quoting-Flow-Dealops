import React from 'react';
import { cn } from '../lib/utils';

export type TooltipLocation = 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

export default function Tooltip(props: {
  as?: string;
  className?: string;
  text: string | React.ReactNode;
  location: TooltipLocation;
  children: React.ReactNode;
  disableTooltip?: boolean;
  [key: string]: any;
}) {
  const { location, children, className, text, as = 'div', disableTooltip, ...extraProps } = props;

  return React.createElement(
    as,
    {
      ...extraProps,
      className: cn(className ?? '', 'has-tooltip relative'),
    },
    <>
      {children}
      {!disableTooltip && (
        <div
          className={cn(
            location === 'LEFT' && 'justify-start',
            location === 'RIGHT' && 'justify-end',
            (location === 'TOP' || location === 'BOTTOM') && 'justify-center',
            'pointer-events-none absolute top-0 z-[100] flex h-full w-full items-center',
          )}
        >
          <span
            className={cn(
              location === 'LEFT' && '-ml-2 -translate-x-full',
              location === 'RIGHT' && '-mr-2 translate-x-full',
              location === 'TOP' && '-mt-8 -translate-y-full',
              location === 'BOTTOM' && '-mb-8 translate-y-full',
              'tooltip pointer-events-none absolute z-50 max-w-[300px] whitespace-normal rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm',
            )}
          >
            {text}
          </span>
        </div>
      )}
    </>,
  );
}
