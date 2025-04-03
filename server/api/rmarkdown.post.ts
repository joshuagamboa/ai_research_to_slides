import { defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { content, type } = body

    if (!content) {
      return {
        error: 'No content provided'
      }
    }

    // Get the R integration functions from the plugin
    const { $r } = event.context.nuxtApp

    switch (type) {
      case 'html':
        // Convert R Markdown to HTML
        const html = await $r.convertRMarkdownToHTML(content)
        return { result: html }

      case 'svg':
        // Convert R code to SVG
        const svg = await $r.convertRCodeToSVG(content)
        return { result: svg }

      case 'table':
        // Convert R table to HTML
        const tableHtml = await $r.runRCode(`
          library(knitr)
          library(kableExtra)
          
          # Execute the R code to generate a table
          result <- {
            ${content}
          }
          
          # Convert the table to HTML
          html_table <- kable(result, format = "html") %>%
            kable_styling(bootstrap_options = c("striped", "hover", "condensed"))
          
          # Return the HTML
          as.character(html_table)
        `)
        return { result: tableHtml }

      default:
        // Just execute the R code and return the result
        const result = await $r.runRCode(content)
        return { result }
    }
  } catch (error) {
    console.error('Error processing R Markdown:', error)
    return {
      error: error.message || 'An error occurred while processing R Markdown'
    }
  }
})
