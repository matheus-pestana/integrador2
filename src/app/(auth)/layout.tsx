import { Logo } from "@/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background/95 p-4">
        <div className="absolute top-8 left-8 flex items-center gap-3">
             <Logo className="w-8 h-8 shrink-0 text-primary" />
            <span className="font-headline text-lg font-bold text-foreground">
                MarketWise AI
            </span>
        </div>
        <div className="w-full max-w-md">
            {children}
        </div>
    </div>
  );
}