import { cn } from '@/lib/utils';

interface BadgeProps {
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  className?: string;
}

const STATUS_MAP = {
  CONFIRMED: { label: 'Confirmed', className: 'badge-confirmed' },
  CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
};

export default function Badge({ status, className }: BadgeProps) {
  const config = STATUS_MAP[status];
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}
