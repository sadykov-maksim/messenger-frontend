"use client";

import { MessageCircle, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPlaceholderReimagined() {
    const focusSearchInput = () => {
        const searchInput = document.querySelector('[data-sidebar="input"]') as HTMLInputElement;
        if (searchInput) {
            searchInput.focus();
        }
    };
    return (
        <div className="flex h-full  w-full flex-col items-center justify-center bg-zinc-50/50 p-4 dark:bg-zinc-950/50 select-none">
            <div className="relative mx-auto flex max-w-[420px] flex-col items-center gap-6 rounded-2xl border border-dashed border-border/60 bg-background p-10 text-center shadow-sm">

                {/* Визуальный акцент с композицией из иконок */}
                <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageCircle className="h-8 w-8" />
                    </div>
                </div>

                {/* Текстовый блок */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        Здесь пока тихо
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Выберите диалог в меню слева или создайте новый, чтобы начать переписку с коллегами.
                    </p>
                </div>

                {/* Интерактивный блок с действиями */}
                <div className="flex w-full flex-col gap-3 pt-2">
                    <Button className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        Создать новый чат
                    </Button>
                    <Button variant="outline" className="w-full gap-2 text-muted-foreground justify-start" onClick={focusSearchInput}>
                        <Search className="h-4 w-4" />
                        <span className="flex-1 text-left">Найти собеседника</span>
                        <div className="flex items-center gap-1 opacity-70">
                            <kbd className="inline-flex h-4 items-center rounded bg-muted px-1.5 font-mono text-[10px] font-medium">⌘</kbd>
                            <kbd className="inline-flex h-4 items-center rounded bg-muted px-1.5 font-mono text-[10px] font-medium">K</kbd>
                        </div>
                    </Button>
                </div>

            </div>
        </div>
    );
}