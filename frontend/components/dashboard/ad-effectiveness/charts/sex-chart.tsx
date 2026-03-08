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
    { gender: "male", clicks: 540, fill: "#3b82f6" },
    { gender: "female", clicks: 420, fill: "#f472b6" },
    { gender: "unknown", clicks: 85, fill: "#94a3b8" },
]

const totalClicks = chartData.reduce((acc, curr) => acc + curr.clicks, 0)

const chartConfig = {
    clicks: {
        label: "Кликов",
    },
    male: {
        label: "Мужчины",
        color: "#3b82f6",
    },
    female: {
        label: "Женщины",
        color: "#f472b6",
    },
    unknown: {
        label: "Не указан",
        color: "#94a3b8",
    },
} satisfies ChartConfig

export function GenderChartDonut() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Пол — Click Direct</CardTitle>
                <CardDescription>Январь — Июнь 2024</CardDescription>
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
                            nameKey="gender"
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
                    Активность женщин выросла на 8% <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Распределение кликов по половому признаку
                </div>
            </CardFooter>
        </Card>
    )
}