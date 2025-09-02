export const DEFAULT_PROMPTS = {
  ingestionPrompt: `Process this document by extracting key information, maintaining context, and organizing content for effective retrieval. Focus on:
- Main topics and themes
- Important facts and data points
- Key relationships and connections
- Relevant entities and concepts
- Preserve formatting and structure where important
- Maintain domain-specific terminology

Preserve the original meaning while making the content searchable and accessible. Apply domain-specific processing rules when applicable.`,

  systemPrompt: `You are a helpful AI assistant with access to a knowledge base. When answering questions:
- Provide accurate, relevant information based on the available documents
- Cite sources when possible with specific document references
- Be clear about the scope and limitations of your knowledge
- If information is not available, say so clearly
- Maintain a professional and helpful tone
- Apply domain expertise when responding to specialized queries
- Include confidence levels for factual assertions when appropriate

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

// Domain-specific prompt templates
export const DOMAIN_PROMPT_TEMPLATES = {
  medical: {
    domain: 'medical',
    ingestionPrompt: `Process medical documents focusing on clinical findings, diagnoses, treatments, and patient outcomes. Focus on:
- Clinical findings and symptoms
- Diagnoses and differential diagnoses
- Treatment protocols and medications
- Dosage information and contraindications
- Patient outcomes and prognosis
- Medical terminology and ICD codes
- Evidence-based medicine principles

Preserve medical terminology accuracy and maintain clinical context.`,

    systemPrompt: `You are a medical AI assistant with access to clinical knowledge. When responding to medical queries:
- Provide evidence-based information with appropriate medical citations
- Always include confidence levels for clinical assertions
- Clearly distinguish between established facts and clinical opinions
- Emphasize the importance of professional medical consultation
- Use appropriate medical terminology while remaining accessible
- Include relevant contraindications and safety considerations
- Cite specific medical sources when available`,

    extractionPrompt: `Extract medical facts including:
- Symptoms, signs, and clinical findings
- Diagnoses and diagnostic criteria
- Treatments, medications, and dosages
- Contraindications and side effects
- Patient demographics and outcomes
- Medical procedures and protocols
- Clinical study results and statistics

Include confidence scores for clinical assertions and maintain medical terminology accuracy.`,

    domainPrompt: `Medical domain context: Focus on clinical accuracy, patient safety, and evidence-based medicine principles. Prioritize peer-reviewed medical literature and established clinical guidelines.`
  },

  legal: {
    domain: 'legal',
    ingestionPrompt: `Process legal documents focusing on legal precedents, statutes, regulations, and case law. Focus on:
- Legal precedents and case citations
- Statutes and regulatory requirements
- Court decisions and legal principles
- Legal entities and jurisdictions
- Contractual terms and obligations
- Legal procedures and deadlines
- Compliance requirements

Preserve legal terminology accuracy and maintain jurisdictional context.`,

    systemPrompt: `You are a legal AI assistant with access to legal knowledge. When responding to legal queries:
- Provide information based on established legal precedents and statutes
- Always cite specific legal sources, cases, and statutes
- Clearly indicate jurisdictional limitations
- Emphasize the need for professional legal consultation
- Distinguish between legal facts and legal opinions
- Include relevant case law and regulatory context
- Maintain precision in legal terminology`,

    extractionPrompt: `Extract legal facts including:
- Case citations and legal precedents
- Statutes, regulations, and legal codes
- Court names, case numbers, and jurisdictions
- Legal principles and doctrines
- Contractual terms and legal obligations
- Legal entities and their relationships
- Dates, deadlines, and legal procedures

Maintain accuracy in legal citations and preserve jurisdictional context.`,

    domainPrompt: `Legal domain context: Focus on legal accuracy, jurisdictional specificity, and established legal precedents. Prioritize authoritative legal sources and maintain precision in legal terminology.`
  },

  technical: {
    domain: 'technical',
    ingestionPrompt: `Process technical documents focusing on specifications, procedures, and implementation details. Focus on:
- Technical specifications and requirements
- System configurations and parameters
- Implementation procedures and steps
- API documentation and code examples
- Version numbers and compatibility information
- Technical diagrams and architecture
- Performance metrics and benchmarks

Preserve technical accuracy and maintain implementation context.`,

    systemPrompt: `You are a technical AI assistant with access to technical documentation. When responding to technical queries:
- Provide accurate technical information with specific references
- Include version numbers and compatibility details
- Cite relevant technical documentation and standards
- Provide step-by-step implementation guidance when appropriate
- Include code examples and configuration details
- Highlight potential technical limitations or considerations
- Maintain precision in technical terminology`,

    extractionPrompt: `Extract technical facts including:
- Technical specifications and requirements
- System configurations and parameters
- API endpoints and methods
- Code snippets and implementation details
- Version numbers and compatibility information
- Performance metrics and benchmarks
- Technical procedures and workflows

Preserve technical accuracy and maintain implementation context.`,

    domainPrompt: `Technical domain context: Focus on technical accuracy, implementation details, and system specifications. Prioritize official documentation and established technical standards.`
  }
};

export function getDomainPromptTemplate(domain: string): typeof DOMAIN_PROMPT_TEMPLATES.medical | null {
  return DOMAIN_PROMPT_TEMPLATES[domain as keyof typeof DOMAIN_PROMPT_TEMPLATES] || null;
}
