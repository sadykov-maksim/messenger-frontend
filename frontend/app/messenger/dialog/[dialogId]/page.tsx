import PromptContainerWithConversation from "@/components/messenger/prompt-container-with-conversation";

export default async function DialogPage({params}: {
    params: Promise<{ dialogId: string }>
}) {
    const resolvedParams = await params;
    return (
        <PromptContainerWithConversation
            key={resolvedParams.dialogId}
            chatId={resolvedParams.dialogId}
            className="max-w-full px-0 h-full"
            scrollShadowClassname="flex-1 overflow-y-auto pr-2"
        />
    )
}