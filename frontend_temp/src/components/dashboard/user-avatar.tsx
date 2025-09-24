import { cn } from '@/lib/utils';
import Image from 'next/image';

type UserAvatarProps = {
  name: string;
  avatar?: string | null;
  className?: string;
};

export function UserAvatar({ name, avatar, className }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatar) {
    return (
      <div className={cn('relative h-8 w-8 overflow-hidden rounded-full', className)}>
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-cover"
          sizes="32px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700',
        'text-sm font-medium text-gray-600 dark:text-gray-300',
        className
      )}
    >
      {initials}
    </div>
  );
}
