export function getItemImageUrl(type: string | null | undefined, quality: number = 1): string | null {
  if (!type) return null;
  // Handle cases where type might contain localization suffix e.g. @1, @2, @3 (enchantment)
  // The Render API handles @suffixes correctly.
  return `https://render.albiononline.com/v1/item/${type}.png?quality=${quality}`;
}
