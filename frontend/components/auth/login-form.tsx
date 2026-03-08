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
import {ComponentProps, useCallback, useState} from "react";
import TelegramIcon from "@/components/icons";
import {ArrowRight, Eye, EyeOff, IdCard, MessageSquareMore, Phone} from "lucide-react";
import {useRouter} from "next/navigation";
import {useRequestSMSMutation, useAuthSSOMutation} from "@/services/auth";
import { toast } from "sonner"
import {setupE2EKeys} from "@/lib/crypto";
import {setupE2EKeysThunk} from "@/services/crypto";
import {useAppDispatch} from "@/lib/hook";


type LoginMode = "sso" | "sms"


export function LoginForm({className, ...props}: ComponentProps<"div">) {
    const [showPassword, setShowPassword] = useState(false)
    const [loginMode, setLoginMode] = useState<LoginMode>("sms")
    const router = useRouter()
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // 123
    const [requestSMS, { isLoading: requestLoading, error: errorRequest }] = useRequestSMSMutation();
    const [authSSO, { isLoading: ssoLoading, error: errorSSO }] = useAuthSSOMutation();

    const [userNotFound, setUserNotFound] = useState(false);
    const dispatch = useAppDispatch();
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

    const handleLogin = useCallback(async () => {
        switch (loginMode) {
            case "sms":
                try {
                    await requestSMS({ phone }).unwrap()
                    setUserNotFound(false)
                    toast.success("Проверьте SMS на вашем телефоне")
                    router.push("/auth/two-factor")
                } catch (error: any) {
                    const { errorMessage, errorCode } = extractApiErrorMessage(error)
                    if (errorCode === "USER_NOT_FOUND") {
                        setUserNotFound(true)
                        toast.error("Проверьте номер или зарегистрируйтесь", {
                            action: {
                                label: "Регистрация",
                                onClick: () => router.push("/auth/sign-up"),
                            },
                        })
                        return
                    }
                    toast.error(errorMessage)
                }
                break

            case "sso":
                try {
                    await authSSO({ email, password }).unwrap()
                    await dispatch(setupE2EKeysThunk())
                    setUserNotFound(false)
                    toast.success("Авторизация завершена.")
                    router.push("/messenger")
                } catch (error: any) {
                    const { errorMessage, errorCode } = extractApiErrorMessage(error)
                    if (errorCode === "USER_NOT_FOUND") {
                        setUserNotFound(true)
                        toast.error("Проверьте номер или зарегистрируйтесь", {
                            action: {
                                label: "Регистрация",
                                onClick: () => router.push("/auth/sign-up"),
                            },
                        })
                        return
                    }
                    toast.error(errorMessage)
                }
                break

            default:
                toast.error("Неверный режим входа")
        }
    }, [loginMode, phone, email, password, requestSMS, authSSO, router, dispatch])


    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8"
                          onSubmit={(e) => {
                              e.preventDefault()
                    }}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold uppercase">Workload</h1>
                                <p className="text-muted-foreground text-balance">
                                    Получите неограниченный доступ ко всей информации в одном месте
                                </p>
                            </div>
                            { loginMode === "sso" ? (
                                <>
                                    <Field>
                                        <FieldLabel htmlFor="email">Эл. почта</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"  // было "username" — невалидный тип
                                            placeholder="email@workload-dashboard.ru"
                                            value={email}
                                            onChange={handleEmailChange}
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor="password">Пароль</FieldLabel>
                                        </div>

                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Пароль для входа"
                                                value={password}
                                                onChange={handlePasswordChange}
                                                required
                                                className="pr-10"
                                            />

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">
                                                    {showPassword ? "Скрыть пароль" : "Показать пароль"}
                                                </span>
                                            </Button>
                                        </div>
                                        <a
                                            href="/auth/forgot-password"
                                            className="ml-auto text-sm underline-offset-2 hover:underline text-right"
                                        >
                                            Забыли пароль?
                                        </a>
                                    </Field>
                                </>
                            ) : (
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
                                    <FieldDescription>
                                        На этот номер будет отправлен код подтверждения
                                    </FieldDescription>
                                </Field>
                            )}
                            <Field>
                                <Button
                                    className="group flex items-center gap-2"
                                    onClick={handleLogin}
                                >
                                    <span className="transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-90">
                                      Продолжить
                                    </span>
                                    <ArrowRight className="h-4 w-4 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-90" />
                                </Button>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Другие способы
                            </FieldSeparator>
                            <Field className="grid grid-cols-1 gap-4">
                                {loginMode === "sso" ? (
                                    <Button variant="outline" type="button" onClick={() => setLoginMode("sms")}>
                                        <MessageSquareMore width={24} height={24} />
                                        Войти с помощью SMS-кода
                                        <span className="sr-only">Войти с помощью SMS-кода</span>
                                    </Button>
                                ) : (
                                    <Button variant="outline" type="button" onClick={() => setLoginMode("sso")}>
                                        <IdCard width={24} height={24} />
                                        Войти с помощью SSO
                                        <span className="sr-only">Войти с помощью SSO</span>
                                    </Button>
                                )}
                                <Button variant="outline" type="button">
                                    <TelegramIcon width={24} height={24} />
                                    Войти с помощью Telegram
                                    <span className="sr-only">Войти с помощью Telegram</span>
                                </Button>
                            </Field>
                            <FieldDescription className="text-center">
                                У вас нет учетной записи? <a href="/auth/sign-up">Создать аккаунт</a>
                            </FieldDescription>
                        </FieldGroup>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="/placeholder.jpg"
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                Нажимая продолжить, вы соглашаетесь с нашими <a href="/terms" target={"_blank"}>Условиями предоставления услуг</a>{" "}
                и <a href="/privacy" target={"_blank"}>Политикой конфиденциальности</a>.
            </FieldDescription>
        </div>
    )
}
