export const getContextMetaphors = (profile: {
  creative_identity: string;
  work_context: string;
}): { style: string; note: string; category: string } => {
  const identity = profile.creative_identity.toLowerCase();
  const context = profile.work_context.toLowerCase();

  // Determine category based on work context
  if (context.includes('tech') || context.includes('engineering')) {
    return {
      style:
        'Heavy coding metaphors: debugging, refactoring, technical debt, CI/CD, stack traces, etc.',
      category: 'technical',
      note: '(tech professional - use full technical language)',
    };
  }

  if (context.includes('design') || context.includes('creative')) {
    return {
      style:
        'Design/creative process metaphors: iterations, wireframes, color theory, composition, creative blocks.',
      note: '(creative professional - use design language)',
      category: 'creative',
    };
  }

  if (context.includes('business') || context.includes('finance')) {
    return {
      style:
        'Business/strategy metaphors: KPIs, roadmaps, stakeholders, user stories, market fit.',
      note: '(business role - use strategic frameworks)',
      category: 'business',
    };
  }

  if (context.includes('healthcare')) {
    return {
      style:
        'Healthcare metaphors: diagnosis, treatment, patient care, systems, wellness.',
      note: '(healthcare professional - use care-focused language)',
      category: 'healthcare',
    };
  }

  if (context.includes('education')) {
    return {
      style:
        'Educational metaphors: learning paths, curriculum, skill development, mentorship.',
      note: '(educator - use growth-focused language)',
      category: 'education',
    };
  }

  if (context.includes('freelance') || context.includes('consulting')) {
    return {
      style:
        'Entrepreneurial metaphors: client work, project management, business development, independence.',
      note: '(independent professional - use self-directed language)',
      category: 'freelance',
    };
  }

  // Fallback based on creative identity for edge cases
  if (identity.includes('developer') || identity.includes('founder')) {
    return {
      style:
        'Startup/tech metaphors: MVPs, iteration, scaling, technical debt, user feedback.',
      category: 'startup',
      note: '(startup-minded - use agile/lean language)',
    };
  }

  return {
    style:
      'Universal problem-solving metaphors: systems, processes, optimization, with minimal jargon.',
    note: '(general audience - keep references accessible)',
    category: 'general',
  };
};
