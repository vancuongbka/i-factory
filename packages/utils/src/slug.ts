export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateCode(prefix: string, id: string | number): string {
  const suffix = String(id).padStart(6, '0');
  return `${prefix.toUpperCase()}-${suffix}`;
}
