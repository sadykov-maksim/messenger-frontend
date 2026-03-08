import * as React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"

import Loading from "@/components/loading"
import SiteMetricsClient from "@/components/dashboard/site-metrics/site-metrics-client"

export const metadata: Metadata = {
    title: "Метрики сайта",
    description: "Аналитика посещаемости, источников трафика и ключевых показателей эффективности сайта",
}

export default function Home() {
    return (
        <Suspense fallback={<Loading />}>
            <SiteMetricsClient />
        </Suspense>
    )
}