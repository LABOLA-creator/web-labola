import type {ReactNode} from 'react'

export function bracketHighlight(
  text: string,
  highlightColor = '#DDD000'
): ReactNode[] {
  const lines = text.split(/<br\s*\/?>/gi)

  return lines.flatMap((line, lineIndex) => {
    const highlightedLine = line.split(/(\[[^\]]+\])/g).map((part, partIndex) => {
      if (!part) return null

      const isBracketChunk = part.startsWith('[') && part.endsWith(']')
      const key = `${lineIndex}-${partIndex}-${part}`

      if (!isBracketChunk) {
        return <span key={key}>{part}</span>
      }

      return (
        <span key={key} style={{color: highlightColor}}>
          {part.slice(1, -1)}
        </span>
      )
    })

    if (lineIndex === lines.length - 1) {
      return highlightedLine
    }

    return [...highlightedLine, <br key={`br-${lineIndex}`} />]
  })
}
