"use client";

import { ChatSidebarSkeleton } from "@/components/chat/chat-skeletons";
import type { ChatSummary } from "@/components/chat/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader, Plus, Trash2, X } from "lucide-react";

type ChatSidebarProps = {
  activeChatId: string | null;
  chats: ChatSummary[];
  deletingChatId: string | null;
  isChatBusy: boolean;
  isLoadingChats: boolean;
  onCloseSidebar: () => void;
  onDeleteChat: (chatId: string) => void;
  onLoadChat: (chatId: string) => void;
  onNewChat: () => void;
};

export const ChatSidebar = ({
  activeChatId,
  chats,
  deletingChatId,
  isChatBusy,
  isLoadingChats,
  onCloseSidebar,
  onDeleteChat,
  onLoadChat,
  onNewChat,
}: ChatSidebarProps) => (
  <aside className="flex h-full min-h-0 w-72 shrink-0 flex-col border-r bg-background">
    <div className="flex items-center justify-between gap-2 border-b px-3 py-3">
      <p className="text-sm font-semibold">Chats</p>
      <div className="flex items-center gap-1">
        <Button
          aria-label="New chat"
          disabled={isLoadingChats || isChatBusy}
          onClick={onNewChat}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Plus />
        </Button>
        <Button
          aria-label="Close sidebar"
          className="md:hidden"
          onClick={onCloseSidebar}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X />
        </Button>
      </div>
    </div>

    <div className="scrollbar-none min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
      {isLoadingChats ? (
        <ChatSidebarSkeleton />
      ) : (
        chats.map((chat) => {
          const isDeleting = deletingChatId === chat.id;

          return (
            <div
              className={cn(
                "group flex w-full items-start gap-1 rounded-md pr-1 transition-colors hover:bg-muted",
                activeChatId === chat.id && "bg-muted"
              )}
              key={chat.id}
            >
              <button
                className="flex min-w-0 flex-1 px-2 py-2 text-left text-sm"
                disabled={isChatBusy}
                onClick={() => onLoadChat(chat.id)}
                type="button"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {chat.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {chat.preview || "No messages yet"}
                  </span>
                </span>
              </button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <button
                      aria-label={`Delete ${chat.title}`}
                      className="mt-1.5 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-destructive group-hover:opacity-100"
                      disabled={isChatBusy || Boolean(deletingChatId)}
                      type="button"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &quot;{chat.title}&quot; and
                      its messages. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                      disabled={isDeleting}
                      onClick={() => onDeleteChat(chat.id)}
                    >
                      {isDeleting && <Loader className="size-3 animate-spin" />}
                      {isDeleting ? "Deleting" : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        })
      )}
    </div>
  </aside>
);
