const pad = (value: number) => String(value).padStart(2, '0');

export const formatDateOnly = (value?: string | Date | null) => {
  if (!value) return '-';

  if (typeof value === 'string') {
    const directDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (directDateMatch) {
      return directDateMatch[1];
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : '-';
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getCurrentDateOnly = () => formatDateOnly(new Date());
