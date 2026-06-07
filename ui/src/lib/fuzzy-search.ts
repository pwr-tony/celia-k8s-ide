interface FuzzyMatch {
  score: number
  indices: number[]
}

export function fuzzyMatch(pattern: string, str: string): FuzzyMatch | null {
  const patternLower = pattern.toLowerCase()
  const strLower = str.toLowerCase()

  if (patternLower.length === 0) {
    return { score: 0, indices: [] }
  }

  if (patternLower.length > strLower.length) {
    return null
  }

  const indices: number[] = []
  let patternIdx = 0
  let score = 0
  let prevMatchIdx = -1

  for (let strIdx = 0; strIdx < strLower.length && patternIdx < patternLower.length; strIdx++) {
    if (strLower[strIdx] === patternLower[patternIdx]) {
      indices.push(strIdx)

      if (strIdx === 0) {
        score += 10
      } else if (str[strIdx - 1] === ' ' || str[strIdx - 1] === '-' || str[strIdx - 1] === '_') {
        score += 8
      } else if (prevMatchIdx === strIdx - 1) {
        score += 5
      } else {
        score += 1
      }

      prevMatchIdx = strIdx
      patternIdx++
    }
  }

  if (patternIdx !== patternLower.length) {
    return null
  }

  return { score, indices }
}

export function fuzzyFilter<T>(
  items: T[],
  pattern: string,
  accessor: (item: T) => string
): Array<{ item: T; score: number; indices: number[] }> {
  if (!pattern) {
    return items.map((item) => ({ item, score: 0, indices: [] }))
  }

  const results: Array<{ item: T; score: number; indices: number[] }> = []

  for (const item of items) {
    const text = accessor(item)
    const match = fuzzyMatch(pattern, text)
    if (match) {
      results.push({ item, score: match.score, indices: match.indices })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}
