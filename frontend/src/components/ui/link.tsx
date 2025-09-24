import * as React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const linkVariants = cva(
  'inline-flex items-center justify-center font-medium text-primary underline-offset-4 hover:underline',
  {
    variants: {
      variant: {
        default: 'text-primary',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface LinkProps
  extends NextLinkProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>,
    VariantProps<typeof linkVariants> {
  children: React.ReactNode;
  className?: string;
  target?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <NextLink
        className={cn(linkVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Link.displayName = 'Link';

export { Link, linkVariants };
