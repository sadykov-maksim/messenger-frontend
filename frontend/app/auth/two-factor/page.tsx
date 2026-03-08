import { TwoFactorForm} from "@/components/auth/2fa-form"

export default function TwoFactorPage() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <TwoFactorForm />
            </div>
        </div>
    )
}
