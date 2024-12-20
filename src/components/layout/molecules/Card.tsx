import { cn } from '../../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-[12px] shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
