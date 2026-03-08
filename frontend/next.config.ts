import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /** @type {import('next').NextConfig} */
    reactCompiler: true,
    allowedDevOrigins: ['workload-dashboard.ru', '*.workload-dashboard.ru'],
    typescript: {
        ignoreBuildErrors: true,
    },
    //async rewrites() {
    //    return [
    //        { source: "/ad-effectiveness", destination: "/dashboard/ad-effectiveness" },
    //        { source: "/kpi-managers", destination: "/dashboard/kpi-managers" },
    //        { source: "/projects", destination: "/dashboard/projects" },
    //        { source: "/reports", destination: "/dashboard/reports" },
    //        { source: "/integrations", destination: "/dashboard/integrations" },
    //        { source: "/report-designer", destination: "/dashboard/report-designer" },
    //        { source: "/business-assistant", destination: "/dashboard/business-assistant" },
    //        { source: "/site-metrics", destination: "/dashboard/site-metrics" },
    //    ]
    //},
};

if (process.env.NODE_ENV === 'production') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('Objects are not valid as a React child')) {
            console.error('=== НАЙДЕНА ПРОБЛЕМА ===');
            console.error('Аргументы:', JSON.stringify(args, null, 2));
            console.error('Стек:', new Error().stack);
        }
        originalConsoleError(...args);
    };
}

export default nextConfig;
