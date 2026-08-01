import { Outlet } from "react-router"
import { BottomNav } from "./BottomNav"

export function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      <Outlet />
      <BottomNav />
    </div>
  )
}
