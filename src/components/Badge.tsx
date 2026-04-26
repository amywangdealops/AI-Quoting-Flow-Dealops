import React from 'react';
import { cn } from '../lib/utils';

export type BadgeColor =
  | 'gray'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'darkGreen'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'fuchsia'
  | 'renewalsPurple'
  | 'none';

const colorMapping: Record<BadgeColor, string> = {
  gray: 'bg-gray-50 text-gray-700',
  red: 'bg-red-50 text-red-700',
  orange: 'bg-orange-50 text-orange-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  green: 'bg-green-50 text-green-700',
  darkGreen: 'text-green-800 bg-green-100',
  blue: 'bg-blue-50 text-blue-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  purple: 'bg-purple-50 text-purple-700',
  pink: 'bg-pink-50 text-pink-700',
  fuchsia: 'bg-fuchsia-50 text-fuchsia-700',
  renewalsPurple: 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 border-pink-200',
  none: '',
};

export default function Badge(props: {
  children: React.ReactNode;
  color: BadgeColor;
  className?: string;
  size?: 'small' | 'medium';
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn(
        colorMapping[props.color],
        'inline-flex items-center rounded-full text-xs font-medium',
        props.size === 'small'
          ? 'px-1.5 py-0.5'
          : 'px-1.5 py-0.5 sm:px-2 sm:py-1',
        props.className ?? '',
      )}
      style={props.style}
    >
      {props.children}
    </span>
  );
}
