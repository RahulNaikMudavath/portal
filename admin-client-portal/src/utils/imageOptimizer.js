/**
 * Helper to dynamically inject auto-formatting, compression, and scaling into Cloudinary URLs.
 * Accelerates page load on mobile and field connections.
 * 
 * @param {string} url - Original image URL
 * @param {Object} options - { width, quality, format }
 * @returns {string} Optimized URL
 */
export function optimizeCloudinaryUrl(url, { width = 1200, quality = "auto", format = "auto" } = {}) {
  if (!url || typeof url !== "string") return url || "";

  // Only apply to Cloudinary hosted media
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const transform = `f_${format},q_${quality},w_${width},c_limit`;
    // Replace /upload/ with /upload/<transform>/ if not already transformed
    if (!url.includes("/upload/f_") && !url.includes("/upload/q_")) {
      return url.replace("/upload/", `/upload/${transform}/`);
    }
  }

  return url;
}

export function getCloudinaryThumbnail(url, size = 150) {
  return optimizeCloudinaryUrl(url, { width: size, quality: "auto", format: "auto" });
}
