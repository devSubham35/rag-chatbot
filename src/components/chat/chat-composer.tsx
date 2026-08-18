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
import type { ChatModel } from "@/lib/chat-models";
import { chatModels } from "@/lib/chat-models";
import type { ChatStatus } from "ai";
import { Check, ChevronsUpDown } from "lucide-react";
import type { ChangeEvent } from "react";

type ChatComposerProps = {
  activeChatId: string | null;
  input: string;
  isChatBusy: boolean;
  isLoadingChats: boolean;
  isModelSelectorOpen: boolean;
  onInputChange: (value: string) => void;
  onModelSelectorOpenChange: (open: boolean) => void;
  onSelectedModelChange: (modelId: string) => void;
  onSubmit: (message: PromptInputMessage) => void;
  selectedModel: ChatModel;
  selectedModelId: string;
  status: ChatStatus;
};

export const ChatComposer = ({
  activeChatId,
  input,
  isChatBusy,
  isLoadingChats,
  isModelSelectorOpen,
  onInputChange,
  onModelSelectorOpenChange,
  onSelectedModelChange,
  onSubmit,
  selectedModel,
  selectedModelId,
  status,
}: ChatComposerProps) => {
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(event.target.value);
  };

  return (
    <PromptInput
      className="mt-4 **:data-[slot=input-group-control]:focus-visible:outline-none **:data-[slot=input-group-control]:focus-visible:ring-0 **:data-[slot=input-group]:focus-within:border-input **:data-[slot=input-group]:focus-within:outline-none **:data-[slot=input-group]:focus-within:ring-0"
      onSubmit={onSubmit}
    >
      <PromptInputBody>
        <PromptInputTextarea
          className="min-h-24 font-sans text-sm font-normal leading-6 focus:outline-0 placeholder:font-sans placeholder:text-sm placeholder:font-normal sm:min-h-28"
          disabled={!activeChatId || isLoadingChats}
          onChange={handleInputChange}
          placeholder={
            activeChatId ? "What would you like to know?" : "Loading chat..."
          }
          value={input}
        />
      </PromptInputBody>

      <PromptInputFooter>
        <PromptInputTools>
          <ModelSelector
            onOpenChange={onModelSelectorOpenChange}
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
                {["Google"].map((providerName) => (
                  <ModelSelectorGroup heading={providerName} key={providerName}>
                    {chatModels
                      .filter((model) => model.providerName === providerName)
                      .map((model) => (
                        <ModelSelectorItem
                          key={model.id}
                          onSelect={() => {
                            onSelectedModelChange(model.id);
                            onModelSelectorOpenChange(false);
                          }}
                          value={model.id}
                        >
                          <ModelSelectorLogo provider={model.providerSlug} />
                          <ModelSelectorName>{model.name}</ModelSelectorName>
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
  );
};
