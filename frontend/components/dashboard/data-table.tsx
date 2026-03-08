"use client"

import * as React from "react"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconCircleCheckFilled,
    IconDotsVertical,
    IconGripVertical,
    IconLayoutColumns,
    IconLoader,
    IconPlus,
    IconTrendingUp,
} from "@tabler/icons-react"
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type Row,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {TableToolbarRight} from "@/components/dashboard/table-toolbar-right";
import {DateRange} from "react-day-picker";
import {Spinner} from "@/components/ui/spinner";
import {Briefcase, FileText, List, Trophy, XCircle} from "lucide-react"

export const schema = z.object({
    id: z.number(),
    title: z.string(),

    // можно строкой, но ты ниже используешь source_meta.name / status_meta.name
    source: z.string().optional(),
    status: z.string().optional(),

    responsible: z.string(),

    // meta (то что в таблице)
    source_meta: z
        .object({
            id: z.union([z.string(), z.number()]).optional(),
            name: z.string(),
        })
        .optional(),

    status_meta: z
        .object({
            id: z.union([z.string(), z.number()]).optional(),
            name: z.string(),
        })
        .optional(),

    // --- DIRECT / UTM ---
    utm_source: z.string().nullable().optional(),
    utm_medium: z.string().nullable().optional(),
    utm_campaign: z.string().nullable().optional(),
    utm_content: z.string().nullable().optional(),
    utm_term: z.string().nullable().optional(),

    ad_campaign_name: z.string().nullable().optional(),
    ad_campaign_id: z.string().nullable().optional(),

    client_id: z.string().nullable().optional(),
    yclid: z.string().nullable().optional(),
    gclid: z.string().nullable().optional(),

    // --- CALLTOUCH ---
    ct_status: z.string().nullable().optional(),
    ct_calls_count: z.number().nullable().optional(),
    ct_leads_count: z.number().nullable().optional(),
    ct_total_talk_sec: z.number().nullable().optional(),

    ct_channel: z.string().nullable().optional(),
    ct_source: z.string().nullable().optional(),
    ct_campaign: z.string().nullable().optional(),
    ct_keyword: z.string().nullable().optional(),

    ct_last_call_at: z.string().nullable().optional(),
    ct_last_call_sec: z.number().nullable().optional(),
    ct_client_phone: z.string().nullable().optional(),
    ct_tracking_phone: z.string().nullable().optional(),
    ct_record_url: z.string().nullable().optional(), // НЕ url(), иначе упадёт если пусто/невалидно

    ct_events: z.array(z.any()).optional(),
})
export type Metrics = {
    totalLoaded: number
    new: number
    noAnswer: number
    qualification: number
    offer: number
    tender: number
    backlog: number
    contract: number
    fulfillment: number
    won: number
    lost: number
    activeTotal: number
}

type DealsApiResponse = {
    rows?: z.infer<typeof schema>[]
    metrics?: Metrics
    error?: string
}

function UtmRow({
                    label,
                    value,
                }: {
    label: string
    value?: string | null
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            {value ? (
                <Badge variant="secondary" className="truncate max-w-[240px]">
                    {value}
                </Badge>
            ) : (
                <span className="text-muted-foreground">—</span>
            )}
        </div>
    )
}

function InfoRow({
                     label,
                     value,
                 }: {
    label: string
    value?: string | null
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="font-medium truncate">
        {value || "—"}
      </span>
        </div>
    )
}
function MiniStat({ label, value }: { label: string; value: any }) {
    const shown = value === 0 ? "0" : value ? String(value) : "—"
    return (
        <div className="rounded-md border bg-background p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-base font-semibold mt-1">{shown}</div>
        </div>
    )
}

function formatSeconds(sec?: number | null) {
    if (!sec && sec !== 0) return "—"
    const s = Math.max(0, Math.floor(sec))
    const mm = Math.floor(s / 60)
    const ss = s % 60
    return mm > 0 ? `${mm}м ${String(ss).padStart(2, "0")}с` : `${ss}с`
}

function compact(v?: string | null) {
    const t = (v || "").trim()
    return t ? t : "—"
}


function DealDetailDrawer({
                              deal,
                              open,
                              onOpenChange
                          }: {
    deal: z.infer<typeof schema> | null,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {
    if (!deal) return null;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="fixed right-0 top-0 mt-0 h-full w-full rounded-none sm:w-[650px]">
                <DrawerHeader className="border-b">
                    <DrawerTitle className="text-xl">{deal.title}</DrawerTitle>
                    <DrawerDescription>ID сделки: {deal.id}</DrawerDescription>
                </DrawerHeader>

                <Tabs defaultValue="general" className="mx-4 my-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">Общая</TabsTrigger>
                        <TabsTrigger value="direct">Директ</TabsTrigger>
                        <TabsTrigger value="calltouch">Колтач</TabsTrigger>
                    </TabsList>

                    {/* Scroll-зона контента одна на все вкладки */}
                    <div className="mt-0 h-[calc(100vh-100px)]  overflow-hidden pr-1">
                        <TabsContent value="general" className="m-0">
                            <div className="p-6 space-y-6  overflow-hidden h-[calc(100vh-200px)]">
                                {/* Секция основной информации */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Статус</Label>
                                        <div><Badge variant="secondary">{deal.status}</Badge></div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Источник</Label>
                                        <div><Badge variant="outline">{deal.source}</Badge></div>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-muted-foreground">Ответственный</Label>
                                        <div className="font-medium">{deal.responsible}</div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Пример дополнительных полей, которых нет в схеме, но могут быть в будущем */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm">Детализация</h4>
                                    <div className="grid gap-4 p-4 bg-muted/30 rounded-lg border">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Дата создания:</span>
                                            <span>—</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Сумма:</span>
                                            <span className="font-bold text-primary">0 ₽</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="direct" className="m-0">
                            <div className="p-4 space-y-6">
                                <h4 className="text-sm font-semibold">Яндекс Директ</h4>

                                {/* UTM метки */}
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">
                                        UTM-метки
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <UtmRow label="utm_source" value={deal.utm_source} />
                                        <UtmRow label="utm_medium" value={deal.utm_medium} />
                                        <UtmRow label="utm_campaign" value={deal.utm_campaign} />
                                        <UtmRow label="utm_content" value={deal.utm_content} />
                                        <UtmRow label="utm_term" value={deal.utm_term} />
                                    </div>
                                </div>

                                {/* Кампания */}
                                <div className="rounded-lg border p-4 space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">
                                        Рекламная кампания
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <InfoRow label="Название" value={deal.ad_campaign_name} />
                                        <InfoRow label="ID кампании" value={deal.ad_campaign_id} />
                                    </div>
                                </div>

                                {/* Идентификаторы клиента */}
                                <div className="rounded-lg border p-4 space-y-3">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">
                                        Идентификаторы клиента
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <InfoRow label="Client ID" value={deal.client_id} />
                                        <InfoRow label="YCLID" value={deal.yclid} />
                                        <InfoRow label="GCLID" value={deal.gclid} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="calltouch" className="m-0">
                            <div className="p-4 space-y-6">
                                <h4 className="text-sm font-semibold">Calltouch</h4>

                                {/* Сводка */}
                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-xs font-medium text-muted-foreground uppercase">
                                            Сводка
                                        </div>
                                        {deal.ct_status ? (
                                            <Badge variant={deal.ct_status === "matched" ? "secondary" : "outline"}>
                                                {deal.ct_status === "matched" ? "Найдено" : "Не найдено"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">—</Badge>
                                        )}
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-3">
                                        <MiniStat label="Звонков" value={deal.ct_calls_count} />
                                        <MiniStat label="Заявок" value={deal.ct_leads_count} />
                                        <MiniStat label="Время" value={formatSeconds(deal.ct_total_talk_sec)} />
                                    </div>
                                </div>

                                {/* Атрибуция */}
                                <div className="rounded-lg border p-4 space-y-3">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">
                                        Атрибуция
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <InfoRow label="Канал" value={deal.ct_channel} />
                                        <InfoRow label="Источник" value={deal.ct_source} />
                                        <InfoRow label="Кампания" value={deal.ct_campaign} />
                                        <InfoRow label="Ключевая фраза" value={deal.ct_keyword} />
                                    </div>
                                </div>

                                {/* Последний звонок */}
                                <div className="rounded-lg border p-4 space-y-3">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">
                                        Последний звонок
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <InfoRow label="Дата/время" value={deal.ct_last_call_at} />
                                        <InfoRow label="Длительность" value={formatSeconds(deal.ct_last_call_sec)} />
                                        <InfoRow label="Номер клиента" value={deal.ct_client_phone} />
                                        <InfoRow label="Номер подмены" value={deal.ct_tracking_phone} />
                                    </div>

                                    <Separator className="my-2" />

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Запись</span>
                                        {deal.ct_record_url ? (
                                            <Button asChild variant="outline" size="sm">
                                                <a href={deal.ct_record_url} target="_blank" rel="noreferrer">
                                                    Открыть
                                                </a>
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </div>

                                {/* История обращений (если есть) */}
                                <div className="rounded-lg border p-4 space-y-3">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">
                                        История обращений
                                    </div>

                                    {deal.ct_events?.length ? (
                                        <div className="space-y-2">
                                            {deal.ct_events.slice(0, 6).map((e: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start justify-between gap-3 rounded-md border bg-background p-3"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium">
                                                            {e.type === "call" ? "Звонок" : "Заявка"}{" "}
                                                            <span className="text-muted-foreground font-normal">
                    {e.at || "—"}
                  </span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {compact([e.channel, e.source, e.campaign].join(" • "))}
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-sm font-medium">
                                                            {e.type === "call" ? formatSeconds(e.talk_sec) : (e.form_name || "—")}
                                                        </div>
                                                        {e.record_url ? (
                                                            <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                                                                <a href={e.record_url} target="_blank" rel="noreferrer">
                                                                    Запись
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            <div className="text-xs text-muted-foreground"> </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">
                                            История обращений не найдена.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <DrawerFooter className="border-t">
                    <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({
        id,
    })

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 hover:bg-transparent"
        >
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
        accessorKey: "title",
        header: "Название",
        cell: ({ row }) => (
            <Button variant="link" className="text-foreground w-fit px-0 text-left">
                {row.original.title}
            </Button>
        ),
        enableHiding: false,
    },
    {
        accessorKey: "source",
        header: "Источник",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.source_meta?.name ?? row.original.source ?? "—"}
            </Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.status_meta?.name ?? row.original.status ?? "—"}
            </Badge>
        ),
    },
    {
        accessorKey: "responsible",
        header: "Ответственный",
        cell: ({ row }) => row.original.responsible,
    },
]

function DraggableRow({row, onRowClick}: {
    row: Row<z.infer<typeof schema>>,
    onRowClick: (deal: z.infer<typeof schema>) => void
}) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
            onClick={() => onRowClick(row.original)}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell
                    key={cell.id}
                    onClick={(e) => {
                        // Если кликнули по ячейке с перетаскиванием, не открываем модалку
                        if (cell.column.id === "drag") e.stopPropagation();
                    }}
                >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

function MetricItem({ label, value, color = "text-foreground" }: { label: string, value: number, color?: string }) {
    return (
        <div className="flex flex-col border-l pl-3 first:border-l-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {label}
            </span>
            <span className={`flex justify-center text-sm font-bold ${color}`}>
                <Badge variant="outline" className="text-muted-foreground px-1.5 mt-1.5" >
                    <span className={`${color}`}>{value.toLocaleString()}</span>
                </Badge>
            </span>
        </div>
    )
}

export function DataTable({data: initialData,
                              isLoading, // <-- Новый проп
                              onFiltersChange,
                              metrics: externalMetrics // Добавьте этот проп, если передаете метрики сверху
                          }: {
    data: z.infer<typeof schema>[]
    isLoading?: boolean
    onFiltersChange?: (filters: { dateRange?: DateRange; category?: string }) => void
    metrics?: Metrics | null
}) {
    const [allData, setAllData] = React.useState(initialData)

    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )
    React.useEffect(() => { setAllData(initialData) }, [initialData])

    const [activeTab, setActiveTab] = React.useState("qualified")

    const qualifiedLeads = React.useMemo(() => allData.filter(item => item.status === "C7:17"), [allData])
    const newLeads = React.useMemo(() => allData.filter(item => item.status === "C7:NEW"), [allData])

    const displayData = React.useMemo(() => {
        if (activeTab === "qualified") return qualifiedLeads
        if (activeTab === "new") return newLeads
        return allData
    }, [activeTab, qualifiedLeads, newLeads, allData])

    const displayIds = React.useMemo<UniqueIdentifier[]>(() => displayData.map((x) => x.id), [displayData])


    const table = useReactTable({
        data: displayData,
        columns,
        state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    const dataIds = React.useMemo<UniqueIdentifier[]>(() => allData?.map(({ id }) => id) || [], [allData])

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setAllData((data) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return arrayMove(data, oldIndex, newIndex)
            })
        }
    }

    const counts = React.useMemo(() => {
        const qualified = qualifiedLeads.length
        const newCount = newLeads.length
        const all = allData.length
        return { qualified, new: newCount, all }
    }, [qualifiedLeads.length, newLeads.length, allData.length])

    const [selectedDeal, setSelectedDeal] = React.useState<z.infer<typeof schema> | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

    const handleRowClick = React.useCallback((deal: z.infer<typeof schema>) => {
        setSelectedDeal(deal);
        setIsDrawerOpen(true);
    }, []);

    return (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}
              className="w-full flex-col justify-start gap-6">
            <div className={"flex flex-col w-full px-2 lg:px-2 "}>
                {externalMetrics && (
                    <div className="hidden xl:flex items-center gap-4 mx-4 bg-muted/30 p-2 rounded-lg border">
                        <MetricItem label="Всего" value={externalMetrics.totalLoaded} />
                        <MetricItem label="В работе" value={externalMetrics.activeTotal} color="text-blue-600" />
                        <MetricItem label="Победы" value={externalMetrics.won} color="text-green-600" />
                        <MetricItem label="Проигрыши" value={externalMetrics.lost} color="text-red-500" />
                        <MetricItem label="Тендеры" value={externalMetrics.tender} />
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    View
                </Label>
                <Select value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <SelectTrigger
                        className="flex w-fit @4xl/main:hidden"
                        size="sm"
                        id="view-selector"
                    >
                        <SelectValue placeholder="Select a view" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Всего</SelectItem>
                        <SelectItem value="activeTotal">В работе</SelectItem>
                        <SelectItem value="qualified">Победы</SelectItem>
                        <SelectItem value="lost">Проигрыши</SelectItem>
                        <SelectItem value="tender">Тендеры</SelectItem>
                    </SelectContent>
                </Select>
                <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                        <List className="size-4" />
                        <span>Всего</span>
                    </TabsTrigger>

                    <TabsTrigger value="activeTotal" className="flex items-center gap-2 px-4 data-[state=active]:text-blue-500">
                        <Briefcase className="size-4" />
                        <span>В работе</span>
                    </TabsTrigger>

                    <TabsTrigger value="qualified" className="flex items-center gap-2 px-4 data-[state=active]:text-green-600">
                        <Trophy className="size-4" />
                        <span>Победы</span>
                    </TabsTrigger>

                    <TabsTrigger value="lost" className="flex items-center gap-2 px-4 data-[state=active]:text-red-500">
                        <XCircle className="size-4" />
                        <span>Проигрыши</span>
                    </TabsTrigger>

                    <TabsTrigger value="tender" className="flex items-center gap-2 px-4 data-[state=active]:text-amber-500">
                        <FileText className="size-4" />
                        <span>Тендеры</span>
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                    <TableToolbarRight table={table} onFiltersChange={onFiltersChange} />
                </div>
            </div>
            <TabsContent
                value={activeTab}
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-background/50 backdrop-blur-[1px]">
                        <Spinner className="animate-spin size-6 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Обновляю данные...
                        </span>
                    </div>
                )}
                <div className="overflow-hidden rounded-lg border">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader className="bg-muted sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {table.getRowModel().rows?.length ? (
                                    <SortableContext
                                        items={displayIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {table.getRowModel().rows.map((row) => (
                                            <DraggableRow key={row.id} row={row} onRowClick={handleRowClick}  />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
                <DealDetailDrawer
                    deal={selectedDeal}
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                />
                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Строк на странице
                            </Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                    <SelectValue
                                        placeholder={table.getState().pagination.pageSize}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Страница {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Перейти на первую страницу</span>
                                <IconChevronsLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Перейти на предыдущую страницу</span>
                                <IconChevronLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Перейти к следующей странице</span>
                                <IconChevronRight />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Перейти к последней странице</span>
                                <IconChevronsRight />
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent
                value="past-performance"
                className="flex flex-col px-4 lg:px-6"
            >
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
            <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
            <TabsContent
                value="focus-documents"
                className="flex flex-col px-4 lg:px-6"
            >
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
        </Tabs>
    )
}
