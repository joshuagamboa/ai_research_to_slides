/**
 * Type definitions for research-related data structures
 */

export interface ResearchTopic {
  topic: string;
  subtopics: string[];
}

export interface ResearchResult {
  topic: string;
  subtopics: string[];
  content: string;
  timestamp: string;
}

export interface PresentationOutline {
  content: string;
  format: 'rmarkdown' | 'markdown';
  timestamp: string;
}

export interface MarpTemplate {
  name: string;
  theme: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
}