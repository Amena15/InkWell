import { cn } from '@/lib/utils';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className,
  ...props 
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md',
        className
      )}
      {...props}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
