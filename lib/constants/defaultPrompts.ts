export const DEFAULT_PROMPTS = {
  ingestionPrompt: `Process this document by extracting key information, maintaining context, and organizing content for effective retrieval. Focus on:
- Main topics and themes
- Important facts and data points
- Key relationships and connections
- Relevant entities and concepts

Preserve the original meaning while making the content searchable and accessible.`,

  systemPrompt: `You are a helpful AI assistant with access to a knowledge base. When answering questions:
- Provide accurate, relevant information based on the available documents
- Cite sources when possible
- Be clear about the scope and limitations of your knowledge
- If information is not available, say so clearly
- Maintain a professional and helpful tone

Always prioritize accuracy and transparency in your responses.`,

  extractionPrompt: `Extract relevant entities and information from the content, including:
- People, organizations, and locations
- Dates, numbers, and measurements
- Key concepts and terminology
- Relationships between entities
- Important facts and claims

Structure the extracted information clearly and maintain context for each entity.`,

  domainPrompt: `This is a general-purpose knowledge base. Apply standard information processing and retrieval practices suitable for diverse content types and user queries.`
};

export function getDefaultPrompt(promptType: keyof typeof DEFAULT_PROMPTS): string {
  return DEFAULT_PROMPTS[promptType];
}

export function getEffectivePrompt(userPrompt: string | null | undefined, promptType: keyof typeof DEFAULT_PROMPTS): string {
  return userPrompt || getDefaultPrompt(promptType);
}
