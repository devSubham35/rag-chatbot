"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";

import { Loader } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Fragment, useState } from "react";


const RagChatBot = () => {

  const [input, setInput] = useState<string>("");
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text) {
      return;
    }

    sendMessage({
      text: message.text,
    });
    setInput("");
  };

  return (
    <main className="relative mx-auto h-[calc(100svh-4rem)] w-full max-w-4xl px-3 sm:px-4">
      <div className="flex h-full min-h-0 flex-col pb-3 sm:pb-5">
        <Conversation className="scrollbar-none">
          <ConversationContent className="scrollbar-none">
            {messages.length === 0 && (
              <div className="flex min-h-[calc(100svh-18rem)] items-center justify-center text-center">
                <p className="text-foreground/30 text-sm">
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

            {(status === "submitted" || status === "streaming") && <Loader size={20} className="animate-spin" />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          className="mt-4 **:data-[slot=input-group]:focus-within:border-input **:data-[slot=input-group]:focus-within:ring-0 **:data-[slot=input-group]:focus-within:outline-none **:data-[slot=input-group-control]:focus-visible:ring-0 **:data-[slot=input-group-control]:focus-visible:outline-none"
          onSubmit={handleSubmit}
        >
          <PromptInputBody>
            <PromptInputTextarea
              className="min-h-24 sm:min-h-28 font-sans text-sm font-normal leading-6 
              focus:outline-0 placeholder:font-sans placeholder:text-sm placeholder:font-normal"
              onChange={(event) => setInput(event.target.value)}
              value={input}
            />
          </PromptInputBody>

          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} />
          </PromptInputFooter>

        </PromptInput>
      </div>
    </main>
  );
};

export default RagChatBot;
