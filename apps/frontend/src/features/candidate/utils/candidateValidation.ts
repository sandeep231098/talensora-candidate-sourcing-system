export const MOBILE_NUMBER_HELPER_TEXT =
  'Include country code, e.g. +919876543210'

export const MOBILE_NUMBER_PATTERN =
  /^\+[1-9][0-9]{7,14}$/

export function isValidMobileNumber(
  mobileNumber: string,
): boolean {
  return MOBILE_NUMBER_PATTERN.test(
    mobileNumber.trim()
  )
}

export function currentLocalDate(): string {
  const now = new Date()
  const offset =
    now.getTimezoneOffset() * 60_000

  return new Date(
    now.getTime() - offset
  )
    .toISOString()
    .slice(0, 10)
}
