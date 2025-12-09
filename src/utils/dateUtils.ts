/**
 * Utilitaires pour gérer les dates dans l'application
 * Nécessaire car les Timestamps Firebase sont convertis en strings par l'API REST
 */

/**
 * Convertit une date quelconque en objet Date
 * Gère les Firebase Timestamps, les strings ISO, et les objets Date
 */
export function toDate(value: any): Date {
  // Si c'est déjà une Date
  if (value instanceof Date) {
    return value;
  }
  
  // Si c'est un Firebase Timestamp avec .toDate()
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  
  // Si c'est un objet Firebase Timestamp sérialisé {_seconds, _nanoseconds}
  if (value && typeof value === 'object' && '_seconds' in value) {
    return new Date(value._seconds * 1000);
  }
  
  // Si c'est un string ISO ou timestamp
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }
  
  // Fallback : date actuelle
  console.warn('Unable to convert value to Date:', value);
  return new Date();
}

/**
 * Convertit un objet contenant des dates
 * Applique toDate() sur tous les champs spécifiés
 */
export function convertDatesInObject<T>(obj: any, dateFields: string[]): T {
  if (!obj) return obj;
  
  const converted = { ...obj };
  
  for (const field of dateFields) {
    if (converted[field]) {
      converted[field] = toDate(converted[field]);
    }
  }
  
  return converted as T;
}

/**
 * Convertit un tableau d'objets contenant des dates
 */
export function convertDatesInArray<T>(array: any[], dateFields: string[]): T[] {
  if (!array || !Array.isArray(array)) return [];
  
  return array.map(item => convertDatesInObject<T>(item, dateFields));
}
