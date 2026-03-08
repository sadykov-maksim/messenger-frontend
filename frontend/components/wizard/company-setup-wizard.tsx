"use client"

import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Globe, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {
    closeWizard,
    nextStep,
    prevStep,
    patchForm,
    toggleFeature,
    setAvatarUrl,
    submitCompanyWizard,
    selectWizardOpen,
    selectWizardStep,
    selectWizardForm,
    selectWizardStatus,
    selectWizardError,
    type WizardFormValues,
    type FeatureId,
} from "@/lib/features/company_wizard/companyWizardSlice"
import {AppDispatch} from "@/lib/store";
import {useCreateCompanyMutation} from "@/services/companies_wizard";

// --- КОНСТАНТЫ ---

const featuresCatalog = [
    { id: "crm_kpi" as FeatureId, label: "KPI менеджеров (лиды/сделки/активности)" },
    { id: "ads" as FeatureId, label: "Реклама (Яндекс Директ / UTM / расходы)" },
    { id: "site_metrics" as FeatureId, label: "Метрика сайтов (посещения, конверсии)" },
    { id: "reports" as FeatureId, label: "Отчеты и срезы по отделам/командам" },
    { id: "integrations" as FeatureId, label: "Интеграции (Bitrix24, Метрика, Direct)" },
    { id: "alerts" as FeatureId, label: "Уведомления и отклонения KPI" },
]

const industries = [
    "B2B услуги",
    "E-commerce",
    "Производство",
    "Строительство",
    "Образование",
    "Медицина",
    "Недвижимость",
    "Маркетинговое агентство",
    "Другое",
] as const

const roles = [
    "Собственник / CEO",
    "Коммерческий директор",
    "Руководитель отдела продаж",
    "Маркетолог",
    "Аналитик",
    "IT / Интегратор",
    "Другое",
] as const

const teamSizes = [
    { value: "1-5", label: "1–5" },
    { value: "6-15", label: "6–15" },
    { value: "16-50", label: "16–50" },
    { value: "51-200", label: "51–200" },
    { value: "200+", label: "200+" },
] as const

const steps = [
    { id: 1, title: "Компания", desc: "Название и контекст" },
    { id: 2, title: "Сфера", desc: "Отрасль и специфика" },
    { id: 3, title: "Функции", desc: "Что будете использовать" },
    { id: 4, title: "Роль", desc: "Кто вы в компании" },
    { id: 5, title: "Команда", desc: "Размер и комментарий" },
] as const

// --- СХЕМА ВАЛИДАЦИИ (только для локальной проверки шагов) ---

const schema = z.object({
    companyName: z.string().min(2, "Введите название (минимум 2 символа)").max(120),
    website: z.string().optional(),
    industry: z.enum(industries as unknown as [string, ...string[]], { message: "Выберите сферу деятельности" }),
    industryCustom: z.string().optional(),
    plannedFeatures: z.array(z.string()).min(1, "Выберите хотя бы одну функцию"),
    role: z.enum(roles as unknown as [string, ...string[]], { message: "Выберите вашу роль" }),
    roleCustom: z.string().optional(),
    teamSize: z.enum(["1-5", "6-15", "16-50", "51-200", "200+"] as [string, ...string[]], {
        message: "Выберите размер команды",
    }),
    notes: z.string().max(500).optional(),
})

type LocalFormValues = z.infer<typeof schema>

const stepFields: Record<number, (keyof LocalFormValues)[]> = {
    1: ["companyName"],
    2: ["industry", "industryCustom"],
    3: ["plannedFeatures"],
    4: ["role", "roleCustom"],
    5: ["teamSize", "notes"],
}

// --- КОМПОНЕНТ ---

export function CompanySetupWizard() {
    const dispatch = useDispatch<AppDispatch>()
    const [createCompany, { isLoading: isCreating, error: createError }] =
        useCreateCompanyMutation();
    const open = useSelector(selectWizardOpen)
    const step = useSelector(selectWizardStep)
    const form = useSelector(selectWizardForm) ?? {
        companyName: "",
        website: "",
        industry: "B2B услуги",
        industryCustom: "",
        plannedFeatures: ["crm_kpi"],
        role: "Собственник / CEO",
        roleCustom: "",
        teamSize: "1-5",
        notes: "",
    }
    const status = useSelector(selectWizardStatus)
    const error = useSelector(selectWizardError)

    const isSubmitting = status === "loading"
    const progress = Math.round((step / steps.length) * 100)

    // react-hook-form используется только для локальной валидации шагов
    const {
        trigger,
        setValue,
        watch,
        reset,
        formState,
    } = useForm<LocalFormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            companyName: form.companyName,
            website: form.website ?? "",
            industry: form.industry,
            industryCustom: form.industryCustom ?? "",
            plannedFeatures: form.plannedFeatures,
            role: form.role,
            roleCustom: form.roleCustom ?? "",
            teamSize: form.teamSize,
            notes: form.notes ?? "",
        },
    })

    // Синхронизируем локальную форму с Redux при открытии
    React.useEffect(() => {
        if (open) {
            reset({
                companyName: form.companyName,
                website: form.website ?? "",
                industry: form.industry,
                industryCustom: form.industryCustom ?? "",
                plannedFeatures: form.plannedFeatures,
                role: form.role,
                roleCustom: form.roleCustom ?? "",
                teamSize: form.teamSize,
                notes: form.notes ?? "",
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Хелпер: изменить поле в локальной форме И в Redux
    const handleChange = <K extends keyof WizardFormValues>(
        field: K,
        value: WizardFormValues[K],
        validate = true
    ) => {
        setValue(field as keyof LocalFormValues, value as any, {
            shouldValidate: validate,
            shouldDirty: true,
        })
        dispatch(patchForm({ [field]: value }))
    }

    const handleNext = async () => {
        const fields = stepFields[step] ?? []
        const ok = await trigger(fields as any, { shouldFocus: true })
        if (!ok) return
        dispatch(nextStep())
    }

    const handleBack = () => {
        dispatch(prevStep())
    }

    const mapTeamSize = (v: string) => {
        switch (v) {
            case "1-5": return "2_5";       // у тебя в Django: 2–5
            case "6-15": return "6_15";
            case "16-50": return "16_50";
            case "51-200": return "51_200";
            case "200+": return "200_plus";
            default: return "solo";
        }
    };

    const handleFinish = async () => {
        const ok = await trigger(undefined, { shouldFocus: true });
        if (!ok) return;

        try {
            const payload = {
                name: form.companyName,
                website: form.website || "",
                task_short: form.notes || "",          // или отдельное поле, если хочешь
                team_size: mapTeamSize(form.teamSize), // см. маппер ниже
                analytics_wishes: form.notes || "",
            };
            const res = await createCompany(payload).unwrap();
            dispatch(closeWizard());
        } catch (e) {
            console.log(e,)
            // если хочешь в redux error: dispatch(setError(...))
            // но можно и так показывать createError
        }
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) dispatch(closeWizard())
    }

    const handleToggleFeature = (id: FeatureId) => {
        dispatch(toggleFeature(id))
        // Синхронизируем массив фич в локальную форму для валидации
        const next = form.plannedFeatures.includes(id)
            ? form.plannedFeatures.filter((x) => x !== id)
            : [...form.plannedFeatures, id]
        setValue("plannedFeatures", next, { shouldValidate: true, shouldDirty: true })
    }

    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
        form.avatarUrl ?? null
    )

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setAvatarPreview(url)
        // В реальном приложении здесь был бы upload, затем dispatch(setAvatarUrl(uploadedUrl))
        dispatch(setAvatarUrl(url))
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[760px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 flex flex-col h-full">
                    <DialogHeader className="space-y-1 mb-4">
                        <DialogTitle className="text-base">Мастер создания компании</DialogTitle>
                        <DialogDescription className="text-xs">
                            2–3 минуты — и мы настроим дашборд под вашу структуру и цели.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 flex-1 overflow-hidden">
                        {/* Прогресс */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Шаг {step} из {steps.length}
                                </span>
                                <span className="text-sm font-medium text-primary">
                                    {progress}% готово
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {steps.map((s) => {
                                    const active = s.id === step
                                    const done = s.id < step
                                    return (
                                        <div
                                            key={s.id}
                                            className={cn(
                                                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                                                active && "border-primary bg-primary/5",
                                                done && "opacity-80 bg-secondary"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
                                                    active && "border-primary bg-primary text-primary-foreground",
                                                    done && "border-primary bg-primary text-primary-foreground",
                                                    !active && !done && "border-muted-foreground/30 text-muted-foreground"
                                                )}
                                            >
                                                {s.id}
                                            </span>
                                            <span className={cn("font-medium", !active && "text-muted-foreground")}>
                                                {s.title}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <Separator />

                        {/* Тело */}
                        <div className="min-h-[260px] overflow-y-auto py-1 px-1">
                            {/* Шаг 1 */}
                            {step === 1 && (
                                <div className="grid gap-6">
                                    <div className="flex items-start gap-5">
                                        {/* Аватар */}
                                        <div className="flex-shrink-0">
                                            <Label
                                                htmlFor="avatar-upload"
                                                className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80 overflow-hidden border-2 border-dashed border-muted-foreground/20 hover:border-primary/50"
                                            >
                                                <Avatar className="h-full w-full">
                                                    <AvatarImage src={avatarPreview || ""} />
                                                    <AvatarFallback className="bg-transparent text-lg font-medium text-muted-foreground">
                                                        {form.companyName?.slice(0, 2).toUpperCase() || (
                                                            <Camera className="h-8 w-8 opacity-50" />
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </div>
                                                <Input
                                                    id="avatar-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarChange}
                                                />
                                            </Label>
                                            <p className="mt-2 text-center text-[10px] text-muted-foreground">
                                                Логотип
                                            </p>
                                        </div>

                                        {/* Поля */}
                                        <div className="flex-1 grid gap-4">
                                            <div className="grid gap-2.5">
                                                <Label htmlFor="companyName">Название компании</Label>
                                                <Input
                                                    id="companyName"
                                                    placeholder="Например: ООО «Название»"
                                                    value={form.companyName}
                                                    onChange={(e) => handleChange("companyName", e.target.value)}
                                                    autoFocus
                                                />
                                                {formState.errors.companyName?.message && (
                                                    <p className="text-xs text-destructive">
                                                        {formState.errors.companyName.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2.5">
                                                <Label htmlFor="website">Сайт компании (необязательно)</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="website"
                                                        className="pl-9"
                                                        placeholder="project.workload-dashboard.ru"
                                                        value={form.website ?? ""}
                                                        onChange={(e) => handleChange("website", e.target.value, false)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2.5">
                                        <Label htmlFor="notes">Коротко о задаче</Label>
                                        <Textarea
                                            id="notes"
                                            className="resize-none min-h-[80px]"
                                            placeholder="Например: хотим видеть KPI продаж по отделам + окупаемость рекламы"
                                            value={form.notes ?? ""}
                                            onChange={(e) => handleChange("notes", e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Это поможет предложить правильные срезы и отчеты.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Шаг 2 */}
                            {step === 2 && (
                                <div className="grid gap-3">
                                    <div className="grid gap-2.5">
                                        <Label>Сфера деятельности</Label>
                                        <Select
                                            value={form.industry}
                                            onValueChange={(v) => handleChange("industry", v as WizardFormValues["industry"])}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Выберите сферу" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {industries.map((x) => (
                                                    <SelectItem key={x} value={x}>{x}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formState.errors.industry?.message && (
                                            <p className="text-xs text-destructive">
                                                {formState.errors.industry.message}
                                            </p>
                                        )}
                                    </div>

                                    {form.industry === "Другое" && (
                                        <div className="grid gap-2.5">
                                            <Label htmlFor="industryCustom">Уточните сферу</Label>
                                            <Input
                                                id="industryCustom"
                                                placeholder="Например: логистика, HoReCa…"
                                                value={form.industryCustom ?? ""}
                                                onChange={(e) => handleChange("industryCustom", e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="rounded-lg border p-3 text-xs text-muted-foreground bg-muted/50">
                                        Под отрасль мы заранее подберем типовые отчеты (воронка, ROMI,
                                        скорость обработки лидов, эффективность менеджеров).
                                    </div>
                                </div>
                            )}

                            {/* Шаг 3 */}
                            {step === 3 && (
                                <div className="grid gap-3">
                                    <div className="grid gap-1">
                                        <Label>Какие функции планируете использовать</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Выберите — мы покажем релевантные виджеты и настройки.
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        {featuresCatalog.map((f) => {
                                            const checked = form.plannedFeatures.includes(f.id)
                                            return (
                                                <label
                                                    key={f.id}
                                                    className={cn(
                                                        "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/30",
                                                        checked && "border-primary/60 bg-primary/5"
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={() => handleToggleFeature(f.id)}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="grid gap-0.5">
                                                        <span className="text-sm font-medium leading-none">{f.label}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {f.id === "crm_kpi" && "Лиды, сделки, активность, выигрыши/проигрыши, нагрузка."}
                                                            {f.id === "ads" && "Расходы, лиды, CPL/CPA, связка с CRM по заявкам."}
                                                            {f.id === "site_metrics" && "Трафик, цели, конверсии, источники, посадочные."}
                                                            {f.id === "reports" && "Срезы по отделам/менеджерам/источникам/периодам."}
                                                            {f.id === "integrations" && "Подключение Bitrix24/Метрики/Директа и проверка доступа."}
                                                            {f.id === "alerts" && "Отклонения KPI, просрочки, падение конверсии."}
                                                        </span>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                        {formState.errors.plannedFeatures?.message && (
                                            <p className="text-xs text-destructive">
                                                {String(formState.errors.plannedFeatures.message)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Шаг 4 */}
                            {step === 4 && (
                                <div className="grid gap-3">
                                    <div className="grid gap-2.5">
                                        <Label>Кем вы являетесь в компании</Label>
                                        <Select
                                            value={form.role}
                                            onValueChange={(v) => handleChange("role", v as WizardFormValues["role"])}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Выберите роль" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((x) => (
                                                    <SelectItem key={x} value={x}>{x}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formState.errors.role?.message && (
                                            <p className="text-xs text-destructive">
                                                {formState.errors.role.message}
                                            </p>
                                        )}
                                    </div>

                                    {form.role === "Другое" && (
                                        <div className="grid gap-2.5">
                                            <Label htmlFor="roleCustom">Уточните роль</Label>
                                            <Input
                                                id="roleCustom"
                                                placeholder="Например: руководитель колл-центра"
                                                value={form.roleCustom ?? ""}
                                                onChange={(e) => handleChange("roleCustom", e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="rounded-lg border p-3 text-xs text-muted-foreground bg-muted/50">
                                        Роль влияет на стартовый набор виджетов и доступы: руководителю —
                                        сводка и динамика, маркетологу — ROMI/CPL, РОП — нагрузка и воронка.
                                    </div>
                                </div>
                            )}

                            {/* Шаг 5 */}
                            {step === 5 && (
                                <div className="grid gap-3">
                                    <div className="grid gap-2.5">
                                        <Label>Сколько сотрудников в компании</Label>
                                        <Select
                                            value={form.teamSize}
                                            onValueChange={(v) => handleChange("teamSize", v as WizardFormValues["teamSize"])}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Выберите размер" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teamSizes.map((x) => (
                                                    <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formState.errors.teamSize?.message && (
                                            <p className="text-xs text-destructive">
                                                {formState.errors.teamSize.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2.5">
                                        <Label htmlFor="notes2">Пожелания к аналитике (необязательно)</Label>
                                        <Textarea
                                            id="notes2"
                                            placeholder="Например: нужен отчет по отделам + фильтр по источникам + KPI по активности"
                                            value={form.notes ?? ""}
                                            onChange={(e) => handleChange("notes", e.target.value)}
                                        />
                                        {formState.errors.notes?.message && (
                                            <p className="text-xs text-destructive">
                                                {formState.errors.notes.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Ошибка сервера */}
                                    {error && (
                                        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
                                            {error}
                                        </div>
                                    )}

                                    <div className="rounded-lg border p-3 text-xs text-muted-foreground bg-muted/50">
                                        После создания компании можно будет подключить интеграции и пригласить сотрудников.
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Футер */}
                        <div className="flex items-center justify-end pt-2">
                            <div className="flex items-center gap-2">
                                {step > 1 && (
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={isSubmitting}
                                        className="gap-1.5"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Назад
                                    </Button>
                                )}

                                {step < steps.length ? (
                                    <Button
                                        onClick={handleNext}
                                        disabled={isSubmitting}
                                        className="gap-1.5"
                                    >
                                        Далее
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleFinish}
                                        disabled={isSubmitting || !formState.isValid}
                                    >
                                        {isSubmitting ? "Сохраняю..." : "Создать компанию"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}