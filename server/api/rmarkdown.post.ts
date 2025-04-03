import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import * as R from 'r-integration'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as crypto from 'crypto'

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
      case 'document': {
        // Process a complete R Markdown document
        // Create temporary files
        const tempDir = os.tmpdir()
        const tempRmdPath = path.join(tempDir, `document_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.Rmd`)
        const tempRScriptPath = path.join(tempDir, `script_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.R`)
        const tempOutputDir = path.join(tempDir, `output_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`)

        // Create output directory if it doesn't exist
        if (!fs.existsSync(tempOutputDir)) {
          fs.mkdirSync(tempOutputDir, { recursive: true })
        }

        // Write the R Markdown content to a file
        fs.writeFileSync(tempRmdPath, content)

        // Create an R script file to process the document and extract elements
        const rScript = `
          library(rmarkdown)
          library(knitr)
          library(jsonlite)

          # Set knitr options to capture plots and tables
          knitr::opts_chunk$set(
            fig.path = '${tempOutputDir.replace(/\\/g, '/')}/figure-',
            dev = 'svg',
            fig.ext = '.svg'
          )

          # Create a list to store all elements
          elements <- list()
          elements$plots <- list()
          elements$tables <- list()

          # Custom hook to capture plots
          plot_counter <- 0
          original_plot_hook <- knitr::knit_hooks$get('plot')
          knitr::knit_hooks$set(plot = function(x, options) {
            plot_counter <<- plot_counter + 1
            plot_path <- x
            plot_id <- paste0('plot-', plot_counter)

            # Read the SVG content
            svg_content <- paste(readLines(plot_path), collapse = '\n')

            # Add to elements list
            elements$plots[[plot_id]] <<- list(
              path = plot_path,
              content = svg_content
            )

            # Call the original hook
            original_plot_hook(x, options)
          })

          # Custom hook to capture tables
          table_counter <- 0
          original_table_hook <- knitr::knit_hooks$get('table')
          knitr::knit_hooks$set(table = function(x, options) {
            table_counter <<- table_counter + 1
            table_id <- paste0('table-', table_counter)

            # Add to elements list
            elements$tables[[table_id]] <<- list(
              content = x
            )

            # Call the original hook
            original_table_hook(x, options)
          })

          # Render the document
          output_file <- file.path('${tempOutputDir.replace(/\\/g, '/')}', 'output.html')
          rmarkdown::render('${tempRmdPath.replace(/\\/g, '/')}', output_file = output_file, quiet = TRUE)

          # Read the HTML output
          html_content <- paste(readLines(output_file), collapse = '\n')
          elements$html <- html_content

          # Write the elements to a JSON file
          elements_json <- toJSON(elements, auto_unbox = TRUE, pretty = TRUE)
          elements_file <- file.path('${tempOutputDir.replace(/\\/g, '/')}', 'elements.json')
          writeLines(elements_json, elements_file)

          # Return the path to the elements file
          cat(elements_file)
        `

        // Write the R script to a file
        fs.writeFileSync(tempRScriptPath, rScript)

        // Execute the R script
        const scriptOutput = R.executeRScript(tempRScriptPath)
        const elementsFilePath = scriptOutput[0]

        // Read the elements JSON file
        let elements = {}
        try {
          const elementsJson = fs.readFileSync(elementsFilePath, 'utf8')
          elements = JSON.parse(elementsJson)

          // Process the elements to add base64 encoding
          if (elements.plots) {
            Object.keys(elements.plots).forEach(plotId => {
              const plot = elements.plots[plotId]
              plot.base64 = Buffer.from(plot.content).toString('base64')
            })
          }

          if (elements.tables) {
            Object.keys(elements.tables).forEach(tableId => {
              const table = elements.tables[tableId]
              table.base64 = Buffer.from(table.content).toString('base64')
            })
          }

          if (elements.html) {
            elements.htmlBase64 = Buffer.from(elements.html).toString('base64')
          }
        } catch (err) {
          console.error('Error reading elements file:', err)
        }

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRmdPath)
          fs.unlinkSync(tempRScriptPath)

          // Recursively delete the output directory
          if (fs.existsSync(tempOutputDir)) {
            const deleteDir = (dirPath) => {
              if (fs.existsSync(dirPath)) {
                fs.readdirSync(dirPath).forEach((file) => {
                  const curPath = path.join(dirPath, file)
                  if (fs.lstatSync(curPath).isDirectory()) {
                    deleteDir(curPath)
                  } else {
                    fs.unlinkSync(curPath)
                  }
                })
                fs.rmdirSync(dirPath)
              }
            }
            deleteDir(tempOutputDir)
          }
        } catch (err) {
          console.error('Error removing temporary files:', err)
        }

        return {
          result: elements,
          success: true
        }
      }
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
        fs.writeFileSync(tempRScriptPath, rScript)

        // Execute the R script
        const svgOutput = R.executeRScript(tempRScriptPath)

        // Read the SVG file directly
        let svgContent = ''
        try {
          svgContent = fs.readFileSync(tempSvgPath, 'utf8')

          // Convert SVG to base64
          const svgBase64 = Buffer.from(svgContent).toString('base64')

          // Clean up temporary files
          try {
            fs.unlinkSync(tempRScriptPath)
            fs.unlinkSync(tempSvgPath)
          } catch (err) {
            console.error('Error removing temporary files:', err)
          }

          return {
            result: svgContent,
            base64: svgBase64,
            contentType: 'image/svg+xml'
          }
        } catch (err) {
          console.error('Error reading SVG file:', err)
          // If we can't read the file, use the output from R
          svgContent = svgOutput.join('\n')

          // Convert SVG to base64
          const svgBase64 = Buffer.from(svgContent).toString('base64')

          // Clean up temporary files
          try {
            fs.unlinkSync(tempRScriptPath)
            fs.unlinkSync(tempSvgPath)
          } catch (cleanupErr) {
            console.error('Error removing temporary files:', cleanupErr)
          }

          return {
            result: svgContent,
            base64: svgBase64,
            contentType: 'image/svg+xml'
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
          html_table <- knitr::kable(result, format = "html") %>%
            kableExtra::kable_styling(bootstrap_options = c("striped", "hover", "condensed"), full_width = FALSE)

          # Return the HTML
          cat(as.character(html_table))
        `

        // Write the R script to a file
        fs.writeFileSync(tempRScriptPath, rScript)

        // Execute the R script
        const tableOutput = R.executeRScript(tempRScriptPath)
        const tableHtml = tableOutput.join('\n')

        // Convert HTML to base64
        const tableBase64 = Buffer.from(tableHtml).toString('base64')

        // Clean up temporary files
        try {
          fs.unlinkSync(tempRScriptPath)
        } catch (err) {
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
