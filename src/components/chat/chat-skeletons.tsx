import { Skeleton } from "@/components/ui/skeleton";

export const ChatSidebarSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div className="rounded-md px-2 py-2" key={index}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    ))}
  </div>
);

export const ConversationSkeleton = () => (
  <div className="flex min-h-[calc(100svh-18rem)] flex-col justify-center gap-5">
    <div className="flex justify-end">
      <Skeleton className="h-12 w-24 rounded-lg" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  </div>
);
