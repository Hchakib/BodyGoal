/**
 * Utilitaires pour gérer les dates dans l'application.
 * Gère les Timestamps Firebase (objet, sérialisé, string), et les objets Date.
 */

/**
 * Convertit une valeur en objet Date.
 */
export function toDate(value: any): Date {
  // Déjà une Date
  if (value instanceof Date) {
    return value;
  }

  // Firebase Timestamp avec .toDate()
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  // Firebase Timestamp sérialisé {_seconds, _nanoseconds} ou {seconds, nanoseconds}
  if (value && typeof value === 'object') {
    if ('_seconds' in value) {
      return new Date((value as any)._seconds * 1000);
    }
    if ('seconds' in value) {
      return new Date((value as any).seconds * 1000);
    }
  }

  // String ISO ou timestamp numérique
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }

  // Fallback : maintenant
  console.warn('Unable to convert value to Date:', value);
  return new Date();
}

/**
 * Convertit un objet en appliquant toDate sur les champs indiqués.
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
 * Convertit un tableau d'objets contenant des dates.
 */
export function convertDatesInArray<T>(array: any[], dateFields: string[]): T[] {
  if (!array || !Array.isArray(array)) return [];
  return array.map(item => convertDatesInObject<T>(item, dateFields));
}

// Polyfill : ajoute .toDate() sur les objets Date pour compatibilité avec le code qui attend un Timestamp Firebase
declare global {
  interface Date {
    toDate?: () => Date;
  }
}

if (!Date.prototype.toDate) {
  // eslint-disable-next-line no-extend-native
  Date.prototype.toDate = function () {
    return this as Date;
  };
}
