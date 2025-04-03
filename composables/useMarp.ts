/**
 * Composable for interacting with the MARP library
 * Provides functionality to generate slides from markdown
 */

import { ref } from 'vue'

export const useMarp = () => {
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const slidesHtml = ref<string>('')

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
      // This would normally call a server endpoint to convert markdown to MARP slides
      // For now, we'll simulate the conversion with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulate generated HTML with MARP-specific directives
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MARP Presentation</title>
  <style>
    /* MARP styling */
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; }
    .slide { height: 100vh; padding: 2rem; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; }
    h1 { color: #2563eb; margin-bottom: 1rem; }
    h2 { color: #4b5563; margin-bottom: 0.75rem; }
    p { font-size: 1.2rem; line-height: 1.6; }
    ul { font-size: 1.1rem; line-height: 1.5; }
    code { background-color: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; }
    pre { background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    .slide-number { position: absolute; bottom: 1rem; right: 1rem; font-size: 0.8rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="slide">
    <h1>Generated Presentation</h1>
    <h2>Using ${template} template</h2>
    <p>Created with MARP from R Markdown</p>
    <div class="slide-number">1</div>
  </div>
  <div class="slide">
    <h1>Content Overview</h1>
    <ul>
      <li>Automatically generated from research</li>
      <li>Formatted using MARP syntax</li>
      <li>Ready for presentation</li>
    </ul>
    <div class="slide-number">2</div>
  </div>
  <div class="slide">
    <h1>Research Content</h1>
    <p>${markdown.substring(0, 150)}...</p>
    <div class="slide-number">3</div>
  </div>
</body>
</html>
      `

      slidesHtml.value = html
      
      // Open in new window if requested
      if (openInNewWindow && typeof window !== 'undefined') {
        const slidesWindow = window.open('', '_blank');
        if (slidesWindow) {
          slidesWindow.document.write(html);
          slidesWindow.document.close();
        }
      }
      
      return html
    } catch (err: any) {
      error.value = err.message || 'An unknown error occurred'
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
      // In a real implementation, this would convert Markdown to MARP format
      // and then generate HTML slides. For now, we'll simulate this process.
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Extract title from Markdown if available
      const titleMatch = markdown.match(/^#\s+(.+)$/m) 
      const title = titleMatch ? titleMatch[1] : 'MARP Presentation'
      
      // Generate HTML directly (in a real implementation, this would use MARP)
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* MARP styling */
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; }
    .slide { height: 100vh; padding: 2rem; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; }
    h1 { color: #2563eb; margin-bottom: 1rem; }
    h2 { color: #4b5563; margin-bottom: 0.75rem; }
    p { font-size: 1.2rem; line-height: 1.6; }
    ul { font-size: 1.1rem; line-height: 1.5; }
    code { background-color: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; }
    pre { background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    .slide-number { position: absolute; bottom: 1rem; right: 1rem; font-size: 0.8rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="slide">
    <h1>${title}</h1>
    <p>Generated with MARP</p>
    <div class="slide-number">1</div>
  </div>
  ${generateSlidesFromMarkdown(markdown)}
</body>
</html>
      `
      
      slidesHtml.value = html
      return html
    } catch (err: any) {
      error.value = err.message || 'An error occurred while converting R Markdown to slides'
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

  return { 
    generateMarpSlides, 
    convertMarkdownToSlides,
    isGenerating, 
    error, 
    slidesHtml 
  }
}