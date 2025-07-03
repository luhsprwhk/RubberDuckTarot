export const getProfessionMetaphors = (profession: {
  name: string;
  category?: string;
}): { style: string; note: string; category: string } => {
  const lower = profession.name.toLowerCase();

  if (
    lower.includes('engineer') ||
    lower.includes('developer') ||
    lower.includes('programmer') ||
    lower.includes('code')
  ) {
    return {
      style:
        'Heavy coding metaphors: debugging, refactoring, technical debt, CI/CD, etc.',
      category: 'technical',
      note: '(fellow developer - use full technical language)',
    };
  }

  if (
    lower.includes('design') ||
    lower.includes('creative') ||
    lower.includes('artist')
  ) {
    return {
      style:
        'Design/creative process metaphors: iterations, wireframes, color theory, composition.',
      note: '(creative professional - use design language)',
      category: 'creative',
    };
  }

  if (
    lower.includes('manager') ||
    lower.includes('business') ||
    lower.includes('marketing')
  ) {
    return {
      style:
        'Business/strategy metaphors: KPIs, roadmaps, stakeholders, user stories.',
      note: '(business role - use strategic frameworks)',
      category: 'business',
    };
  }

  return {
    style:
      'Universal problem-solving metaphors: systems, processes, optimization, with minimal jargon.',
    note: '(general audience - keep tech references light)',
    category: 'general',
  };
};
