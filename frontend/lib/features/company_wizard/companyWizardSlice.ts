import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"

// --- ТИПЫ ---

export type Industry =
    | "B2B услуги"
    | "E-commerce"
    | "Производство"
    | "Строительство"
    | "Образование"
    | "Медицина"
    | "Недвижимость"
    | "Маркетинговое агентство"
    | "Другое"

export type Role =
    | "Собственник / CEO"
    | "Коммерческий директор"
    | "Руководитель отдела продаж"
    | "Маркетолог"
    | "Аналитик"
    | "IT / Интегратор"
    | "Другое"

export type TeamSize = "1-5" | "6-15" | "16-50" | "51-200" | "200+"

export type FeatureId =
    | "crm_kpi"
    | "ads"
    | "site_metrics"
    | "reports"
    | "integrations"
    | "alerts"

export interface WizardFormValues {
    companyName: string
    website?: string
    industry: Industry
    industryCustom?: string
    plannedFeatures: FeatureId[]
    role: Role
    roleCustom?: string
    teamSize: TeamSize
    notes?: string
    avatarUrl?: string // URL после загрузки (если нужен)
}

export interface CompanyWizardState {
    /** Текущий шаг (1–5) */
    step: number
    /** Открыт ли диалог */
    open: boolean
    /** Текущие значения формы */
    form: WizardFormValues
    /** Статус submit-запроса */
    status: "idle" | "loading" | "succeeded" | "failed"
    /** Сообщение об ошибке (если failed) */
    error: string | null
    /** ID созданной компании после успешного submit */
    createdCompanyId: string | null
}

// --- INITIAL STATE ---

const TOTAL_STEPS = 5

const initialForm: WizardFormValues = {
    companyName: "",
    website: "",
    industry: "B2B услуги",
    industryCustom: "",
    plannedFeatures: ["crm_kpi"],
    role: "Собственник / CEO",
    roleCustom: "",
    teamSize: "1-5",
    notes: "",
    avatarUrl: undefined,
}

const initialState: CompanyWizardState = {
    step: 1,
    open: false,
    form: initialForm,
    status: "idle",
    error: null,
    createdCompanyId: null,
}

// --- ASYNC THUNK ---

/**
 * Отправка формы на сервер.
 * Замените тело функции на реальный API-вызов.
 */
export const submitCompanyWizard = createAsyncThunk<
    { companyId: string }, // fulfilled payload
    WizardFormValues,       // аргумент
    { rejectValue: string } // rejectWithValue тип
>("companyWizard/submit", async (values, { rejectWithValue }) => {
    try {
        // Пример: замените на свой fetch / axios
        const response = await fetch("/api/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        })

        if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            return rejectWithValue(data?.message ?? "Ошибка сервера")
        }

        const data = await response.json()
        return { companyId: data.id as string }
    } catch (e) {
        return rejectWithValue("Нет соединения с сервером")
    }
})

// --- SLICE ---

const companyWizardSlice = createSlice({
    name: "companyWizard",
    initialState,
    reducers: {
        /** Открыть диалог (можно передать начальные значения) */
        openWizard(state, action: PayloadAction<Partial<WizardFormValues> | undefined>) {
            state.open = true
            state.step = 1
            state.status = "idle"
            state.error = null
            state.createdCompanyId = null
            state.form = { ...initialForm, ...action.payload }
        },

        /** Закрыть диалог и сбросить форму */
        closeWizard(state) {
            state.open = false
            state.step = 1
            state.status = "idle"
            state.error = null
            state.form = initialForm
        },

        /** Перейти к следующему шагу */
        nextStep(state) {
            if (state.step < TOTAL_STEPS) state.step += 1
        },

        /** Вернуться к предыдущему шагу */
        prevStep(state) {
            if (state.step > 1) state.step -= 1
        },

        /** Явно задать шаг */
        setStep(state, action: PayloadAction<number>) {
            const n = action.payload
            if (n >= 1 && n <= TOTAL_STEPS) state.step = n
        },

        /** Патч любого поля формы */
        patchForm(state, action: PayloadAction<Partial<WizardFormValues>>) {
            state.form = { ...state.form, ...action.payload }
        },

        /** Тогл одной фичи */
        toggleFeature(state, action: PayloadAction<FeatureId>) {
            const id = action.payload
            const idx = state.form.plannedFeatures.indexOf(id)
            if (idx === -1) {
                state.form.plannedFeatures.push(id)
            } else {
                state.form.plannedFeatures.splice(idx, 1)
            }
        },

        /** Установить URL аватара (после загрузки файла) */
        setAvatarUrl(state, action: PayloadAction<string>) {
            state.form.avatarUrl = action.payload
        },

        /** Сбросить только статус/ошибку (если нужно повторить) */
        resetStatus(state) {
            state.status = "idle"
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitCompanyWizard.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(submitCompanyWizard.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.createdCompanyId = action.payload.companyId
                state.open = false
                state.step = 1
                state.form = initialForm
            })
            .addCase(submitCompanyWizard.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload ?? "Неизвестная ошибка"
            })
    },
})

// --- ACTIONS ---

export const {
    openWizard,
    closeWizard,
    nextStep,
    prevStep,
    setStep,
    patchForm,
    toggleFeature,
    setAvatarUrl,
    resetStatus,
} = companyWizardSlice.actions

// --- SELECTORS ---

export const selectWizardOpen = (state: { companyWizard: CompanyWizardState }) =>
    state.companyWizard.open

export const selectWizardStep = (state: { companyWizard: CompanyWizardState }) =>
    state.companyWizard.step

export const selectWizardForm = (state: { companyWizard: CompanyWizardState }) =>
    state.companyWizard.form

export const selectWizardStatus = (state: { companyWizard: CompanyWizardState }) =>
    state.companyWizard.status

export const selectWizardError = (state: { companyWizard: CompanyWizardState }) =>
    state.companyWizard.error

export const selectCreatedCompanyId = (state: { companyWizard: CompanyWizardState }) =>
    state.companyWizard.createdCompanyId

export const selectIsSubmitting = (state: { companyWizard: CompanyWizardState }) =>
    state.companyWizard.status === "loading"

// --- REDUCER ---

export default companyWizardSlice.reducer