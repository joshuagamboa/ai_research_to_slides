import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import * as R from 'r-integration'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as crypto from 'crypto'
import { logRExecution, logRFileOperation, logSvgOperation } from '~/utils/serverLogger'
import { saveSvgToFile } from '~/utils/svgStorage'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { content, type } = body

    if (!content) {
      return { error: 'No content provided' }
    }

    // Clean content before processing
    const { content: cleanedContent, htmlPlaceholders } = cleanRMarkdownForProcessing(content);

    // Process based on type
    switch (type) {
      case 'document': {
        // Create temporary files with cleaned content
        const tempDir = os.tmpdir()
        const tempRmdPath = path.join(tempDir, `document_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.Rmd`)

        // Write cleaned content
        fs.writeFileSync(tempRmdPath, cleanedContent)

        // Process with R
        const result = await processRMarkdown(tempRmdPath)

        // Restore HTML content
        const finalResult = restoreHtmlContent(result, htmlPlaceholders)

        return { result: finalResult }
      }
      case 'html': {
        // Convert R Markdown to HTML
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRmdPath = path.join(tempDir, `temp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.Rmd`)
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.R`)
        const tempHtmlPath = path.join(tempDir, `output_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.html`)

        // Write the R Markdown content to a file
        try {
          fs.writeFileSync(tempRmdPath, content)
          logRFileOperation('write_file', tempRmdPath, true)
        } catch (err) {
          logRFileOperation('write_file', tempRmdPath, false, err)
          throw err
        }

        // Create an R script file to render the R Markdown
        const rScript = `
          library(rmarkdown)
          render("${tempRmdPath.replace(/\\/g, '/')}", output_file = "${tempHtmlPath.replace(/\\/g, '/')}", quiet = TRUE)
          html_content <- readLines("${tempHtmlPath.replace(/\\/g, '/')}")
          cat(paste(html_content, collapse = "\n"))
        `

        // Write the R script to a file
        try {
          fs.writeFileSync(tempRScriptPath, rScript)
          logRFileOperation('write_file', tempRScriptPath, true)
        } catch (err) {
          logRFileOperation('write_file', tempRScriptPath, false, err)
          throw err
        }

        // Execute the R script
        const execStartTime = Date.now()
        let htmlOutput

        try {
          htmlOutput = R.executeRScript(tempRScriptPath)
          logRExecution(rScript, 'R script executed successfully', Date.now() - execStartTime)
        } catch (err) {
          logRExecution(rScript, null, Date.now() - execStartTime, err)
          throw err
        }

        // Read the HTML file directly
        let htmlContent = ''
        try {
          htmlContent = fs.readFileSync(tempHtmlPath, 'utf8')
          logRFileOperation('read_file', tempHtmlPath, true)

          // Log the HTML generation
          logSvgOperation('html_generated', {
            source: 'r-markdown',
            type: 'html',
            size: htmlContent.length,
            generatedFrom: content.substring(0, 100) + (content.length > 100 ? '...' : '')
          })
        } catch (err) {
          logRFileOperation('read_file', tempHtmlPath, false, err)
          console.error('Error reading HTML file:', err)
          // If we can't read the file, use the output from R
          htmlContent = htmlOutput.join('\n')

          // Log the fallback
          logSvgOperation('html_fallback', {
            source: 'r-output',
            type: 'html',
            size: htmlContent.length,
            error: err.message || String(err)
          })
        }

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRmdPath)
          fs.unlinkSync(tempRScriptPath)
          fs.unlinkSync(tempHtmlPath)
          logRFileOperation('delete_files', 'temporary files', true)
        } catch (err) {
          logRFileOperation('delete_files', 'temporary files', false, err)
          console.error('Error removing temporary files:', err)
        }

        return { result: htmlContent }
      }

      case 'svg': {
        // Convert R code to SVG and return as base64
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.R`)
        const tempSvgPath = path.join(tempDir, `plot_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.svg`)

        // Create an R script file
        const rScript = `
          svg("${tempSvgPath.replace(/\\/g, '/')}")
          ${content}
          dev.off()
          svg_content <- readLines("${tempSvgPath.replace(/\\/g, '/')}")
          cat(paste(svg_content, collapse = "\n"))
        `

        // Write the R script to a file
        try {
          fs.writeFileSync(tempRScriptPath, rScript)
          logRFileOperation('write_file', tempRScriptPath, true)
        } catch (err) {
          logRFileOperation('write_file', tempRScriptPath, false, err)
          throw err
        }

        // Execute the R script
        const execStartTime = Date.now()
        let svgOutput
        let error = null

        try {
          svgOutput = R.executeRScript(tempRScriptPath)
          logRExecution(rScript, 'R script executed successfully', Date.now() - execStartTime)
        } catch (err) {
          error = err
          logRExecution(rScript, null, Date.now() - execStartTime, err)
          throw err
        }

        // Read the SVG file directly
        let svgContent = ''
        try {
          svgContent = fs.readFileSync(tempSvgPath, 'utf8')
          logRFileOperation('read_file', tempSvgPath, true)

          // Save the SVG to our storage
          const { url } = saveSvgToFile(svgContent, {
            source: 'r-code',
            type: 'plot',
            generatedFrom: content.substring(0, 100) + (content.length > 100 ? '...' : '')
          })

          // Convert SVG to base64
          const svgBase64 = Buffer.from(svgContent).toString('base64')

          // Clean up temporary files
          try {
            fs.unlinkSync(tempRScriptPath)
            fs.unlinkSync(tempSvgPath)
            logRFileOperation('delete_file', tempRScriptPath, true)
            logRFileOperation('delete_file', tempSvgPath, true)
          } catch (err) {
            logRFileOperation('delete_file', 'temporary files', false, err)
          }

          return {
            result: svgContent,
            base64: svgBase64,
            contentType: 'image/svg+xml',
            url
          }
        } catch (err) {
          logRFileOperation('read_file', tempSvgPath, false, err)
          console.error('Error reading SVG file:', err)

          // If we can't read the file, use the output from R
          svgContent = svgOutput.join('\n')

          // Save the SVG to our storage
          const { url } = saveSvgToFile(svgContent, {
            source: 'r-output',
            type: 'plot',
            generatedFrom: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            error: 'File read error, using R output'
          })

          // Convert SVG to base64
          const svgBase64 = Buffer.from(svgContent).toString('base64')

          // Clean up temporary files
          try {
            fs.unlinkSync(tempRScriptPath)
            if (fs.existsSync(tempSvgPath)) {
              fs.unlinkSync(tempSvgPath)
            }
            logRFileOperation('delete_file', 'temporary files', true)
          } catch (cleanupErr) {
            logRFileOperation('delete_file', 'temporary files', false, cleanupErr)
          }

          return {
            result: svgContent,
            base64: svgBase64,
            contentType: 'image/svg+xml',
            url
          }
        }
      }

      case 'table': {
        // Convert R table to HTML
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.R`)

        // Create an R script file
        const rScript = `
          library(knitr)

          # Execute the R code to generate a table
          result <- {
            ${content}
          }

          # Convert the table to HTML with styling
          html_table <- knitr::kable(result, format = "html")

          # Add some basic styling
          html_table <- gsub('<table>', '<table style="border-collapse: collapse; margin: 1em auto; width: 90%; max-width: 1000px;">', html_table)
          html_table <- gsub('<th>', '<th style="border: 1px solid #ddd; padding: 12px 15px; text-align: left; background-color: #f8f9fa;">', html_table)
          html_table <- gsub('<td>', '<td style="border: 1px solid #ddd; padding: 12px 15px; text-align: left;">', html_table)

          # Return the HTML
          cat(as.character(html_table))
        `

        // Write the R script to a file
        try {
          fs.writeFileSync(tempRScriptPath, rScript)
          logRFileOperation('write_file', tempRScriptPath, true)
        } catch (err) {
          logRFileOperation('write_file', tempRScriptPath, false, err)
          throw err
        }

        // Execute the R script
        const execStartTime = Date.now()
        let tableOutput

        try {
          tableOutput = R.executeRScript(tempRScriptPath)
          logRExecution(rScript, 'R script executed successfully', Date.now() - execStartTime)
        } catch (err) {
          logRExecution(rScript, null, Date.now() - execStartTime, err)
          throw err
        }

        const tableHtml = tableOutput.join('\n')

        // Log the table generation
        logSvgOperation('table_generated', {
          source: 'r-code',
          type: 'table',
          size: tableHtml.length,
          generatedFrom: content.substring(0, 100) + (content.length > 100 ? '...' : '')
        })

        // Convert HTML to base64
        const tableBase64 = Buffer.from(tableHtml).toString('base64')

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRScriptPath)
          logRFileOperation('delete_file', tempRScriptPath, true)
        } catch (err) {
          logRFileOperation('delete_file', tempRScriptPath, false, err)
          console.error('Error removing temporary file:', err)
        }

        return {
          result: tableHtml,
          base64: tableBase64,
          contentType: 'text/html'
        }
      }

      default: {
        // Just execute the R code and return the result
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.R`)

        // Create an R script file
        const rScript = `
          # Execute the R code
          result <- {
            ${content}
          }

          # Print the result
          print(result)
        `

        // Write the R script to a file
        try {
          fs.writeFileSync(tempRScriptPath, rScript)
          logRFileOperation('write_file', tempRScriptPath, true)
        } catch (err) {
          logRFileOperation('write_file', tempRScriptPath, false, err)
          throw err
        }

        // Execute the R script
        const execStartTime = Date.now()
        let result

        try {
          result = R.executeRScript(tempRScriptPath)
          logRExecution(rScript, 'R script executed successfully', Date.now() - execStartTime)
        } catch (err) {
          logRExecution(rScript, null, Date.now() - execStartTime, err)
          throw err
        }

        // Log the execution result
        logSvgOperation('r_code_executed', {
          source: 'r-code',
          type: 'generic',
          outputLines: result.length,
          generatedFrom: content.substring(0, 100) + (content.length > 100 ? '...' : '')
        })

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRScriptPath)
          logRFileOperation('delete_file', tempRScriptPath, true)
        } catch (err) {
          logRFileOperation('delete_file', tempRScriptPath, false, err)
          console.error('Error removing temporary file:', err)
        }

        return { result: result.join('\n') }
      }
    }
  } catch (err) {
    console.error('R Markdown processing error:', err)
    return { error: err.message }
  }
})

function cleanRMarkdownForProcessing(content) {
  if (!content) {
    return {
      content: '',
      htmlPlaceholders: {}
    };
  }

  // Remove MARP frontmatter if present
  let cleaned = content.replace(/^---\s*marp:\s*true[\s\S]*?---/m, '');

  // Remove HTML-like content temporarily
  const htmlPlaceholders = {};
  let placeholderCount = 0;

  cleaned = cleaned.replace(/<[^>]+>/g, (match) => {
    const placeholder = `__HTML_PLACEHOLDER_${placeholderCount}__`;
    htmlPlaceholders[placeholder] = match;
    placeholderCount++;
    return placeholder;
  });

  return {
    content: cleaned,
    htmlPlaceholders
  };
}

function restoreHtmlContent(result, htmlPlaceholders) {
  if (!result || !htmlPlaceholders || Object.keys(htmlPlaceholders).length === 0) {
    return result;
  }

  let restored = result;

  // Replace each placeholder with its original HTML content
  for (const [placeholder, html] of Object.entries(htmlPlaceholders)) {
    restored = restored.replace(new RegExp(placeholder, 'g'), html);
  }

  return restored;
}

/**
 * Process R Markdown file using R integration
 * @param filePath Path to the R Markdown file
 * @returns Processed content with R code chunks replaced by their outputs
 */
async function processRMarkdown(filePath) {
  // Create temporary files
  const tempDir = os.tmpdir()
  const tempRScriptPath = path.join(tempDir, `process_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.R`)
  const tempOutputPath = path.join(tempDir, `output_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.txt`)

  // Create an R script to process the R Markdown file
  const rScript = `
    library(knitr)
    library(rmarkdown)

    # Read the R Markdown file
    rmd_content <- readLines("${filePath.replace(/\\/g, '/')}")

    # Process the R Markdown content
    processed_content <- knit(text = rmd_content, quiet = TRUE)

    # Write the processed content to a file
    writeLines(processed_content, "${tempOutputPath.replace(/\\/g, '/')}")

    # Print the processed content
    cat(processed_content)
  `

  // Write the R script to a file
  fs.writeFileSync(tempRScriptPath, rScript)

  try {
    // Execute the R script
    const result = R.executeRScript(tempRScriptPath)
    const processedContent = result.join('\n')

    // Try to read from the output file if the direct output is empty
    if (!processedContent.trim()) {
      try {
        const fileContent = fs.readFileSync(tempOutputPath, 'utf8')
        if (fileContent.trim()) {
          return fileContent
        }
      } catch (fileErr) {
        console.warn('Could not read output file:', fileErr)
      }
    }

    return processedContent
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempRScriptPath)) {
        fs.unlinkSync(tempRScriptPath)
      }
      if (fs.existsSync(tempOutputPath)) {
        fs.unlinkSync(tempOutputPath)
      }
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (cleanupErr) {
      console.error('Error cleaning up temporary files:', cleanupErr)
    }
  }
}
