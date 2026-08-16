"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
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
import { Skeleton } from "@/components/ui/skeleton";
import { chatModels, defaultChatModel } from "@/lib/chat-models";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  Check,
  ChevronsUpDown,
  Loader,
  Menu,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

type ChatSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
};

type ChatResponse = {
  chat: ChatSummary;
  messages?: UIMessage[];
};

const ChatSidebarSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div className="rounded-md px-2 py-2" key={index}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    ))}
  </div>
);

const ConversationSkeleton = () => (
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

const RagChatBot = () => {
  const [input, setInput] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(defaultChatModel.id);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loadedChatId, setLoadedChatId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<UIMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const lastSavedSignatureRef = useRef("");

  const persistMessages = useCallback(
    async (chatId: string, nextMessages: UIMessage[]) => {
      if (nextMessages.length === 0) {
        return;
      }

      const signature = `${chatId}:${JSON.stringify(nextMessages)}`;

      if (lastSavedSignatureRef.current === signature) {
        return;
      }

      lastSavedSignatureRef.current = signature;

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to save chat");
      }

      const data = (await response.json()) as { title?: string };

      setChats((currentChats) => {
        const updatedChats = currentChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                title: data.title ?? chat.title,
                messageCount: nextMessages.length,
                updatedAt: new Date().toISOString(),
              }
            : chat
        );

        return updatedChats.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    },
    []
  );

  const { error, messages, sendMessage, setMessages, status } = useChat({
    id: activeChatId ?? "pending-chat",
    messages: activeChatId === loadedChatId ? loadedMessages : [],
    onFinish: ({ messages: finishedMessages }) => {
      if (activeChatId) {
        void persistMessages(activeChatId, finishedMessages);
      }
    },
  });
  const isChatBusy = status === "submitted" || status === "streaming";
  const selectedModel =
    chatModels.find((model) => model.id === selectedModelId) ??
    defaultChatModel;

  const createChat = useCallback(async () => {
    const response = await fetch("/api/chats", { method: "POST" });

    if (!response.ok) {
      throw new Error("Failed to create chat");
    }

    const data = (await response.json()) as ChatResponse;

    setChats((currentChats) => [data.chat, ...currentChats]);
    setActiveChatId(data.chat.id);
    setLoadedChatId(data.chat.id);
    setLoadedMessages([]);
    setMessages([]);
    lastSavedSignatureRef.current = "";
    setInput("");

    return data.chat;
  }, [setMessages]);

  const loadChat = useCallback(
    async (chatId: string) => {
      setActiveChatId(chatId);
      setInput("");
      setIsSidebarOpen(false);

      const response = await fetch(`/api/chats/${chatId}`);

      if (!response.ok) {
        throw new Error("Failed to load chat");
      }

      const data = (await response.json()) as ChatResponse;

      setLoadedChatId(chatId);
      setLoadedMessages(data.messages ?? []);
      lastSavedSignatureRef.current = `${chatId}:${JSON.stringify(
        data.messages ?? []
      )}`;
    },
    []
  );

  const loadChats = useCallback(async () => {
    setIsLoadingChats(true);

    try {
      const response = await fetch("/api/chats");

      if (!response.ok) {
        throw new Error("Failed to load chats");
      }

      const data = (await response.json()) as { chats: ChatSummary[] };
      setChats(data.chats);

      if (data.chats[0]) {
        await loadChat(data.chats[0].id);
      } else {
        await createChat();
      }
    } finally {
      setIsLoadingChats(false);
    }
  }, [createChat, loadChat]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadChats();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadChats]);

  useEffect(() => {
    if (activeChatId === loadedChatId) {
      setMessages(loadedMessages);
    }
  }, [activeChatId, loadedChatId, loadedMessages, setMessages]);

  useEffect(() => {
    if (status === "error" && activeChatId) {
      void persistMessages(activeChatId, messages);
    }
  }, [activeChatId, messages, persistMessages, status]);

  const handleNewChat = async () => {
    if (isChatBusy) {
      return;
    }

    await createChat();
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (isChatBusy || deletingChatId) {
      return;
    }

    setDeletingChatId(chatId);

    try {
      const response = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setChats(remainingChats);

      if (activeChatId === chatId) {
        if (remainingChats[0]) {
          await loadChat(remainingChats[0].id);
        } else {
          await createChat();
        }
      }
    } finally {
      setDeletingChatId(null);
    }
  };

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text || !activeChatId || isChatBusy) {
      return;
    }

    sendMessage(
      {
        text: message.text,
      },
      {
        body: { chatId: activeChatId, modelId: selectedModelId },
      }
    );
    setInput("");
  };

  const sidebar = (
    <aside className="flex h-full min-h-0 w-72 shrink-0 flex-col border-r bg-background">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-3">
        <p className="text-sm font-semibold">Chats</p>
        <div className="flex items-center gap-1">
          <Button
            aria-label="New chat"
            disabled={isLoadingChats || isChatBusy}
            onClick={handleNewChat}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Plus />
          </Button>
          <Button
            aria-label="Close sidebar"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
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
                onClick={() => void loadChat(chat.id)}
                type="button"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{chat.title}</span>
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
                      This will permanently delete &quot;{chat.title}&quot; and its
                      messages. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                      disabled={isDeleting}
                      onClick={() => void handleDeleteChat(chat.id)}
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

  return (
    <main className="relative h-[calc(100svh-4rem)] overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 md:hidden">
          <div className="h-full w-72 max-w-[82vw] border-r bg-background">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex h-full min-h-0">
        <div className="hidden md:block">{sidebar}</div>

        <section className="mx-auto flex h-full min-w-0 flex-1 flex-col px-3 sm:px-4">
          <div className="flex h-11 items-center gap-2 md:hidden">
            <Button
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Menu />
            </Button>
            <Button
              className="gap-1"
              disabled={isLoadingChats || isChatBusy}
              onClick={handleNewChat}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus />
              New chat
            </Button>
          </div>

          <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pb-3 sm:pb-5">
            <Conversation className="scrollbar-none">
              <ConversationContent className="scrollbar-none">
                {isLoadingChats ? (
                  <ConversationSkeleton />
                ) : messages.length === 0 && (
                  <div className="flex min-h-[calc(100svh-18rem)] items-center justify-center text-center">
                    <p className="text-sm text-foreground/30">
                      No chats yet. Ask something to get started.
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id}>
                    {message.parts.map((part, index) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <Fragment key={`${message.id}-${index}`}>
                              <Message from={message.role}>
                                <MessageContent>
                                  <MessageResponse className="font-sans text-sm font-normal leading-6">
                                    {part.text}
                                  </MessageResponse>
                                </MessageContent>
                              </Message>
                            </Fragment>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                ))}

                {(status === "submitted" || status === "streaming") && (
                  <Loader className="animate-spin" size={20} />
                )}

                {status === "error" && error && (
                  <Message from="assistant">
                    <MessageContent>
                      <p className="text-sm leading-6 text-destructive">
                        {error.message.includes("quota")
                          ? "The AI provider quota is currently exhausted. Please wait a moment and try again."
                          : "I could not generate a response. Please try again."}
                      </p>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <PromptInput
              className="mt-4 **:data-[slot=input-group-control]:focus-visible:outline-none **:data-[slot=input-group-control]:focus-visible:ring-0 **:data-[slot=input-group]:focus-within:border-input **:data-[slot=input-group]:focus-within:outline-none **:data-[slot=input-group]:focus-within:ring-0"
              onSubmit={handleSubmit}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  className="min-h-24 font-sans text-sm font-normal leading-6 focus:outline-0 placeholder:font-sans placeholder:text-sm placeholder:font-normal sm:min-h-28"
                  disabled={!activeChatId || isLoadingChats}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={
                    activeChatId ? "What would you like to know?" : "Loading chat..."
                  }
                  value={input}
                />
              </PromptInputBody>

              <PromptInputFooter>
                <PromptInputTools>
                  <ModelSelector
                    onOpenChange={setIsModelSelectorOpen}
                    open={isModelSelectorOpen}
                  >
                    <ModelSelectorTrigger
                      render={
                        <PromptInputButton
                          className="max-w-48 gap-1.5"
                          disabled={isChatBusy}
                          tooltip="Switch model"
                        />
                      }
                    >
                      <ModelSelectorLogo provider={selectedModel.providerSlug} />
                      <ModelSelectorName>{selectedModel.name}</ModelSelectorName>
                      <ChevronsUpDown className="size-3 text-muted-foreground" />
                    </ModelSelectorTrigger>
                    <ModelSelectorContent>
                      <ModelSelectorInput placeholder="Search models..." />
                      <ModelSelectorList>
                        <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                        {["Google", "OpenAI"].map((providerName) => (
                          <ModelSelectorGroup
                            heading={providerName}
                            key={providerName}
                          >
                            {chatModels
                              .filter(
                                (model) => model.providerName === providerName
                              )
                              .map((model) => (
                                <ModelSelectorItem
                                  key={model.id}
                                  onSelect={() => {
                                    setSelectedModelId(model.id);
                                    setIsModelSelectorOpen(false);
                                  }}
                                  value={model.id}
                                >
                                  <ModelSelectorLogo
                                    provider={model.providerSlug}
                                  />
                                  <ModelSelectorName>
                                    {model.name}
                                  </ModelSelectorName>
                                  {selectedModelId === model.id && (
                                    <Check className="ml-auto size-4" />
                                  )}
                                </ModelSelectorItem>
                              ))}
                          </ModelSelectorGroup>
                        ))}
                      </ModelSelectorList>
                    </ModelSelectorContent>
                  </ModelSelector>
                </PromptInputTools>
                <PromptInputSubmit status={status} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      </div>

    </main>
  );
};

export default RagChatBot;
