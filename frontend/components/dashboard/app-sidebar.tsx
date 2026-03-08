"use client"

import * as React from "react"

import { NavDocuments } from "@/components/dashboard/nav-documents"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {BriefcaseBusiness} from "lucide-react";
import {dashboardNav} from "@/app/dashboard/nav-config";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "@/lib/features/auth/authSlice";
import {TeamSwitcher} from "@/components/team-switcher";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useSelector(selectCurrentUser)
    console.log("user", user)
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <BriefcaseBusiness className="!size-5" />
                                <span className="text-base font-semibold">Workload Dashboard</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarHeader>
                <TeamSwitcher teams={dashboardNav.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={dashboardNav.navMain} />
                <NavDocuments items={dashboardNav.documents} />
                <NavSecondary items={dashboardNav.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}
