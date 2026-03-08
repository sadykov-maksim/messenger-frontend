"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"


export function useBitrixLeadChart(from?: string, to?: string) {
    const [data, setData] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const q = new URLSearchParams()
        if (from) q.set("from", from)
        if (to) q.set("to", to)



        setLoading(true)
        fetch(`/api/bitrix/chart/leads?${q.toString()}`, { cache: "no-store" })
            .then((r) => r.json())
            .then(setData)
            .finally(() => setLoading(false))
    }, [from, to])

    return { data, loading }
}

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    desktop: {
        label: "Всего лидов",
        color: "var(--primary)",
    },
    mobile: {
        label: "Квалифицированные",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function ChartAreaInteractive() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])


    function isoDate(offsetDays: number) {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        d.setDate(d.getDate() + offsetDays)
        return d.toISOString().slice(0, 10) // YYYY-MM-DD
    }

    const days =
        timeRange === "7d" ? 7 :
            timeRange === "30d" ? 30 :
                90

    const from = React.useMemo(() => isoDate(-days + 1), [days])
    const to = React.useMemo(() => isoDate(0), [])

    const { data, loading } = useBitrixLeadChart(from, to)
    const filteredData = React.useMemo(() => data, [data])

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Всего сделок</CardTitle>
                <CardDescription>
                      <span className="hidden @[540px]/card:block">
                        Итого за последние 3 месяца
                      </span>
                    <span className="@[540px]/card:hidden">Последние 3 месяца</span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">Последние 3 месяца</ToggleGroupItem>
                        <ToggleGroupItem value="30d">Последние 30 дней</ToggleGroupItem>
                        <ToggleGroupItem value="7d">Последние 7 дней</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={1.0}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-desktop)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="qualified"
                            type="natural"
                            fill="url(#fillMobile)"
                            stroke="var(--color-mobile)"
                            stackId="a"
                        />
                        <Area
                            dataKey="total"
                            type="natural"
                            fill="url(#fillDesktop)"
                            stroke="var(--color-desktop)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
