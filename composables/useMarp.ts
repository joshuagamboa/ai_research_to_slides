/**
 * Composable for interacting with the MARP library
 * Provides functionality to generate slides from markdown
 * Includes R Markdown integration for handling R code chunks
 */

import { ref } from 'vue'
import { Marp } from '@marp-team/marp-core'
import { useFetch } from '#app'
import { containsSvgImages, extractSvgDataUrls, convertMarkdownSvgToHtml } from '~/utils/svgUtils'

export const useMarp = () => {
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const slidesHtml = ref<string>('')
  const isProcessingR = ref(false)

  /**
   * Generates MARP slides from markdown content
   * @param markdown The markdown content to convert to slides
   * @param template The template to use for the slides
   * @param openInNewWindow Whether to open the slides in a new window
   * @returns A promise that resolves when the slides generation is complete
   */
  const generateMarpSlides = async (markdown: string, template: string, openInNewWindow: boolean = false): Promise<string | null> => {
    isGenerating.value = true
    error.value = null
    slidesHtml.value = ''

    try {
      // Create a new Marp instance to process the markdown
      const marp = new Marp({
        html: true,  // Allow HTML in markdown
        math: true, // Enable math expressions
        minifyCSS: false, // Don't minify CSS for better readability
        markdown: {
          // Enable GitHub Flavored Markdown tables
          breaks: true,
          tables: true
        }
      })

      // Process the markdown with Marp
      const { html, css } = marp.render(markdown)

      // Generate complete HTML document with the rendered content
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MARP Presentation</title>
  <style>
    /* Table styles */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 0.9em;
    }

    table th,
    table td {
      padding: 12px;
      text-align: center;
      border: 1px solid #ddd;
    }

    table th {
      background-color: #f4f4f4;
      font-weight: bold;
    }

    table tr:nth-child(even) {
      background-color: #f8f8f8;
    }

    table tr:hover {
      background-color: #f0f0f0;
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      table th {
        background-color: #2d2d2d;
      }
      table td {
        border-color: #444;
      }
      table tr:nth-child(even) {
        background-color: #2a2a2a;
      }
      table tr:hover {
        background-color: #333;
      }
    }
  </style>
</head>
<body>
  ${html}
  <script src="/fixTables.js"></script>
</body>
</html>
      `

      slidesHtml.value = fullHtml

      // Open in new window if requested
      if (openInNewWindow && typeof window !== 'undefined') {
        const slidesWindow = window.open('', '_blank');
        if (slidesWindow) {
          slidesWindow.document.write(fullHtml);
          slidesWindow.document.close();
        }
      }

      return fullHtml
    } catch (err: any) {
      error.value = err.message || 'An error occurred while processing the presentation'
      return null
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Converts Markdown to HTML slides using MARP
   * @param markdown The Markdown content to convert
   * @returns A promise that resolves with the HTML slides
   */
  const convertMarkdownToSlides = async (markdown: string): Promise<string | null> => {
    isGenerating.value = true
    error.value = null

    try {
      // First, process any R Markdown code chunks
      let processedMarkdown = markdown.trim()

      // Check if the markdown contains R code chunks
      if (markdown.includes('```{r')) {
        try {
          // Process the entire R Markdown document
          processedMarkdown = await processRMarkdownContent(markdown)
          processedMarkdown = processedMarkdown.trim()

          // Log the first 200 characters for debugging
          console.log('Processed R Markdown content (preview):',
            processedMarkdown.substring(0, 200) + '...')

          // Check for SVG images in the processed markdown
          const hasSvgImages = containsSvgImages(processedMarkdown)
          const svgDataUrls = extractSvgDataUrls(processedMarkdown)
          console.log(`Contains SVG images: ${hasSvgImages}, found ${svgDataUrls.length} SVG data URLs`)
        } catch (rError) {
          console.error('Error processing R Markdown content:', rError)
          error.value = `Error processing R code: ${rError.message}`

          // Fall back to processing individual chunks if document processing fails
          try {
            processedMarkdown = await processRMarkdownChunks(markdown)
            processedMarkdown = processedMarkdown.trim()
            console.log('Processed R Markdown chunks as fallback:', processedMarkdown)
          } catch (chunkError) {
            console.error('Error processing R Markdown chunks:', chunkError)
            // Continue with the original markdown if all R processing fails
          }
        }
      }

      // Convert any standard Markdown SVG images to HTML for better compatibility
      processedMarkdown = convertMarkdownSvgToHtml(processedMarkdown)

      // First, check if the markdown already has MARP directives
      const hasMarpDirectives = /^---[\s\S]*?marp:\s*true[\s\S]*?---/m.test(processedMarkdown);

      if (!hasMarpDirectives) {
        // If no MARP directives, add them at the beginning
        processedMarkdown = `---
marp: true
theme: gaia
class: lead
paginate: true
backgroundColor: #fff
backgroundImage: url('./background.svg')
---

${processedMarkdown}`;
      }

      // Ensure proper slide separation
      // First, identify the content after the frontmatter
      const frontmatterEndMatch = processedMarkdown.match(/^---[\s\S]*?---\s*/m);
      let contentStartIndex = 0;

      if (frontmatterEndMatch) {
        contentStartIndex = frontmatterEndMatch[0].length;
      }

      // Extract content after frontmatter
      const frontmatter = processedMarkdown.substring(0, contentStartIndex);
      let content = processedMarkdown.substring(contentStartIndex);

      // Process the content to ensure proper slide breaks
      // 1. Make sure each slide separator is on its own line with proper spacing
      content = content.replace(/([^\n])---([^\n])/g, '$1\n---\n$2');

      // 2. Ensure there are blank lines around slide separators for proper parsing
      content = content.replace(/([^\n])\n---\n/g, '$1\n\n---\n\n');
      content = content.replace(/\n---\n([^\n])/g, '\n---\n\n$1');

      // 3. Make sure the first slide has a title if not already present
      const firstSlideContent = content.split(/\n---\n/)[0];
      if (!firstSlideContent.match(/^#\s+/m)) {
        // Add a default title if none exists
        content = `# Presentation

${content}`;
      }

      // Reassemble the document with proper frontmatter and content
      processedMarkdown = frontmatter + content;

      // Log for debugging
      console.log('Slide separators count:', (processedMarkdown.match(/\n---\n/g) || []).length + 1);

      // Create a new Marp instance
      const marp = new Marp({
        // Marp options
        html: true,
        math: true,
        minifyCSS: false
      })

      // Process the markdown with Marp
      const { html, css } = marp.render(processedMarkdown)

      // Extract title from Markdown if available
      const titleMatch = processedMarkdown.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1] : 'MARP Presentation'

      // Generate complete HTML document with the rendered content
      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${css}
    /* Additional custom styling */
    body { margin: 0; padding: 0; }
    .marp-slide { page-break-after: always; }

    /* R plot styling */
    .r-plot {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 1em 0;
    }
    .r-plot img {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>
      `

      slidesHtml.value = fullHtml
      return fullHtml
    } catch (err: any) {
      error.value = err.message || 'An error occurred while converting markdown to slides'
      return null
    } finally {
      isGenerating.value = false
    }
  }

  // Helper function to generate slide HTML from Markdown content
  const generateSlidesFromMarkdown = (markdown: string): string => {
    // This is a simplified implementation
    // In a real app, you would use a proper MARP converter

    // Extract any non-slide content at the beginning (before MARP directives)
    let nonSlideContent = '';
    let slideContent = markdown;

    // Look for the first MARP directive or slide separator
    const marpDirectiveIndex = markdown.indexOf('<!-- ');
    const firstSlideBreakIndex = markdown.indexOf('---');

    // If there's content before the first MARP directive or slide break, it's non-slide content
    if (marpDirectiveIndex > 0 || firstSlideBreakIndex > 0) {
      const contentBreakIndex = Math.min(
        marpDirectiveIndex > 0 ? marpDirectiveIndex : Infinity,
        firstSlideBreakIndex > 0 ? firstSlideBreakIndex : Infinity
      );
      nonSlideContent = markdown.substring(0, contentBreakIndex).trim();
      slideContent = markdown.substring(contentBreakIndex);
    }

    // Split by slide breaks (--- in MARP)
    const sections = slideContent.split(/^---$/m).filter(section => section.trim())

    // Generate HTML for each section
    return sections.map((section, index) => {
      // Extract heading if available
      const headingMatch = section.match(/^#+\s+(.+)$/m)
      const heading = headingMatch ? headingMatch[1] : ''

      // Use the section as content
      let content = section

      // Process tables before other conversions
      // Match table pattern with | column | headers | format
      content = content.replace(
        /^\|(.+)\|\s*\n\|\s*[-:\s]+\|\s*[-:\s]+\|\s*([-:\s]+\|\s*)*\n((\|.+\|\s*\n)+)/gm,
        (match) => {
          // Split the table into rows
          const rows = match.trim().split('\n');

          // Extract header row and separator row
          const headerRow = rows[0];
          const separatorRow = rows[1];
          const dataRows = rows.slice(2);

          // Process header cells
          const headerCells = headerRow
            .split('|')
            .filter(cell => cell.trim() !== '')
            .map(cell => `<th>${cell.trim()}</th>`)
            .join('');

          // Process data rows
          const dataCellsHTML = dataRows
            .map(row => {
              const cells = row
                .split('|')
                .filter(cell => cell.trim() !== '')
                .map(cell => `<td>${cell.trim()}</td>`)
                .join('');
              return `<tr>${cells}</tr>`;
            })
            .join('');

          // Construct the HTML table
          return `<table class="marp-table"><thead><tr>${headerCells}</tr></thead><tbody>${dataCellsHTML}</tbody></table>`;
        }
      );

      // Convert markdown-like syntax to HTML (simplified)
      content = content
        .replace(/^#+\s+.+$/gm, '') // Remove headings (already extracted)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
        .replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>') // List items
        .replace(/(<li>.+\n)+/g, '<ul>$&</ul>') // Wrap list items
        .replace(/`(.+?)`/g, '<code>$1</code>') // Inline code
        .replace(/\n\n/g, '</p><p>') // Paragraphs

      return `
  <div class="slide">
    ${heading ? `<h1>${heading}</h1>` : ''}
    <style>
      .marp-table {
        border-collapse: collapse;
        margin: 1em 0;
        width: 100%;
      }
      .marp-table th, .marp-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      .marp-table th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      .marp-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
    </style>
    <div>${content}</div>
    <div class="slide-number">${index + 2}</div>
  </div>`
    }).join('')
  }

  /**
   * Process R Markdown content as a complete document
   * @param markdown The markdown content with R code chunks
   * @returns A promise that resolves to the processed markdown with R code chunks replaced by their outputs
   */
  const processRMarkdownContent = async (markdown: string): Promise<string> => {
    isProcessingR.value = true
    let processedMarkdown = markdown

    try {
      // Import the storage utilities
      const { generateHash, storeContent, getDataUrl } = await import('~/utils/storageUtils')

      // Generate a hash for the markdown content
      const contentHash = generateHash(markdown)

      // Call the R Markdown API endpoint to process the entire document
      const { data, error: fetchError } = await useFetch('/api/rmarkdown', {
        method: 'POST',
        body: {
          content: markdown,
          type: 'document'
        }
      })

      if (fetchError.value) {
        throw new Error(`API error: ${fetchError.value.message}`)
      }

      if (data.value?.error) {
        throw new Error(data.value.error)
      }

      if (!data.value?.result) {
        throw new Error('No result returned from API')
      }

      const result = data.value.result

      // Store plots in client-side storage
      if (result.plots) {
        Object.keys(result.plots).forEach(plotId => {
          const plot = result.plots[plotId]
          const plotHash = generateHash(plot.content)
          storeContent(plotHash, 'image/svg+xml', plot.base64)
        })
      }

      // Store tables in client-side storage
      if (result.tables) {
        Object.keys(result.tables).forEach(tableId => {
          const table = result.tables[tableId]
          const tableHash = generateHash(table.content)
          storeContent(tableHash, 'text/html', table.base64)
        })
      }

      // Process the markdown to replace R code chunks with their outputs
      // Regular expression to find R code chunks
      const rCodeChunkRegex = /```{r.*?}\n([\s\S]*?)\n```/g

      // Find all R code chunks
      const matches = [...processedMarkdown.matchAll(rCodeChunkRegex)]

      // Process each R code chunk
      for (const match of matches) {
        const fullMatch = match[0]
        const rCode = match[1].trim()
        const rCodeHash = generateHash(rCode)

        // Check if this is a plot
        let replaced = false
        if (result.plots) {
          for (const plotId in result.plots) {
            const plot = result.plots[plotId]
            const plotContent = plot.content

            // If the plot was generated from this code chunk
            if (plotContent.includes(rCode) || rCode.includes(plotContent.substring(0, 20))) {
              const plotHash = generateHash(plot.content)
              const dataUrl = getDataUrl(plotHash)

              if (dataUrl) {
                // Replace with an image reference with proper sizing for MARP
                processedMarkdown = processedMarkdown.replace(
                  fullMatch,
                  `<div class="r-plot">
  <img src="${dataUrl}" alt="${plotId}" style="max-width: 100%; max-height: 70vh;" />
</div>`
                )
                replaced = true
                break
              }
            }
          }
        }

        // Check if this is a table
        if (!replaced && result.tables) {
          for (const tableId in result.tables) {
            const table = result.tables[tableId]
            const tableContent = table.content

            // If the table was generated from this code chunk
            if (tableContent.includes(rCode) || rCode.includes(tableContent.substring(0, 20))) {
              // Replace with the HTML table
              processedMarkdown = processedMarkdown.replace(
                fullMatch,
                table.content
              )
              replaced = true
              break
            }
          }
        }

        // If not replaced, keep the original code chunk
        if (!replaced) {
          console.warn('Could not find output for R code chunk:', rCode)
        }
      }

      return processedMarkdown
    } catch (error) {
      console.error('Error processing R Markdown content:', error)
      throw error
    } finally {
      isProcessingR.value = false
    }
  }

  /**
   * Process individual R Markdown code chunks
   * @param markdown The markdown content with R code chunks
   * @returns A promise that resolves to the processed markdown with R code chunks replaced by their outputs
   */
  const processRMarkdownChunks = async (content: string): Promise<string> => {
    if (!content) return ''

    isProcessingR.value = true
    try {
      const response = await fetch('/api/rmarkdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type: 'document'
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      // Check if data.result is a string or an object
      if (typeof data.result === 'string') {
        return data.result
      } else if (data.result && typeof data.result === 'object') {
        // If it's an object, it might contain processed content
        return data.result.content || data.result.markdown || JSON.stringify(data.result)
      } else {
        // Return the original content if we can't process the result
        console.warn('Unexpected API response format:', data)
        return content
      }
    } finally {
      isProcessingR.value = false
    }
  }

  return {
    generateMarpSlides,
    convertMarkdownToSlides,
    processRMarkdownChunks,
    processRMarkdownContent,
    isGenerating,
    isProcessingR,
    error,
    slidesHtml
  }
}
