import React from "react";
import {Spinner} from "@heroui/spinner";

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <Spinner className="h-14 w-14 animate-spin text-primary-500"/>
            <p className="max-w-xs text-center text-lg font-semibold text-primary-500 animate-pulse">
                Загружаем...
            </p>
        </div>
    )
}