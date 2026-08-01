import { Link, useLocation } from "react-router"
import { Home, List, Plus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  to: string
  label: string
  icon: typeof Home
  exact?: boolean
  primary?: boolean
}

const navItems: NavItem[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/expenses", label: "List", icon: List },
  { to: "/add", label: "Add", icon: Plus, primary: true },
  { to: "/settings", label: "More", icon: Settings },
]

export function BottomNav() {
  const location = useLocation()

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <div className="nav-dock pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4">
      <nav
        className="nav-dock-inner pointer-events-auto mb-[max(0.75rem,env(safe-area-inset-bottom))] flex w-full max-w-sm items-stretch gap-1 rounded-2xl border border-border/60 bg-card/85 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-card/90 dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
        aria-label="Main navigation"
      >
        {navItems.map(({ to, label, icon: Icon, exact, primary }) => {
          const active = isActive(to, exact)

          if (primary) {
            return (
              <Link
                key={to}
                to={to}
                aria-label="Add expense"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2.5 transition-all active:scale-95",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-primary/90 text-primary-foreground hover:bg-primary"
                )}
              >
                <Icon className="size-5 stroke-[2.5]" />
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  {label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2.5 transition-colors active:scale-95",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active ? (
                <span className="absolute inset-0 rounded-xl bg-primary/10 dark:bg-primary/15" />
              ) : null}
              <Icon
                className={cn("relative size-5", active && "stroke-[2.5]")}
              />
              <span
                className={cn(
                  "relative text-[10px] font-medium",
                  active && "font-semibold"
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
