import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDFJS worker from CDN to prevent bundler resolution issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

/**
 * Parses an uploaded PDF file and returns its text content.
 * @param {File} file - The uploaded PDF file
 * @returns {Promise<string>} Plain text content
 */
export async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Parses an uploaded DOCX file and returns its text content.
 * @param {File} file - The uploaded DOCX file
 * @returns {Promise<string>} Plain text content
 */
export async function parseDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Parses an uploaded TXT file and returns its text content.
 * @param {File} file - The uploaded TXT file
 * @returns {Promise<string>} Plain text content
 */
export async function parseTXT(file) {
  return await file.text();
}

/**
 * Universal parser dispatcher.
 * @param {File} file - The uploaded file
 * @returns {Promise<string>} Plain text content
 */
export async function parseFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return await parsePDF(file);
    case 'docx':
      return await parseDOCX(file);
    case 'txt':
      return await parseTXT(file);
    default:
      throw new Error(`Unsupported file type: .${extension}. Only PDF, DOCX, and TXT are supported.`);
  }
}
