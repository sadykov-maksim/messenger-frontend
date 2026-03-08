"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

type IntegrationStatus = "connected" | "disconnected"

type Integration = {
    id: string
    title: string
    badge: string
    description: string
    img: string
    status: IntegrationStatus
}

import { useRouter } from "next/navigation"


export default function Home() {
    const router = useRouter()

    const [items, setItems] = React.useState<Integration[]>([
        {
            id: "bitrix24",
            title: "Bitrix24",
            badge: "Аналитика",
            description: "Синхронизация лидов, сделок и менеджеров для KPI и аналитики.",
            img: "/integrations/bitrix24.png",
            status: "disconnected",
        },
        {
            id: "telegram",
            title: "Telegram",
            badge: "Уведомления",
            description: "Авторизация, уведомления и события через Telegram-бота.",
            img: "/integrations/telegram.png",
            status: "disconnected",
        },
        {
            id: "yandex-oauth",
            title: "Yandex OAuth 2.0",
            badge: "Аналитика",
            description: "Доступ к данным Яндекса для аналитики и привязки ClientID.",
            img: "/integrations/yandex-oauth.png",
            status: "disconnected",
        },
        {
            id: "calltouch",
            title: "Calltouch",
            badge: "Аналитика",
            description: "Коллтрекинг и связка звонков с рекламными источниками.",
            img: "/integrations/calltouch.png",
            status: "disconnected",
        },
        {
            id: "ga",
            title: "Google Analytics",
            badge: "Аналитика",
            description: "События, конверсии и источники трафика в одном месте.",
            img: "/integrations/google-analytics.png",
            status: "connected",
        },
    ])

    const [open, setOpen] = React.useState(false)
    const [selectedId, setSelectedId] = React.useState<string | null>(null)

    const selected = React.useMemo(
        () => items.find((x) => x.id === selectedId) ?? null,
        [items, selectedId]
    )



    const openConnectModal = (id: string) => {
        setSelectedId(id)
        setOpen(true)
    }

    const confirmConnect = () => {
        if (!selectedId) return
        setItems((prev) =>
            prev.map((x) =>
                x.id === selectedId ? { ...x, status: "connected" } : x
            )
        )
        setOpen(false)
        router.push(`/dashboard/integrations/${selectedId}/connect`)

    }

    const disconnect = (id: string) => {
        setItems((prev) =>
            prev.map((x) => (x.id === id ? { ...x, status: "disconnected" } : x))
        )
    }


    return (
        <div className="flex flex-1 flex-col gap-6 mt-5">
            <div className="px-4 lg:px-6">
                <div className="grid gap-5 mb-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                    {items.map((it) => {
                        const connected = it.status === "connected"

                        return (
                            <Card key={it.id} className="relative pt-0 flex flex-col">
                                <div className="absolute inset-0 z-30 aspect-video " />
                                <img
                                    src={it.img}
                                    alt={it.title}
                                    className="relative z-20 aspect-video w-full object-cover rounded-lg"
                                />
                                <CardHeader className="min-w-0 flex-1">
                                    <CardAction>
                                        <Badge variant="secondary">{it.badge}</Badge>
                                    </CardAction>
                                    <CardTitle className="w-full break-words">
                                        {it.title}
                                    </CardTitle>

                                    <CardDescription className="w-full break-words">
                                        {it.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto">
                                    {connected ? (
                                        <Button
                                            className="w-full"
                                            variant="destructive"
                                            onClick={() => disconnect(it.id)}
                                        >
                                            Отключить
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => openConnectModal(it.id)}
                                        >
                                            Подключить
                                        </Button>
                                        )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
                {/* Modal */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Подключить {selected?.title ?? "интеграцию"}
                            </DialogTitle>
                            <DialogDescription>
                                Подтвердите подключение. После этого интеграция будет отмечена как
                                «Подключено».
                            </DialogDescription>
                        </DialogHeader>

                        <div className="rounded-lg border p-3 text-sm">
                            <div className="font-medium">{selected?.title}</div>
                            <div className="text-muted-foreground">{selected?.description}</div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Отмена
                            </Button>
                            <Button onClick={confirmConnect}>Подключить</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}