import React, { useState } from 'react';
import {
  Plus,
  Copy,
  ChevronLeft,
  Info,
  Trash2,
  MoreVertical,
  MoreHorizontal,
  Pencil,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';

type ButtonColor =
  | 'primary'
  | 'white'
  | 'noBg'
  | 'noBg-red'
  | 'ghost'
  | 'ghost-gray'
  | 'green-outline'
  | 'red-outline'
  | 'red'
  | 'green';

type ButtonIcon =
  | 'plus'
  | 'document-duplicate'
  | 'chevron-left'
  | 'info'
  | 'trash'
  | 'ellipses-vertical'
  | 'ellipses-horizontal'
  | 'pencil';

type TextAlign = 'left' | 'center';
type ButtonSize = 'xs' | 'default' | 'smDynamic';

export interface ButtonProps {
  disabled?: boolean;
  color?: ButtonColor;
  size?: ButtonSize;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  icon?: ButtonIcon;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  textAlign?: TextAlign;
  [key: string]: any;
}

export const MAX_BUTTON_HEIGHT = 1000;

export const Button: React.FC<ButtonProps> = ({
  disabled,
  color = 'primary',
  size = 'default',
  onClick,
  icon,
  label,
  children,
  className = '',
  textAlign = 'center',
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [buttonHeight, setButtonHeight] = useState<number | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (buttonRef.current && !buttonHeight) {
      setButtonHeight(
        Math.min(buttonRef.current.offsetHeight, MAX_BUTTON_HEIGHT),
      );
    }
  }, [buttonHeight]);

  const baseClasses =
    'flex items-center gap-2 whitespace-nowrap rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-900 transition-colors duration-200';

  const sizeClasses: Record<ButtonSize, string> = {
    default: 'font-medium py-1.5 px-2 text-sm',
    smDynamic: 'font-medium text-xs p-1 sm:py-1.5 sm:px-2 sm:text-sm',
    xs: 'font-medium py-1 px-1.5 text-xs',
  };

  const colorClasses: Record<ButtonColor, Record<'default' | 'loading', string>> = {
    primary: {
      default: 'border border-fuchsia-900 shadow-sm bg-fuchsia-900 text-white hover:bg-fuchsia-800',
      loading: 'border border-fuchsia-300 bg-fuchsia-100 text-fuchsia-900',
    },
    white: {
      default: 'border border-gray-200 shadow-sm bg-white text-slate-900 hover:bg-gray-50',
      loading: 'border border-gray-200 bg-gray-50 text-gray-600',
    },
    noBg: {
      default: 'text-fuchsia-900 hover:text-fuchsia-700',
      loading: 'text-fuchsia-300',
    },
    'noBg-red': {
      default: 'text-red-600 hover:text-red-500',
      loading: 'text-red-300',
    },
    ghost: {
      default: 'text-fuchsia-900 hover:bg-fuchsia-50 border border-transparent',
      loading: 'text-fuchsia-300 bg-fuchsia-50 border border-transparent',
    },
    'ghost-gray': {
      default: 'text-gray-900 hover:bg-gray-50 border border-transparent',
      loading: 'text-gray-300 bg-gray-50 border border-transparent',
    },
    'green-outline': {
      default: 'border border-green-600 text-green-600 hover:bg-green-50 shadow-sm',
      loading: 'border border-green-300 text-green-300 bg-green-50',
    },
    'red-outline': {
      default: 'border border-red-600 text-red-600 hover:bg-red-50 shadow-sm',
      loading: 'border border-red-300 text-red-300 bg-red-50',
    },
    red: {
      default: 'bg-red-600 text-white hover:bg-red-500',
      loading: 'bg-red-300 text-red-300',
    },
    green: {
      default: 'bg-green-600 text-white hover:bg-green-500',
      loading: 'bg-green-300 text-green-300',
    },
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
  };

  const getButtonClasses = (): string => {
    const state = isLoading ? 'loading' : 'default';
    return cn(
      baseClasses,
      sizeClasses[size],
      colorClasses[color][state],
      alignmentClasses[textAlign],
      className,
      (disabled || isLoading) && 'cursor-not-allowed opacity-60',
    );
  };

  const iconSizeClass = size === 'xs' ? 'w-3 h-3' : 'w-4 h-4';
  const spinnerSizeClass = size === 'xs' ? 'w-3 h-3' : 'w-4 h-4';

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      await onClick(e);
    } finally {
      setIsLoading(false);
    }
  };

  const iconMap: Record<NonNullable<ButtonIcon>, LucideIcon> = {
    'plus': Plus,
    'document-duplicate': Copy,
    'chevron-left': ChevronLeft,
    'info': Info,
    'trash': Trash2,
    'ellipses-vertical': MoreVertical,
    'ellipses-horizontal': MoreHorizontal,
    'pencil': Pencil,
  };

  const IconComponent = icon ? iconMap[icon] : null;

  return (
    <button
      {...rest}
      ref={buttonRef}
      className={getButtonClasses()}
      disabled={disabled ?? isLoading}
      onClick={handleClick}
      type="button"
      style={buttonHeight ? { height: `${buttonHeight}px` } : undefined}
    >
      {isLoading ? (
        <div
          className={cn(spinnerSizeClass, 'border-2 border-current rounded-full animate-spin border-t-transparent')}
        />
      ) : (
        <>
          {IconComponent && (
            <IconComponent className={cn(iconSizeClass, 'flex-shrink-0')} />
          )}
          {label && <span className="truncate">{label}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
