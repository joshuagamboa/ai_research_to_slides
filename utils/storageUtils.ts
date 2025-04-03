/**
 * Utility functions for client-side storage of R-generated content
 */

// Maximum cache size in bytes (5MB)
const MAX_CACHE_SIZE = 5 * 1024 * 1024

// Storage keys
const STORAGE_PREFIX = 'r-content-'
const STORAGE_INDEX_KEY = 'r-content-index'

// Interface for cached content
interface CachedContent {
  id: string
  hash: string
  contentType: string
  base64: string
  timestamp: number
  size: number
}

// Interface for the storage index
interface StorageIndex {
  items: {
    [key: string]: {
      id: string
      hash: string
      timestamp: number
      size: number
    }
  }
  totalSize: number
}

/**
 * Generate a hash for a string
 * @param content The content to hash
 * @returns A hash string
 */
export const generateHash = (content: string): string => {
  // Simple hash function for strings
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}

/**
 * Initialize the storage index if it doesn't exist
 * @returns The storage index
 */
const initializeIndex = (): StorageIndex => {
  if (typeof window === 'undefined') return { items: {}, totalSize: 0 }
  
  try {
    const indexJson = localStorage.getItem(STORAGE_INDEX_KEY)
    if (indexJson) {
      return JSON.parse(indexJson)
    }
  } catch (error) {
    console.error('Error reading storage index:', error)
  }
  
  const newIndex: StorageIndex = { items: {}, totalSize: 0 }
  try {
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(newIndex))
  } catch (error) {
    console.error('Error initializing storage index:', error)
  }
  
  return newIndex
}

/**
 * Save the storage index
 * @param index The storage index to save
 */
const saveIndex = (index: StorageIndex): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index))
  } catch (error) {
    console.error('Error saving storage index:', error)
  }
}

/**
 * Store content in localStorage
 * @param hash The content hash
 * @param contentType The content type (e.g., 'image/svg+xml')
 * @param base64 The base64-encoded content
 * @returns The ID of the stored content
 */
export const storeContent = (hash: string, contentType: string, base64: string): string | null => {
  if (typeof window === 'undefined') return null
  
  try {
    // Generate a unique ID
    const id = `${STORAGE_PREFIX}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    // Calculate the size of the content
    const size = base64.length
    
    // Get the current index
    const index = initializeIndex()
    
    // Check if we need to make room for the new content
    if (index.totalSize + size > MAX_CACHE_SIZE) {
      // Sort items by timestamp (oldest first)
      const items = Object.values(index.items).sort((a, b) => a.timestamp - b.timestamp)
      
      // Remove items until we have enough space
      while (index.totalSize + size > MAX_CACHE_SIZE && items.length > 0) {
        const oldestItem = items.shift()
        if (oldestItem) {
          // Remove the item from storage
          localStorage.removeItem(oldestItem.id)
          
          // Remove the item from the index
          delete index.items[oldestItem.hash]
          
          // Update the total size
          index.totalSize -= oldestItem.size
        }
      }
    }
    
    // Store the content
    const content: CachedContent = {
      id,
      hash,
      contentType,
      base64,
      timestamp: Date.now(),
      size
    }
    
    localStorage.setItem(id, JSON.stringify(content))
    
    // Update the index
    index.items[hash] = {
      id,
      hash,
      timestamp: content.timestamp,
      size
    }
    index.totalSize += size
    
    // Save the updated index
    saveIndex(index)
    
    return id
  } catch (error) {
    console.error('Error storing content:', error)
    return null
  }
}

/**
 * Get content from localStorage by hash
 * @param hash The content hash
 * @returns The cached content or null if not found
 */
export const getContentByHash = (hash: string): CachedContent | null => {
  if (typeof window === 'undefined') return null
  
  try {
    // Get the index
    const index = initializeIndex()
    
    // Check if the hash exists in the index
    const indexItem = index.items[hash]
    if (!indexItem) return null
    
    // Get the content from storage
    const contentJson = localStorage.getItem(indexItem.id)
    if (!contentJson) return null
    
    // Parse the content
    const content: CachedContent = JSON.parse(contentJson)
    
    // Update the timestamp
    content.timestamp = Date.now()
    localStorage.setItem(indexItem.id, JSON.stringify(content))
    
    // Update the index
    index.items[hash].timestamp = content.timestamp
    saveIndex(index)
    
    return content
  } catch (error) {
    console.error('Error getting content:', error)
    return null
  }
}

/**
 * Clear all stored content
 */
export const clearAllContent = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    // Get the index
    const index = initializeIndex()
    
    // Remove all items from storage
    Object.values(index.items).forEach(item => {
      localStorage.removeItem(item.id)
    })
    
    // Reset the index
    const newIndex: StorageIndex = { items: {}, totalSize: 0 }
    saveIndex(newIndex)
  } catch (error) {
    console.error('Error clearing content:', error)
  }
}

/**
 * Get the data URL for cached content
 * @param hash The content hash
 * @returns The data URL or null if not found
 */
export const getDataUrl = (hash: string): string | null => {
  const content = getContentByHash(hash)
  if (!content) return null
  
  return `data:${content.contentType};base64,${content.base64}`
}

/**
 * Get the HTML content for cached content
 * @param hash The content hash
 * @returns The HTML content or null if not found
 */
export const getHtmlContent = (hash: string): string | null => {
  const content = getContentByHash(hash)
  if (!content) return null
  
  if (content.contentType === 'text/html') {
    return atob(content.base64)
  }
  
  return null
}

/**
 * Get the SVG content for cached content
 * @param hash The content hash
 * @returns The SVG content or null if not found
 */
export const getSvgContent = (hash: string): string | null => {
  const content = getContentByHash(hash)
  if (!content) return null
  
  if (content.contentType === 'image/svg+xml') {
    return atob(content.base64)
  }
  
  return null
}
