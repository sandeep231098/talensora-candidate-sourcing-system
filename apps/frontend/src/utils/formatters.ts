export const formatEnumLabel = (value: string): string =>
  value
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')

export const formatDate = (
  value?: string | null,
): string => {
  if (!value) {
    return 'Not specified'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}