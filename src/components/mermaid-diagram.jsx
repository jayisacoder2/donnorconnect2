'use client'

import { useEffect, useRef, useState } from 'react'

export default function MermaidDiagram({ chart, className = '' }) {
  const containerRef = useRef(null)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart || !containerRef.current) return

      try {
        // Dynamic import to avoid SSR issues
        const mermaid = (await import('mermaid')).default
        
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#7c3aed',
            primaryTextColor: '#fff',
            primaryBorderColor: '#a78bfa',
            lineColor: '#a78bfa',
            secondaryColor: '#1e1b4b',
            tertiaryColor: '#312e81',
            background: '#0f0a1a',
            mainBkg: '#1e1b4b',
            secondBkg: '#312e81',
            border1: '#6366f1',
            border2: '#818cf8',
            arrowheadColor: '#a78bfa',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '12px',
            textColor: '#e2e8f0',
            nodeTextColor: '#f8fafc',
          },
          er: {
            useMaxWidth: true,
            layoutDirection: 'TB',
          },
        })

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const { svg: renderedSvg } = await mermaid.render(id, chart)
        setSvg(renderedSvg)
        setError(null)
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError(err.message || 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [chart])

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-700 rounded p-4 ${className}`}>
        <p className="text-red-400 text-sm">Failed to render diagram: {error}</p>
        <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">{chart}</pre>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`mermaid-container overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
