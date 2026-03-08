import * as React from "react"
import {JSX, Suspense} from "react"
import type { Metadata } from "next"

import Loading from "@/components/loading"
import SiteMetricsClient from "@/components/dashboard/site-metrics/site-metrics-client"

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Аналитика посещаемости, источников трафика и ключевых показателей эффективности сайта",
}

export default function PrivacyPage() {
    return (
        <Suspense fallback={<Loading />}>
            <h1>Privacy Policy</h1>
        </Suspense>
    )
}