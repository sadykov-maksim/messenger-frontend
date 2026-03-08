"use client"
import {
    Bot,
    BotMessageSquare,
    GalleryVerticalEnd,
    HelpCircle,
    MessageSquareShare,
    Pencil,
    RefreshCw
} from "lucide-react"

import { cn } from "@/lib/utils"
import { FieldGroup } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Card,  CardContent } from "@/components/ui/card"
import { Field, FieldDescription } from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import {useCallback, useEffect, useState} from "react";
import {useRequestSMSMutation, useVerifySMSMutation} from "@/services/auth";
import {useDispatch} from "react-redux";
import {useRouter} from "next/navigation";


export function TwoFactorForm({className, ...props}: React.ComponentProps<"div">) {
    const [otpValue, setOtpValue] = useState("")
    const [isResending, setIsResending] = useState(false)
    const [resendTimer, setResendTimer] = useState(90)
    const [canResend, setCanResend] = useState(false)
    const router = useRouter()
    const dispatch = useDispatch()
    const phone = "+79000339071"

    const [verifySMS, { isLoading: isVerifying, error: errorVerify }] = useVerifySMSMutation()

    // Таймер повторной отправки
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setCanResend(true)
        }
    }, [resendTimer])

    useEffect(() => {
        if (otpValue.length === 6) {
            handleVerify(phone, otpValue)
        }
    }, [otpValue])

    const handleVerify = useCallback(async (phone, code) => {
        try {
            await verifySMS({ phone, code }).unwrap()
            router.push("/dashboard")
        } catch (err) {
            setOtpValue("")
            console.error("Ошибка верификации:", err)
        }
    }, [verifySMS, router])

    const handleResend = async () => {
        setIsResending(true)
        setCanResend(false)
        // TODO: вызвать useRequestSMSMutation здесь
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsResending(false)
        setResendTimer(30)
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={(e) => e.preventDefault()}>

                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a
                            href="#"
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <GalleryVerticalEnd className="size-6" />
                            </div>
                            <span className="sr-only">Workload</span>
                        </a>
                        <h1 className="text-xl font-bold">Подтвердите, что это вы</h1>
                        <FieldDescription>
                            Мы отправили SMS с кодом на ваш номер телефона{" "}
                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                +7 (999) 123-45-67
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-4 text-muted-foreground hover:text-foreground"
                                    onClick={() => {/* логика смены номера */}}
                                >
                                    <Pencil className="size-3" />
                                </Button>
                            </span>
                        </FieldDescription>
                    </div>
                    <Card className="mx-auto max-w-md">
                        <CardContent>
                            <Field>
                                <InputOTP maxLength={6} id="otp-verification"   required
                                          value={otpValue}
                                          onChange={setOtpValue}>
                                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator className="mx-2" />
                                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </Field>
                        </CardContent>
                    </Card>
                </FieldGroup>
                <div className="space-y-4 mt-4">
                    {!canResend && resendTimer > 0 && (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Повторная отправка доступна через {resendTimer} сек
                            </p>
                        </div>
                    )}

                    {canResend && (
                        <div className="flex items-center justify-center gap-2 text-center">
                            <FieldDescription className="text-center flex flex-col gap-1">
                                <span className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                                    <HelpCircle className="size-4 shrink-0" />
                                    Проверьте подключение к сети или правильность номера
                                </span>
                            </FieldDescription>
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Другие действия
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!canResend}
                            onClick={handleResend}
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw className="mr-2 size-4 animate-spin" />
                                    Отправка...
                                </>
                            ) : (
                                <>
                                    <MessageSquareShare className="mr-2 size-4" />
                                    Запросить повторно
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!canResend}
                            onClick={handleResend}
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw className="mr-2 size-4 animate-spin" />
                                    Отправка...
                                </>
                            ) : (
                                <>
                                    <BotMessageSquare className="mr-2 size-4" />
                                    Позвонить роботом
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
            <FieldDescription className="text-center">
                Возникли проблемы?{" "}
                <a href="#" className="text-primary hover:underline">
                    Связаться с поддержкой
                </a>
            </FieldDescription>
        </div>
    )
}
