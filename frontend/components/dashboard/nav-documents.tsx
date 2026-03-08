"use client"

import {
    IconDots,
    IconFolder,
    IconShare3,
    IconTrash,
    type Icon,
} from "@tabler/icons-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {usePathname} from "next/navigation";
import Link from "next/link";

export function NavDocuments({
                                 items,
                             }: {
    items: {
        title: string
        url: string
        icon: Icon
    }[]
}) {
    const { isMobile } = useSidebar()
    const pathname = usePathname()

    const isItemActive = (itemUrl: string) => {
        if (!itemUrl || itemUrl === "#") return false
        return pathname === itemUrl || pathname.startsWith(itemUrl + "/")
    }

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Управление и отчеты</SidebarGroupLabel>
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
                            <Link href={item.url} aria-current={active ? "page" : undefined}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction
                                    showOnHover
                                    className="data-[state=open]:bg-accent rounded-sm"
                                >
                                    <IconDots />
                                    <span className="sr-only">Больше</span>
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-24 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}
                            >
                                <DropdownMenuItem>
                                    <IconFolder />
                                    <span>Открыть</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <IconShare3 />
                                    <span>Поделиться</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive">
                                    <IconTrash />
                                    <span>Удалить</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
