"use client";

import { type ReactNode, useState } from "react";
import { Clock3, Cpu, Home, LogOut, Recycle, ScanLine } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Scan Waste",
    href: "/scan",
    icon: ScanLine,
  },
  {
    label: "History",
    href: "/history",
    icon: Clock3,
  },
  {
    label: "Tech Stack",
    href: "/tech-stack",
    icon: Cpu,
  },
];

type AppShellProps = {
  avatarFallback?: string;
  children: ReactNode;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function AppShell({
  avatarFallback = "U",
  children,
  title,
  eyebrow,
  action,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setIsSigningOut(true);
    setLogoutError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLogoutError("Logout failed. Please try again.");
      setIsSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Recycle className="size-4" aria-hidden="true" />
          </div>
          <span className="text-base font-semibold">EcoScan AI</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                  "h-10 justify-start gap-3 px-3",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t p-4">
          {logoutError ? (
            <p className="text-xs text-destructive" role="alert">
              {logoutError}
            </p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full justify-start gap-3 px-3"
            disabled={isSigningOut}
            onClick={handleLogout}
          >
            <LogOut className="size-4" aria-hidden="true" />
            {isSigningOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:hidden">
                <Recycle className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-sm text-muted-foreground">{eyebrow}</p>
                ) : null}
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  {title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {action}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isSigningOut}
                aria-label="Logout"
                onClick={handleLogout}
              >
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
              <Avatar>
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({
                      variant: isActive ? "secondary" : "ghost",
                      size: "sm",
                    }),
                    "shrink-0 gap-2",
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
