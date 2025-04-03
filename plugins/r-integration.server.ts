import { defineNuxtPlugin } from '#app'
import R from 'r-integration'

export default defineNuxtPlugin((nuxtApp) => {
  // Initialize R integration
  const r = new R()

  // Function to execute R code and return the result
  const runRCode = async (rCode: string): Promise<any> => {
    try {
      const result = await r.executeRCommand(rCode)
      return result
    } catch (error) {
      console.error("Error executing R code:", error)
      throw error
    }
  }

  // Function to execute R script file
  const runRScript = async (scriptPath: string): Promise<any> => {
    try {
      const result = await r.executeRScript(scriptPath)
      return result
    } catch (error) {
      console.error("Error executing R script:", error)
      throw error
    }
  }

  // Function to convert R Markdown to HTML
  const convertRMarkdownToHTML = async (rmdContent: string): Promise<string> => {
    try {
      // Create a temporary file with the R Markdown content
      const tempFilePath = `/tmp/temp_${Date.now()}.Rmd`
      
      // Write the content to a temporary file using R
      await runRCode(`
        cat('${rmdContent.replace(/'/g, "\\'")}', file='${tempFilePath}')
      `)
      
      // Use rmarkdown to render the file to HTML
      const htmlOutput = await runRCode(`
        library(rmarkdown)
        output_file <- tempfile(fileext = ".html")
        rmarkdown::render('${tempFilePath}', output_file = output_file, quiet = TRUE)
        html_content <- readLines(output_file)
        paste(html_content, collapse = "\\n")
      `)
      
      // Clean up temporary files
      await runRCode(`
        if(file.exists('${tempFilePath}')) file.remove('${tempFilePath}')
      `)
      
      return htmlOutput
    } catch (error) {
      console.error("Error converting R Markdown to HTML:", error)
      throw error
    }
  }

  // Function to convert R code chunks to SVG
  const convertRCodeToSVG = async (rCode: string): Promise<string> => {
    try {
      // Create a temporary file for the SVG output
      const tempFilePath = `/tmp/plot_${Date.now()}.svg`
      
      // Execute R code to generate SVG
      await runRCode(`
        svg('${tempFilePath}')
        ${rCode}
        dev.off()
      `)
      
      // Read the SVG content
      const svgContent = await runRCode(`
        svg_content <- readLines('${tempFilePath}')
        paste(svg_content, collapse = "\\n")
      `)
      
      // Clean up temporary files
      await runRCode(`
        if(file.exists('${tempFilePath}')) file.remove('${tempFilePath}')
      `)
      
      return svgContent
    } catch (error) {
      console.error("Error converting R code to SVG:", error)
      throw error
    }
  }

  // Provide the functions to the Nuxt app
  return {
    provide: {
      r: {
        runRCode,
        runRScript,
        convertRMarkdownToHTML,
        convertRCodeToSVG
      }
    }
  }
})
