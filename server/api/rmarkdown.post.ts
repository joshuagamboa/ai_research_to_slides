import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import * as R from 'r-integration'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { content, type } = body

    if (!content) {
      return {
        error: 'No content provided'
      }
    }

    // Use R integration directly

    switch (type) {
      case 'html': {
        // Convert R Markdown to HTML
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRmdPath = path.join(tempDir, `temp_${Date.now()}.Rmd`)
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}.R`)
        const tempHtmlPath = path.join(tempDir, `output_${Date.now()}.html`)

        // Write the R Markdown content to a file
        fs.writeFileSync(tempRmdPath, content)

        // Create an R script file to render the R Markdown
        const rScript = `
          library(rmarkdown)
          render("${tempRmdPath.replace(/\\/g, '/')}", output_file = "${tempHtmlPath.replace(/\\/g, '/')}", quiet = TRUE)
          html_content <- readLines("${tempHtmlPath.replace(/\\/g, '/')}")
          cat(paste(html_content, collapse = "\n"))
        `

        // Write the R script to a file
        fs.writeFileSync(tempRScriptPath, rScript)

        // Execute the R script
        const htmlOutput = R.executeRScript(tempRScriptPath)

        // Read the HTML file directly
        let htmlContent = ''
        try {
          htmlContent = fs.readFileSync(tempHtmlPath, 'utf8')
        } catch (err) {
          console.error('Error reading HTML file:', err)
          // If we can't read the file, use the output from R
          htmlContent = htmlOutput.join('\n')
        }

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRmdPath)
          fs.unlinkSync(tempRScriptPath)
          fs.unlinkSync(tempHtmlPath)
        } catch (err) {
          console.error('Error removing temporary files:', err)
        }

        return { result: htmlContent }
      }

      case 'svg': {
        // Convert R code to SVG
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}.R`)
        const tempSvgPath = path.join(tempDir, `plot_${Date.now()}.svg`)

        // Create an R script file
        const rScript = `
          svg("${tempSvgPath.replace(/\\/g, '/')}")
          ${content}
          dev.off()
          svg_content <- readLines("${tempSvgPath.replace(/\\/g, '/')}")
          cat(paste(svg_content, collapse = "\n"))
        `

        // Write the R script to a file
        fs.writeFileSync(tempRScriptPath, rScript)

        // Execute the R script
        const svgOutput = R.executeRScript(tempRScriptPath)

        // Read the SVG file directly
        let svgContent = ''
        try {
          svgContent = fs.readFileSync(tempSvgPath, 'utf8')
        } catch (err) {
          console.error('Error reading SVG file:', err)
          // If we can't read the file, use the output from R
          svgContent = svgOutput.join('\n')
        }

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRScriptPath)
          fs.unlinkSync(tempSvgPath)
        } catch (err) {
          console.error('Error removing temporary files:', err)
        }

        return { result: svgContent }
      }

      case 'table': {
        // Convert R table to HTML
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}.R`)

        // Create an R script file
        const rScript = `
          library(knitr)

          # Execute the R code to generate a table
          result <- {
            ${content}
          }

          # Convert the table to HTML
          html_table <- knitr::kable(result, format = "html")

          # Return the HTML
          cat(as.character(html_table))
        `

        // Write the R script to a file
        fs.writeFileSync(tempRScriptPath, rScript)

        // Execute the R script
        const tableOutput = R.executeRScript(tempRScriptPath)

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRScriptPath)
        } catch (err) {
          console.error('Error removing temporary file:', err)
        }

        return { result: tableOutput.join('\n') }
      }

      default: {
        // Just execute the R code and return the result
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}.R`)

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
        fs.writeFileSync(tempRScriptPath, rScript)

        // Execute the R script
        const result = R.executeRScript(tempRScriptPath)

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRScriptPath)
        } catch (err) {
          console.error('Error removing temporary file:', err)
        }

        return { result: result.join('\n') }
      }
    }
  } catch (error) {
    console.error('Error processing R Markdown:', error)
    return {
      error: error.message || 'An error occurred while processing R Markdown'
    }
  }
})
