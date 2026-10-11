/**
 * Smart Search Service for Query Parsing & Enhancement
 */
const parseSearchQuery = (rawQuery = '') => {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { cleanQuery: '', priceMax: null, extractedCondition: null };
  }

  let cleanQuery = rawQuery.trim();
  let priceMax = null;
  let extractedCondition = null;

  // Extract condition hints (e.g. "brand new macbook", "like new chair")
  if (/brand new/i.test(cleanQuery)) {
    extractedCondition = 'BRAND_NEW';
    cleanQuery = cleanQuery.replace(/brand new/gi, '');
  } else if (/like new/i.test(cleanQuery)) {
    extractedCondition = 'LIKE_NEW';
    cleanQuery = cleanQuery.replace(/like new/gi, '');
  }

  // Extract price filters (e.g. "under 50", "under $100")
  const priceMatch = cleanQuery.match(/under \$?(\d+)/i);
  if (priceMatch) {
    priceMax = parseFloat(priceMatch[1]);
    cleanQuery = cleanQuery.replace(/under \$?\d+/gi, '');
  }

  return {
    cleanQuery: cleanQuery.trim().replace(/\s+/g, ' '),
    priceMax,
    extractedCondition
  };
};

module.exports = {
  parseSearchQuery
};
