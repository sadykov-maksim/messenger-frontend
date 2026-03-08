import React from "react";
import {cn} from "@/lib/utils";

interface ControlButtonProps {
    onClick: () => void
    active: boolean
    label: string
    icon: React.ReactNode
}

function ControlButton({ onClick, active, label, icon }: ControlButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 transition-all active:scale-95",
                active ? "bg-white text-slate-900" : "bg-white/8 text-white hover:bg-white/12"
            )}
            style={!active ? { backgroundColor: "rgba(255,255,255,0.08)" } : {}}
        >
            <span className="flex h-6 items-center justify-center">{icon}</span>
            <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "text-slate-700" : "text-white/50"
            )}>
                {label}
            </span>
        </button>
    )
}