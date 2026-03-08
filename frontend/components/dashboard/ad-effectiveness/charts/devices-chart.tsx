"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart, Legend } from "recharts" // Добавили Legend

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
    { browser: "chrome", clicks: 275, fill: "#FFC107" },  // Chrome Yellow
    { browser: "safari", clicks: 200, fill: "#007AFF" },  // Safari Blue
    { browser: "firefox", clicks: 187, fill: "#FF7139" }, // Firefox Orange
    { browser: "edge", clicks: 173, fill: "#10B981" },    // Edge Green
    { browser: "other", clicks: 90, fill: "#94A3B8" },     // Other Gray
]

const totalClicks = chartData.reduce((acc, curr) => acc + curr.clicks, 0)

const chartConfig = {
    clicks: {
        label: "Кликов",
    },
    chrome: {
        label: "Chrome",
        color: "var(--chart-1)",
    },
    safari: {
        label: "Safari",
        color: "var(--chart-2)",
    },
    firefox: {
        label: "Firefox",
        color: "var(--chart-3)",
    },
    edge: {
        label: "Edge",
        color: "var(--chart-4)",
    },
    other: {
        label: "Other",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function ChartPieDonut() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Устройства - Click Direct</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto min-h-[250px] w-full"
                >
                    <PieChart>
                        <ChartTooltip
                            content={<ChartTooltipContent nameKey="clicks" hideLabel />}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span className="text-xs font-medium">{chartConfig[value as keyof typeof chartConfig]?.label}</span>}
                        />
                        <Pie
                            data={chartData}
                            dataKey="clicks"
                            nameKey="browser"
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="80%"
                        >
                            <LabelList
                                dataKey="clicks"
                                position="inside"
                                fill="#FFFFFF"
                                className="font-bold"
                                stroke="none"
                                fontSize={12}
                                formatter={(value: number) => `${((value / totalClicks) * 100).toFixed(1)}%`}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Прирост кликов на 5.2% в этом месяце <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Общая статистика переходов за последние 6 месяцев
                </div>
            </CardFooter>
        </Card>
    )
}