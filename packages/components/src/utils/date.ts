export const ONE_DAY = 86_400
export const ONE_YEAR = 365 * ONE_DAY  // 31_536_000
export const MIN_REGISTRATION_SECONDS = 28 * ONE_DAY  // 2_419_200

/** "YYYY-MM-DD" string for <input type="date"> value, from Unix expiry timestamp */
export const secondsToDateInput = (expirySeconds: number): string => {
  const date = new Date(expirySeconds * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Duration in seconds from nowSeconds to midnight of valueAsDate (day-aligned) */
export const roundDurationWithDay = (valueAsDate: Date, nowSeconds: number): number => {
  const endMidnight = new Date(valueAsDate.getTime())
  endMidnight.setHours(0, 0, 0, 0)
  const startMidnight = new Date(nowSeconds * 1000)
  startMidnight.setHours(0, 0, 0, 0)
  return Math.floor((endMidnight.getTime() - startMidnight.getTime()) / 1000)
}

/** Calendar-aware seconds for N whole years from startDate (handles leap years) */
export const secondsFromYears = (startDate: Date, years: number): number => {
  const end = new Date(startDate.getTime())
  end.setFullYear(end.getFullYear() + years)
  return Math.floor((end.getTime() - startDate.getTime()) / 1000)
}

/** Fractional years from duration seconds */
export const yearsFromSeconds = (seconds: number): number => seconds / ONE_YEAR

/**
 * Human-readable duration label for display.
 * Examples: "1 year", "2 years", "6 months, 3 days", "28 days"
 * Shows at most 2 parts; omits days when years are present.
 */
export const formatDurationSummary = (durationSeconds: number): string => {
  const now = new Date()
  const end = new Date(now.getTime() + durationSeconds * 1000)

  let years = end.getFullYear() - now.getFullYear()
  let months = end.getMonth() - now.getMonth()
  let days = end.getDate() - now.getDate()

  if (days < 0) {
    months -= 1
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const parts: string[] = []
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`)
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`)
  if (days > 0 && years === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)

  return parts.slice(0, 2).join(', ') || '0 days'
}
