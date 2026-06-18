/**
 * Audit Glossary Dictionary
 * Maps term identifiers to their translation key prefixes.
 */

export interface GlossaryEntry {
  /** Term identifier (e.g. 'coso') */
  id: string
  /** Abbreviation displayed in bold */
  abbreviation: string
  /** Translation key prefix (e.g. 'glossary.coso') */
  keyPrefix: string
}

/**
 * All glossary terms with their key mappings.
 * Translation keys follow the pattern:
 *   - `{keyPrefix}.definition`
 *   - `{keyPrefix}.context`
 *   - `{keyPrefix}.importance`
 */
export const glossaryTerms: Record<string, GlossaryEntry> = {
  coso: {
    id: 'coso',
    abbreviation: 'COSO',
    keyPrefix: 'glossary.coso',
  },
  rcm: {
    id: 'rcm',
    abbreviation: 'RCM',
    keyPrefix: 'glossary.rcm',
  },
  pbc: {
    id: 'pbc',
    abbreviation: 'PBC',
    keyPrefix: 'glossary.pbc',
  },
  rawtc: {
    id: 'rawtc',
    abbreviation: 'RAWTC',
    keyPrefix: 'glossary.rawtc',
  },
  icfr: {
    id: 'icfr',
    abbreviation: 'ICFR',
    keyPrefix: 'glossary.icfr',
  },
  sox: {
    id: 'sox',
    abbreviation: 'SOX',
    keyPrefix: 'glossary.sox',
  },
  kpi: {
    id: 'kpi',
    abbreviation: 'KPI',
    keyPrefix: 'glossary.kpi',
  },
  toc: {
    id: 'toc',
    abbreviation: 'TOC',
    keyPrefix: 'glossary.toc',
  },
  tod: {
    id: 'tod',
    abbreviation: 'TOD',
    keyPrefix: 'glossary.tod',
  },
  pcaob: {
    id: 'pcaob',
    abbreviation: 'PCAOB',
    keyPrefix: 'glossary.pcaob',
  },
  deviation: {
    id: 'deviation',
    abbreviation: 'Deviation',
    keyPrefix: 'glossary.deviation',
  },
  deficiency: {
    id: 'deficiency',
    abbreviation: 'Deficiency',
    keyPrefix: 'glossary.deficiency',
  },
  rmm: {
    id: 'rmm',
    abbreviation: 'RMM',
    keyPrefix: 'glossary.rmm',
  },
  mus: {
    id: 'mus',
    abbreviation: 'MUS',
    keyPrefix: 'glossary.mus',
  },
  walkthrough: {
    id: 'walkthrough',
    abbreviation: 'Walkthrough',
    keyPrefix: 'glossary.walkthrough',
  },
  pm: {
    id: 'pm',
    abbreviation: 'PM',
    keyPrefix: 'glossary.pm',
  },
  gitc: {
    id: 'gitc',
    abbreviation: 'GITC',
    keyPrefix: 'glossary.gitc',
  },
  prp: {
    id: 'prp',
    abbreviation: 'PRP',
    keyPrefix: 'glossary.prp',
  },
  di: {
    id: 'di',
    abbreviation: 'D&I',
    keyPrefix: 'glossary.di',
  },
  combinedRisk: {
    id: 'combinedRisk',
    abbreviation: 'Combined Risk',
    keyPrefix: 'glossary.combinedRisk',
  },
}

/**
 * Helper to get translation keys for a term
 */
export function getGlossaryKeys(termId: string) {
  const entry = glossaryTerms[termId]
  if (!entry) return null
  return {
    definition: `${entry.keyPrefix}.definition`,
    context: `${entry.keyPrefix}.context`,
    importance: `${entry.keyPrefix}.importance`,
  }
}
