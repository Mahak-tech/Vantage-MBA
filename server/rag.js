/**
 * Lightweight in-memory RAG & Vector Retrieval Engine
 * Supports semantic TF-IDF / BM25 indexing with citation tracking
 */

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

// Stop words filter
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'her', 'was', 'one', 'our',
  'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way',
  'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'with', 'this', 'that', 'from'
]);

function getWordFrequencies(tokens) {
  const freq = {};
  for (const token of tokens) {
    if (STOP_WORDS.has(token)) continue;
    freq[token] = (freq[token] || 0) + 1;
  }
  return freq;
}

/**
 * Break document pages into semantic chunks
 */
function chunkDocument(doc) {
  const chunks = [];
  const pages = doc.pages || [{ index: 1, title: 'Document', text: doc.extractedText }];

  for (const page of pages) {
    const text = page.text || '';
    if (!text.trim()) continue;

    // Split page text into sentences/paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkSeq = 1;

    for (const para of paragraphs) {
      if ((currentChunk + ' ' + para).length > 800 && currentChunk.length > 0) {
        chunks.push({
          id: `${doc.id}_p${page.index}_c${chunkSeq}`,
          docId: doc.id,
          docTitle: doc.title || doc.originalName,
          pageIndex: page.index,
          pageTitle: page.title || `Page/Slide ${page.index}`,
          text: currentChunk.trim(),
          tokens: tokenize(currentChunk)
        });
        chunkSeq++;
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + para;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: `${doc.id}_p${page.index}_c${chunkSeq}`,
        docId: doc.id,
        docTitle: doc.title || doc.originalName,
        pageIndex: page.index,
        pageTitle: page.title || `Page/Slide ${page.index}`,
        text: currentChunk.trim(),
        tokens: tokenize(currentChunk)
      });
    }
  }

  return chunks;
}

/**
 * Search chunks using BM25-like scoring
 */
function searchChunks(chunks, query, topK = 4) {
  if (!chunks || chunks.length === 0) return [];
  if (!query || !query.trim()) {
    return chunks.slice(0, topK);
  }

  const queryTokens = tokenize(query).filter(t => !STOP_WORDS.has(t));
  if (queryTokens.length === 0) return chunks.slice(0, topK);

  // Calculate scores
  const scored = chunks.map(chunk => {
    let score = 0;
    const chunkTokens = new Set(chunk.tokens);
    const chunkTextLower = chunk.text.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact phrase match bonus
    if (chunkTextLower.includes(queryLower)) {
      score += 15;
    }

    for (const qToken of queryTokens) {
      if (chunkTokens.has(qToken)) {
        score += 3;
      }
      // Count frequency
      const occurrences = (chunkTextLower.match(new RegExp(`\\b${qToken}\\b`, 'g')) || []).length;
      score += Math.min(occurrences * 1.5, 6);
    }

    return {
      ...chunk,
      score
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(c => c.score > 0).slice(0, topK);
}

/**
 * Format retrieved chunks into context prompt with citations
 */
function formatRagContext(retrievedChunks) {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return {
      contextText: 'No specific document excerpts found for this query.',
      citations: []
    };
  }

  const citations = [];
  const textPieces = retrievedChunks.map((chunk, idx) => {
    const citation = `[Doc: ${chunk.docTitle}, ${chunk.pageTitle}]`;
    citations.push({
      docId: chunk.docId,
      docTitle: chunk.docTitle,
      pageIndex: chunk.pageIndex,
      pageTitle: chunk.pageTitle,
      snippet: chunk.text.substring(0, 150) + '...'
    });

    return `--- EXCERPT ${idx + 1} ${citation} ---\n${chunk.text}\n`;
  });

  return {
    contextText: textPieces.join('\n'),
    citations
  };
}

module.exports = {
  tokenize,
  chunkDocument,
  searchChunks,
  formatRagContext
};
