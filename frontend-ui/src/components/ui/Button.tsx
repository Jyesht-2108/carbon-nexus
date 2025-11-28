import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-to-r from-primary to-primary-dark text-white shadow-glow hover:shadow-glow-accent1':
              variant === 'default',
            'border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200':
              variant === 'outline',
            'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200':
              variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg':
              variant === 'destructive',
          },
          {
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
