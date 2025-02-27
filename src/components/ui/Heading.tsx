import { createElement, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export function Heading({ level = 1, children, className = '', ...props }: HeadingProps) {
  return createElement(
    motion[`h${level}`],
    {
      className: `font-mono ${className}`,
      'data-text': typeof children === 'string' ? children : '',
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      ...props,
    },
    children
  );
}