"use client";

import React from "react";
import { ScrollShadow } from "@heroui/react";
import { cn } from "@heroui/react";

import PromptInputWithBottomActions from "./prompt-input-with-bottom-actions";
import Conversation from "./conversation";

export default function PromptContainerWithConversation({chatId, className, scrollShadowClassname,}: {
    chatId: string;
    className?: string;
    scrollShadowClassname?: string;
}) {
    return (
        <div className={cn("flex h-full w-full max-w-full flex-col gap-4", className)}>
            <ScrollShadow className={cn("flex h-full flex-col", scrollShadowClassname)}>
                <Conversation chatId={chatId} />
            </ScrollShadow>

            <div className="flex flex-col gap-2">
                <PromptInputWithBottomActions chatId={chatId} />
            </div>
        </div>
    );
}