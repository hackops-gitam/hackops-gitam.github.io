import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ children, variant = 'primary', className = '', href, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded transition-colors font-medium';
    const variants = {
      primary: 'bg-cyan text-navy hover:bg-cyan/80',
      secondary: 'bg-gray-700 text-white hover:bg-gray-600',
      outline: 'border border-cyan text-cyan hover:bg-cyan/10',
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

    if (href) {
      return (
        <a
          href={href}
          className={combinedClassName}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        className={combinedClassName}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        {children}
      </button>
    );
  }
);