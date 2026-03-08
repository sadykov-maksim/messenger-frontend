"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building2 } from "lucide-react"
import { useDispatch } from "react-redux"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

import { openWizard } from "@/lib/features/company_wizard/companyWizardSlice"
import { useGetMyCompaniesQuery } from "@/services/companies_wizard"

type Company = {
    id: number
    name: string
    // logo?: string | null // если есть url логотипа
}

export function TeamSwitcher() {
    const { isMobile } = useSidebar()
    const dispatch = useDispatch()

    const { data: companies = [], isLoading, error } = useGetMyCompaniesQuery()

    // активная компания (id)
    const [activeCompanyId, setActiveCompanyId] = React.useState<number | null>(null)

    // выставляем первую компанию когда загрузились
    React.useEffect(() => {
        if (activeCompanyId == null && companies.length > 0) {
            setActiveCompanyId(companies[0].id)
        }
    }, [companies, activeCompanyId])

    const activeCompany = companies.find((c) => c.id === activeCompanyId) ?? null

    // если грузим — можно показать skeleton/placeholder
    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" disabled>
                        <div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">Загрузка...</span>
                            <span className="truncate text-xs text-muted-foreground">Проекты</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    // если ошибка
    if (error) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" onClick={() => dispatch(openWizard())}>
                        <div className="bg-destructive/10 text-destructive flex aspect-square size-8 items-center justify-center rounded-lg">
                            <Building2 className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">Не загрузилось</span>
                            <span className="truncate text-xs text-muted-foreground">Добавить проект</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    // если компаний нет
    if (!activeCompany) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" onClick={() => dispatch(openWizard())}>
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                            <Plus className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">Создать проект</span>
                            <span className="truncate text-xs text-muted-foreground">Нет проектов</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Building2 className="size-4" />
                            </div>

                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{activeCompany.name}</span>
                                <span className="truncate text-xs text-muted-foreground">Проект</span>
                            </div>

                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Проекты
                        </DropdownMenuLabel>

                        {companies.map((c, index) => (
                            <DropdownMenuItem
                                key={c.id}
                                onClick={() => setActiveCompanyId(c.id)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <Building2 className="size-3.5 shrink-0" />
                                </div>
                                {c.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="gap-2 p-2" onClick={() => dispatch(openWizard())}>
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground font-medium">Добавить проект</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}