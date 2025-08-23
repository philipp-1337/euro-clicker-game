// Entfernt rekursiv alle Felder mit undefined aus einem Objekt
export function removeUndefinedFields(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  } else if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = removeUndefinedFields(value);
      }
      return acc;
    }, {});
  }
  return obj;
}
