"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {ComponentProps, useState} from "react";
import TelegramIcon from "@/components/icons";
import {Eye, EyeOff, Phone, UserPlus} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useRegisterUserMutation} from "@/services/auth";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem, SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {LanguageCombobox} from "@/components/language-combobox";
import {RegionCombobox} from "@/components/region-combobox";
import {TimeZoneCombobox} from "@/components/timezone-combobox";
import {REGION_DEFAULTS} from "@/lib/region-defaults";
import {setupE2EKeys} from "@/lib/crypto";
export function RegisterForm({className, ...props}: ComponentProps<"div">) {
    const [showPassword, setShowPassword] = useState(false)
    const [showRePassword, setShowRePassword] = useState(false)
    const [phone, setPhone] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [agreed, setAgreed] = useState(false)

    const router = useRouter()
    const [registerUser, { isLoading }] = useRegisterUserMutation()

    const formatPhoneNumber = (value: string, prevValue: string) => {
        const cleaned = value.replace(/\D/g, '');

        if (cleaned.length === 0) return '';

        const digits = cleaned.startsWith('7') ? cleaned : `7${cleaned}`;
        const limited = digits.substring(0, 11);

        if (limited.length <= 1) return `+7`;
        if (limited.length <= 4) return `+7 (${limited.slice(1)}`;
        if (limited.length <= 7) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4)}`;
        if (limited.length <= 9) return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}`;
        return `+7 (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9, 11)}`;
    };

    const handleFullNameChange = (value: string, setter: (v: string) => void) => {
        const cleaned = value
            .replace(/[^\p{L}-]/gu, '')
            .slice(0, 50)

        const formatted =
            cleaned.charAt(0).toUpperCase() + cleaned.slice(1)

        setter(formatted)
    }
    const [language, setLanguage] = useState("")
    const [region, setRegion] = useState("")
    const [timezone, setTimezone] = useState("")
    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value, phone);
        setPhone(formatted);
    };

    const extractApiErrorMessage = (error: any) => {
        let errorMessage = "Неизвестная ошибка"
        let errorCode: string | null = null

        const apiErrors = error?.data
        if (apiErrors && typeof apiErrors === "object") {
            if (apiErrors.code) {
                errorCode = apiErrors.code
                errorMessage = apiErrors.detail || errorMessage
            }

            const entries = Object.entries(apiErrors)
            for (const [field, messages] of entries) {
                if (Array.isArray(messages) && messages.length > 0) {
                    errorMessage = `${field}: ${messages[0]}`
                    break
                } else if (typeof messages === "string" && field !== "code") {
                    errorMessage = messages
                    break
                }
            }
        } else if (typeof error?.error === "string") {
            errorMessage = error.error
        }

        return { errorMessage, errorCode }
    }

    async function handleSignUp() {
        if (!agreed) {
            toast.error("Примите пользовательское соглашение")
            return
        }
        if (password !== rePassword) {
            toast.error("Пароли не совпадают")
            return
        }

        if (!region || !language || !timezone) {
            toast.error("Пожалуйста, заполните региональные настройки");
            return;
        }

        const cleanPhone = phone.replace(/\D/g, '')

        try {
            await registerUser({
                first_name: firstName,
                last_name: lastName,
                username: username,
                email: email,
                phone_number: cleanPhone,
                password: password,
                re_password: rePassword,
                consent_accepted: agreed,
                region: 1,
                language: 1,
                timezone: 1,
            }).unwrap()
            await setupE2EKeys()
            toast.success("Аккаунт успешно создан!")
            router.push("/auth/sign-in/")
        } catch (error: any) {
            const { errorMessage, errorCode } = extractApiErrorMessage(error)
            toast.error(errorMessage)
        }
    }


    const handleRegionChange = (value: string) => {
        setRegion(value)
        const defaults = REGION_DEFAULTS[value]
        if (defaults) {
            setLanguage(defaults.language)
            setTimezone(defaults.timezone)
        }
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-1">
                    <form className="p-6 md:p-8"
                          onSubmit={(e) => {
                              e.preventDefault()
                              handleSignUp()
                          }}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold uppercase">Регистрация</h1>
                                <p className="text-muted-foreground text-balance">
                                    Получите неограниченный доступ ко всей информации в одном месте
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="firstname">Имя</FieldLabel>
                                    <Input
                                        id="firstname"
                                        name="firstname"
                                        type="text"
                                        placeholder="Иван"
                                        required
                                        maxLength={33}
                                        value={firstName}
                                        onChange={(e) => handleFullNameChange(e.target.value, setFirstName)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="lastname">Фамилия</FieldLabel>
                                    <Input
                                        id="lastname"
                                        name="lastname"
                                        type="text"
                                        placeholder="Петров"
                                        required
                                        maxLength={33}
                                        value={lastName}
                                        onChange={(e) => handleFullNameChange(e.target.value, setLastName)}
                                    />
                                </Field>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="username">Имя пользователя</FieldLabel>
                                <Input
                                    id="username"
                                    type="username"
                                    placeholder="user"
                                    required
                                    value={username}
                                    onChange={handleUsernameChange}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Эл. почта</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@workload-crm.com"
                                    required
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="phone">Номер телефона</FieldLabel>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+7 (999) 000-00-00"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        maxLength={18}
                                        required
                                        className="pl-9"
                                    />
                                </div>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="region">Регион</FieldLabel>
                                <RegionCombobox
                                    value={region}
                                    onChange={handleRegionChange}
                                    className="w-full"
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="language">Язык</FieldLabel>

                                <LanguageCombobox
                                    value={language}
                                    onChange={setLanguage}
                                    className="w-full"
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="timezone">Часовой пояс</FieldLabel>
                                <TimeZoneCombobox
                                    value={timezone}
                                    onChange={setTimezone}
                                    className="w-full"
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password">Пароль</FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Минимум 8 символов"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                        autoComplete="new-password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm-password">Повторите пароль</FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Пароль еще раз"
                                        required
                                        value={rePassword}
                                        onChange={(e) => setRePassword(e.target.value)}
                                        className="pr-10"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </Field>
                            <Field className="grid grid-cols-[auto_1fr] items-start gap-3">
                                <Checkbox
                                    id="terms"
                                    checked={agreed}
                                    onCheckedChange={(v) => setAgreed(!!v)}
                                    required
                                    className="mt-1 min-w-[16px]"
                                />
                                <div className="grid gap-1">
                                    <label
                                        htmlFor="terms"
                                        className="text-sm leading-relaxed text-muted-foreground cursor-pointer select-none"
                                    >
                                        Я согласен с{" "}
                                        <a
                                            href="/terms"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            пользовательским соглашением
                                        </a>{" "}
                                        и{" "}
                                        <a
                                            href="/privacy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            политикой конфиденциальности
                                        </a>
                                    </label>
                                </div>
                            </Field>
                            <Field className="pt-2">
                                <Button type="submit" className="w-full flex items-center gap-2" >
                                    <UserPlus className="h-4 w-4" />
                                    Зарегистрироваться
                                </Button>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Другие способы
                            </FieldSeparator>
                            <Field className="grid grid-cols-1 gap-4">
                                <Button variant="outline" type="button">
                                    <TelegramIcon width={24} height={24} />
                                    Продолжить через Telegram
                                    <span className="sr-only">Продолжить через Telegram</span>
                                </Button>
                            </Field>
                            <FieldDescription className="text-center">
                                У меня уже есть аккаунт. <a href="/auth/sign-in">Войти в систему</a>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
