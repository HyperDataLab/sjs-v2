import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <section ref={ref} className={cn('rounded-card border border-border bg-surface shadow-card', className)} {...props} />
));
Card.displayName = 'Card';

const CardHeader = ({ className = '', ...props }) => <div className={cn('p-5 pb-2', className)} {...props} />;
const CardTitle = ({ className = '', ...props }) => <h2 className={cn('m-0 text-base font-bold text-foreground', className)} {...props} />;
const CardDescription = ({ className = '', ...props }) => <p className={cn('mt-1 text-sm text-muted-foreground', className)} {...props} />;
const CardContent = ({ className = '', ...props }) => <div className={cn('p-5', className)} {...props} />;

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
