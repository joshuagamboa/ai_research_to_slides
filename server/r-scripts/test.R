# Simple R script to test the R integration

# Load required libraries
library(ggplot2)

# Create a simple plot
plot <- ggplot(mtcars, aes(x = wt, y = mpg)) +
  geom_point() +
  geom_smooth(method = "lm") +
  labs(title = "Weight vs MPG",
       x = "Weight (1000 lbs)",
       y = "Miles per Gallon") +
  theme_minimal()

# Print the plot
print(plot)

# Create a simple table
table <- head(mtcars[, c("mpg", "cyl", "wt")])

# Print the table
print(table)

# Return a message
"R integration test successful!"
