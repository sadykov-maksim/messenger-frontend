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
    { age: "above55", clicks: 387, fill: "#1e3a8a" },      // Старше 55 (Dark Blue)
    { age: "25_34", clicks: 172, fill: "#3b82f6" },        // 25-34 (Blue)
    { age: "unknown", clicks: 168, fill: "#94a3b8" },      // Не определено (Slate)
    { age: "35_44", clicks: 151, fill: "#60a5fa" },        // 35-44 (Sky Blue)
    { age: "45_54", clicks: 122, fill: "#2563eb" },        // 45-54 (Royal Blue)
    { age: "18_24", clicks: 5, fill: "#2dd4bf" },          // 18-24 (Teal) — добавил 5 для видимости
]

const totalClicks = chartData.reduce((acc, curr) => acc + curr.clicks, 0)

const chartConfig = {
    clicks: {
        label: "Кликов",
    },
    "18_24": {
        label: "18-24",
        color: "var(--chart-1)",
    },
    "25_34": {
        label: "25-34",
        color: "var(--chart-2)",
    },
    "35_44": {
        label: "35-44",
        color: "var(--chart-3)",
    },
    "45_54": {
        label: "45-54",
        color: "var(--chart-4)",
    },
    above55: {
        label: "Старше 55",
        color: "var(--chart-5)",
    },
    unknown: {
        label: "Не определено",
        color: "var(--chart-5)",
    },


} satisfies ChartConfig

export function AgeChartDonut() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Аудитория: Возраст — Click Direct</CardTitle>
                <CardDescription>Статистика по возрастным группам</CardDescription>
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
                            nameKey="age"
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
                    Группа "Старше 55" лидирует (38.7%) <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none text-center">
                    Основной трафик поступает от взрослой аудитории
                </div>
            </CardFooter>
        </Card>
    )
}