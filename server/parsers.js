const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const AdmZip = require('adm-zip');

/**
 * Clean and normalize text
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract text from PDF file
 */
async function parsePdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  
  // Approximate page splitting if pages are separated
  const rawText = data.text || '';
  const pages = [];
  
  // Try to split on form feed or page headers if available
  const rawPages = rawText.split(/\f|\n(?=Page\s+\d+)/i);
  if (rawPages.length > 1) {
    rawPages.forEach((pageText, idx) => {
      const cleaned = cleanText(pageText);
      if (cleaned.length > 10) {
        pages.push({
          index: idx + 1,
          title: `Page ${idx + 1}`,
          text: cleaned
        });
      }
    });
  } else {
    // Break into chunks of ~1500 chars if no explicit page breaks
    const chunks = rawText.match(/[\s\S]{1,2000}(?=\s|$)/g) || [rawText];
    chunks.forEach((chunk, idx) => {
      pages.push({
        index: idx + 1,
        title: `Section ${idx + 1}`,
        text: cleanText(chunk)
      });
    });
  }

  return {
    text: cleanText(rawText),
    pageCount: data.numpages || pages.length,
    pages: pages.length > 0 ? pages : [{ index: 1, title: 'Document Content', text: cleanText(rawText) }]
  };
}

/**
 * Extract text and slides from PPTX file
 */
async function parsePptx(filePath) {
  const zip = new AdmZip(filePath);
  const zipEntries = zip.getEntries();
  
  // Look for slides: ppt/slides/slide1.xml, slide2.xml, etc.
  const slideEntries = zipEntries
    .filter(entry => entry.entryName.match(/ppt\/slides\/slide\d+\.xml$/i))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)\.xml/i)[1], 10);
      const numB = parseInt(b.entryName.match(/slide(\d+)\.xml/i)[1], 10);
      return numA - numB;
    });

  const slides = [];
  let combinedText = '';

  for (let i = 0; i < slideEntries.length; i++) {
    const entry = slideEntries[i];
    const xmlContent = entry.getData().toString('utf8');
    
    // Extract text from <a:t>...</a:t> tags
    const textMatches = xmlContent.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi) || [];
    const slideTextPieces = textMatches.map(match => {
      return match.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    });

    const slideText = cleanText(slideTextPieces.join(' '));
    const titleMatch = slideTextPieces.find(piece => piece.trim().length > 3) || `Slide ${i + 1}`;
    
    if (slideText.length > 0) {
      slides.push({
        index: i + 1,
        title: titleMatch.substring(0, 80),
        text: slideText
      });
      combinedText += `\n--- Slide ${i + 1}: ${titleMatch} ---\n` + slideText + '\n';
    }
  }

  // Fallback if no slides found through xml
  if (slides.length === 0) {
    throw new Error('No slide text could be extracted from this PPTX file.');
  }

  return {
    text: cleanText(combinedText),
    pageCount: slides.length,
    pages: slides
  };
}

/**
 * Extract text from DOCX file
 */
async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  const rawText = cleanText(result.value || '');
  
  // Split into sections by double newline
  const paragraphs = rawText.split('\n\n').filter(p => p.trim().length > 0);
  const pages = [];
  let currentChunk = '';
  let chunkIdx = 1;

  for (const p of paragraphs) {
    if ((currentChunk + '\n\n' + p).length > 2000 && currentChunk.length > 0) {
      pages.push({
        index: chunkIdx,
        title: `Section ${chunkIdx}`,
        text: currentChunk.trim()
      });
      chunkIdx++;
      currentChunk = p;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + p;
    }
  }

  if (currentChunk.trim().length > 0) {
    pages.push({
      index: chunkIdx,
      title: `Section ${chunkIdx}`,
      text: currentChunk.trim()
    });
  }

  return {
    text: rawText,
    pageCount: pages.length || 1,
    pages: pages.length > 0 ? pages : [{ index: 1, title: 'Document Content', text: rawText }]
  };
}

/**
 * Extract text from plain text file
 */
async function parseTxt(filePath) {
  const rawText = fs.readFileSync(filePath, 'utf8');
  const cleaned = cleanText(rawText);
  return {
    text: cleaned,
    pageCount: 1,
    pages: [{ index: 1, title: 'Document Text', text: cleaned }]
  };
}

/**
 * Master parser dispatching by file extension
 */
async function parseDocument(filePath, originalFilename) {
  const ext = path.extname(originalFilename || filePath).toLowerCase();
  
  try {
    if (ext === '.pdf') {
      return await parsePdf(filePath);
    } else if (ext === '.pptx' || ext === '.ppt') {
      if (ext === '.ppt') {
        throw new Error('Legacy .ppt binary format is not supported. Please save/convert as .pptx and upload.');
      }
      return await parsePptx(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
      if (ext === '.doc') {
        throw new Error('Legacy .doc binary format is not supported. Please save/convert as .docx and upload.');
      }
      return await parseDocx(filePath);
    } else if (ext === '.txt' || ext === '.md') {
      return await parseTxt(filePath);
    } else {
      throw new Error(`Unsupported file format '${ext}'. Please upload PDF, PPTX, DOCX, or TXT.`);
    }
  } catch (err) {
    console.error(`Error parsing document ${originalFilename}:`, err);
    throw err;
  }
}

module.exports = {
  parseDocument,
  cleanText
};
