import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#DFE1E6]', className)}
      {...props}
    />
  )
}

export { Skeleton }