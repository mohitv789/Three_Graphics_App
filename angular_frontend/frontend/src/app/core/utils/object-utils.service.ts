export function extractObjectUuid(objectId: string): string {
  if (!objectId.startsWith('object#')) {
    throw new Error(`Invalid object_id: ${objectId}`);
  }
  return objectId.substring('object#'.length);
}
