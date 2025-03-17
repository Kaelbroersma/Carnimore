/**
 * Utility function to get the full URL for an image path
 * @param path The image path from Supabase
 * @returns The full URL for the image
 */
export const getImageUrl = (path: string): string => {
  if (!path) return '/.netlify/functions/image-handler?url=/img/Logo-Main.webp';
  
  // If the path starts with http/https, it's already a full URL
  if (path.startsWith('http')) {
    return `/.netlify/functions/image-handler?url=${encodeURIComponent(path)}&f=webp&q=80`;
  }
  
  // If the path starts with a slash, it's a local image
  if (path.startsWith('/')) {
    return `/.netlify/functions/image-handler?url=${encodeURIComponent(path)}&f=webp&q=80`;
  }
  
  // Otherwise, construct the Supabase storage URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const fullUrl = `${supabaseUrl}/storage/v1/object/public/${path}`;
  return `/.netlify/functions/image-handler?url=${encodeURIComponent(fullUrl)}&f=webp&q=80`;
};

/**
 * Get the main image URL for a product
 * @param product The product object
 * @returns The URL of the main image or a fallback
 */
export const getMainProductImage = (product: { images?: { is_main_image: boolean; image_url: string; }[] }): string => {
  if (!product.images?.length) {
    return getImageUrl('/img/Logo-Main.webp');
  }

  const mainImage = product.images.find(img => img.is_main_image) || product.images[0];
  return getImageUrl(mainImage.image_url);
};

/**
 * Get a thumbnail URL for an image
 * @param path The image path
 * @returns The URL for the thumbnail version
 */
export const getThumbnailUrl = (path: string): string => {
  const baseUrl = getImageUrl(path);
  return `${baseUrl}&w=200&h=200`;
};

/**
 * Get a preview URL for an image
 * @param path The image path
 * @returns The URL for the preview version
 */
export const getPreviewUrl = (path: string): string => {
  const baseUrl = getImageUrl(path);
  return `${baseUrl}&w=800`;
};