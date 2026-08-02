import { useCallback, useEffect, useState } from "react"
import { getOpeningBalance, setOpeningBalance } from "@/lib/openingBalance"

export function useOpeningBalance(month: Date) {
  const [openingBalance, setOpeningBalanceState] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const value = await getOpeningBalance(month)
      setOpeningBalanceState(value)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const save = async (balance: number) => {
    await setOpeningBalance(month, balance)
    setOpeningBalanceState(balance)
  }

  return { openingBalance, loading, save, refresh }
}
