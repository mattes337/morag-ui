// Debug script for extractKeyTerms function

// Manually implement the function for testing
function extractKeyTerms(query) {
    // Simple implementation - in production, you might use NLP libraries
    const stopwords = [
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
        'can', 'could', 'may', 'might', 'must', 'what', 'which', 'who', 'whom', 'whose',
        'this', 'that', 'these', 'those', 'am', 'i', 'we', 'you', 'he', 'she', 'it', 'they'
    ];
    
    console.log('Query:', query);
    console.log('Stopwords:', stopwords);
    
    const terms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 2)
        .filter((term) => !stopwords.includes(term));
    
    console.log('Filtered terms:', terms);
    return terms;
}

const query = 'What is machine learning and artificial intelligence?';
console.log('Query:', query);

const keyTerms = extractKeyTerms(query);
console.log('Key Terms:', keyTerms);

// Check if specific terms are in the result
console.log('Contains "machine":', keyTerms.includes('machine'));
console.log('Contains "learning":', keyTerms.includes('learning'));
console.log('Contains "artificial":', keyTerms.includes('artificial'));
console.log('Contains "intelligence":', keyTerms.includes('intelligence'));
console.log('Contains "what":', keyTerms.includes('what'));
console.log('Contains "is":', keyTerms.includes('is'));
console.log('Contains "and":', keyTerms.includes('and'));