"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type ConnectType = "token" | "oauth" | "basic_token" | "api_token"

const CONFIG: Record<string, {
    title: string
    description: string
    type: ConnectType
    tags: string[]
}> = {
    "bitrix24": {
        title: "Bitrix24",
        description: "Подключение через входящий вебхук/токен портала.",
        type: "token",
        tags: ["Token", "Webhook"],
    },
    "yandex-oauth": {
        title: "Yandex OAuth 2.0",
        description: "Подключение через OAuth: вы перейдёте в Яндекс и подтвердите доступ.",
        type: "oauth",
        tags: ["OAuth", "Redirect"],
    },
    "calltouch": {
        title: "Calltouch",
        description: "Подключение через логин/пароль + API токен.",
        type: "basic_token",
        tags: ["Login", "Token"],
    },
    "ga": {
        title: "Google Analytics",
        description: "Подключение через API токен (или позже можно заменить на OAuth).",
        type: "api_token",
        tags: ["API Token"],
    },
    "telegram": {
        title: "Telegram",
        description: "Подключение бота и получение токена.",
        type: "token",
        tags: ["Bot Token"],
    },
}

export default function IntegrationConnectPage() {
    const params = useParams<{ slug: string }>()
    const router = useRouter()

    const id = params.slug

    const cfg = CONFIG[id]
    if (!cfg) {
        return (
            <div className="px-4 lg:px-6 py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Интеграция не найдена</CardTitle>
                        <CardDescription>Проверьте ссылку или ID интеграции.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => router.push("/integrations")}>
                            Назад
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full px-4 lg:px-6 py-6 ">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">Подключение: {cfg.title}</h1>
                        <div className="flex gap-2">
                            {cfg.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                        </div>
                    </div>
                    <p className="text-muted-foreground mt-1">{cfg.description}</p>
                </div>

                <Button variant="outline" onClick={() => router.push("/integrations")}>
                    К списку
                </Button>
            </div>

            <Separator className="my-4" />

            {cfg.type === "token" && <TokenForm id={id} />}
            {cfg.type === "oauth" && <OAuthBlock id={id} />}
            {cfg.type === "basic_token" && <BasicTokenForm id={id} />}
            {cfg.type === "api_token" && <ApiTokenForm id={id} />}
        </div>
    )
}

/** Bitrix/Telegram: токен или вебхук */
function TokenForm({ id }: { id: string }) {
    const [token, setToken] = React.useState("")
    const [domain, setDomain] = React.useState("")

    const onSave = async () => {
        // TODO: POST /api/integrations/connect
        // await fetch("/api/integrations/connect", { method:"POST", body: JSON.stringify({ id, token, domain }) })
        alert("Сохранено (заглушка)")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Данные подключения</CardTitle>
                <CardDescription>Введите токен/вебхук. Мы проверим доступ и сохраним.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {id === "bitrix24" && (
                    <div className="grid gap-2">
                        <Label>Домен портала</Label>
                        <Input placeholder="company.bitrix24.ru" value={domain} onChange={(e) => setDomain(e.target.value)} />
                    </div>
                )}

                <div className="grid gap-2">
                    <Label>Токен / Webhook</Label>
                    <Input placeholder="xxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
                </div>

                <div className="flex gap-2">
                    <Button onClick={onSave}>Сохранить</Button>
                    <Button variant="outline" onClick={() => alert("Проверка (заглушка)")}>
                        Проверить
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

/** Yandex OAuth */
function OAuthBlock({ id }: { id: string }) {
    const startOAuth = async () => {
        // Вариант 1: получить url с бэка и редиректнуть
        // const res = await fetch(`/api/integrations/${id}/oauth/url`)
        // const { url } = await res.json()
        // window.location.href = url

        // Заглушка:
        alert("Редирект на OAuth (заглушка)")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Подключение через OAuth</CardTitle>
                <CardDescription>Откроется страница провайдера, подтвердите доступ.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
                <Button onClick={startOAuth}>Подключить через Яндекс</Button>
                <Button variant="outline" onClick={() => alert("Инструкция (заглушка)")}>
                    Как это работает
                </Button>
            </CardContent>
        </Card>
    )
}

/** Calltouch: логин/пароль + токен */
function BasicTokenForm({ id }: { id: string }) {
    const [login, setLogin] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [token, setToken] = React.useState("")

    const onSave = async () => {
        alert("Сохранено (заглушка)")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Доступ Calltouch</CardTitle>
                <CardDescription>Укажите логин/пароль и API токен.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Логин</Label>
                    <Input value={login} onChange={(e) => setLogin(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label>Пароль</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label>API токен</Label>
                    <Input value={token} onChange={(e) => setToken(e.target.value)} />
                </div>

                <div className="flex gap-2">
                    <Button onClick={onSave}>Сохранить</Button>
                    <Button variant="outline" onClick={() => alert("Проверка (заглушка)")}>
                        Проверить
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

/** GA: API токен */
function ApiTokenForm({ id }: { id: string }) {
    const [token, setToken] = React.useState("")
    const [propertyId, setPropertyId] = React.useState("")

    const onSave = async () => {
        alert("Сохранено (заглушка)")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>API токен</CardTitle>
                <CardDescription>Введите токен и (опционально) идентификатор ресурса.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label>GA Property ID (опционально)</Label>
                    <Input placeholder="123456789" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
                </div>

                <div className="grid gap-2">
                    <Label>API токен</Label>
                    <Input value={token} onChange={(e) => setToken(e.target.value)} />
                </div>

                <div className="flex gap-2">
                    <Button onClick={onSave}>Сохранить</Button>
                    <Button variant="outline" onClick={() => alert("Проверка (заглушка)")}>
                        Проверить
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}