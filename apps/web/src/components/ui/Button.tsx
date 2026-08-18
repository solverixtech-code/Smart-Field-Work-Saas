import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]';

    const variants = {
      // Primary Moodboard Solid Color: #0D1F3D (Deep Navy)
      primary: 'bg-[#0D1F3D] text-white hover:bg-[#071326] focus:ring-[#0D1F3D]',
      // Secondary Moodboard Color: #122b54 (Navy accent)
      secondary: 'bg-[#122b54] text-white hover:bg-[#0D1F3D] focus:ring-[#122b54]',
      // Accent Moodboard Color: #E20613 (Corporate Red)
      accent: 'bg-[#E20613] text-white hover:bg-[#c4040f] focus:ring-[#E20613]',
      outline: 'border border-slate-200 bg-white text-[#0D1F3D] hover:bg-slate-50 focus:ring-slate-300',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    };

    const sizes = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-3 text-xs',
      lg: 'px-5 py-3.5 text-sm',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
