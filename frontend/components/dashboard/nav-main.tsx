"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {usePathname} from "next/navigation";

export function NavMain({items,}: {
    items: {
        title: string
        url: string
        icon?: Icon
    }[]
}) {
    const pathname = usePathname()

    const isItemActive = (itemUrl: string) => {
        if (!itemUrl || itemUrl === "#") return false
        // точное совпадение или вложенные роуты: /projects и /projects/123
        return pathname === itemUrl || pathname.startsWith(itemUrl + "/")
    }
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const active = isItemActive(item.url)

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={active}
                                >
                                    <Link href={`dashboard${item.url}`} aria-current={active ? "page" : undefined}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
