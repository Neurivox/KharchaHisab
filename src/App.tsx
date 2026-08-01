import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { Toaster } from "sonner"
import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardPage } from "@/pages/Dashboard"
import { AddExpensePage } from "@/pages/AddExpense"
import { ExpensesPage } from "@/pages/Expenses"
import { SettingsPage } from "@/pages/Settings"

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="add" element={<AddExpensePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  )
}

export default App
