/**
 * Utility functions for YouTube video handling
 */

/**
 * Extracts video ID from YouTube URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Checks if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Fetches YouTube video title from URL
 * Uses the oEmbed API which doesn't require API keys
 */
export async function fetchYouTubeVideoTitle(url: string): Promise<string | null> {
  try {
    if (!isYouTubeUrl(url)) {
      return null;
    }

    // Use YouTube's oEmbed API to get video metadata
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      console.warn('Failed to fetch YouTube video metadata:', response.status);
      return null;
    }

    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error('Error fetching YouTube video title:', error);
    return null;
  }
}

/**
 * Fetches video title with fallback to page scraping
 */
export async function fetchVideoTitleWithFallback(url: string): Promise<string | null> {
  try {
    // First try oEmbed API
    const title = await fetchYouTubeVideoTitle(url);
    if (title) {
      return title;
    }

    // Fallback: try to extract from page HTML
    return await fetchTitleFromPageHtml(url);
  } catch (error) {
    console.error('Error fetching video title:', error);
    return null;
  }
}

/**
 * Extracts title from page HTML as fallback
 */
async function fetchTitleFromPageHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    
    // Try to extract title from various meta tags
    const titlePatterns = [
      /<meta property="og:title" content="([^"]+)"/gi,
      /<meta name="twitter:title" content="([^"]+)"/gi,
      /<title>([^<]+)<\/title>/gi
    ];

    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        // Clean up the title (remove " - YouTube" suffix if present)
        return match[1].replace(/ - YouTube$/, '').trim();
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching title from page HTML:', error);
    return null;
  }
}

/**
 * Generates a clean document name from YouTube video title
 */
export function generateDocumentNameFromTitle(title: string): string {
  // Remove common YouTube suffixes and clean up
  return title
    .replace(/ - YouTube$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100); // Limit length
}
