import { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import type { ImpactResult } from '@/types/impact'
import { useTranslation } from '@/hooks/useTranslation'
import SimulationLoader from './SimulationLoader'

interface ForceGraphD3Props {
  data: ImpactResult | null
  isSimulating: boolean
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  level: string
  radius: number
  color: string
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  style: 'solid' | 'dashed' | 'dotted'
  width: number
}

export default function ForceGraphD3({ data, isSimulating }: ForceGraphD3Props) {
  const { t } = useTranslation()
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null)

  const renderGraph = useCallback(() => {
    if (!svgRef.current || !data) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const container = svgRef.current.parentElement
    const width = container?.clientWidth ?? 700
    const height = container?.clientHeight ?? 500

    svg.attr('width', width).attr('height', height)

    // Setup zoom
    const g = svg.append('g')
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    svg.call(zoom)

    // Prepare data
    const nodes: SimNode[] = data.nodes.map((n) => ({ ...n }))
    const links: SimLink[] = data.links.map((l) => ({
      source: l.source,
      target: l.target,
      style: l.style,
      width: l.width,
    }))

    // Create simulation
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius((d) => d.radius + 5))

    simulationRef.current = simulation

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => d.width)
      .attr('stroke-dasharray', (d) => {
        if (d.style === 'dashed') return '6,4'
        if (d.style === 'dotted') return '2,3'
        return null
      })

    // Draw node groups
    const nodeGroup = g.append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'grab')

    // Node circles
    nodeGroup.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9)

    // Pulse animation for source node (index 0)
    nodeGroup.filter((_, i) => i === 0)
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', 'none')
      .attr('stroke', '#FF6B00')
      .attr('stroke-width', 2)
      .attr('class', 'pulse-ring')

    // Node labels
    nodeGroup.append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 14)
      .attr('font-size', (d) => d.radius > 24 ? '11px' : '9px')
      .attr('fill', '#374151')
      .attr('font-weight', (d) => d.level === 'direct' ? '600' : '400')

    // Hover interactions
    nodeGroup
      .on('mouseenter', function (_event, d) {
        const connectedIds = new Set<string>()
        connectedIds.add(d.id)
        links.forEach((l) => {
          const src = typeof l.source === 'object' ? (l.source as SimNode).id : String(l.source)
          const tgt = typeof l.target === 'object' ? (l.target as SimNode).id : String(l.target)
          if (src === d.id) connectedIds.add(tgt)
          if (tgt === d.id) connectedIds.add(src)
        })

        nodeGroup.attr('opacity', (n) => connectedIds.has(n.id) ? 1 : 0.2)
        link.attr('stroke-opacity', (l) => {
          const src = typeof l.source === 'object' ? (l.source as SimNode).id : l.source
          const tgt = typeof l.target === 'object' ? (l.target as SimNode).id : l.target
          return src === d.id || tgt === d.id ? 0.8 : 0.1
        })
      })
      .on('mouseleave', function () {
        nodeGroup.attr('opacity', 1)
        link.attr('stroke-opacity', 0.6)
      })

    // Drag behavior
    const drag = d3.drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodeGroup.call(drag)

    // Tick update
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x!)
        .attr('y1', (d) => (d.source as SimNode).y!)
        .attr('x2', (d) => (d.target as SimNode).x!)
        .attr('y2', (d) => (d.target as SimNode).y!)

      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })
  }, [data])

  useEffect(() => {
    renderGraph()
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [renderGraph])

  // Placeholder state
  if (!data && !isSimulating) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] rounded-lg border border-dashed border-gray-300 bg-gray-50/50">
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <p className="text-sm">{t('impact.placeholderText')}</p>
        </div>
      </div>
    )
  }

  // Simulating state
  if (isSimulating) {
    return <SimulationLoader onComplete={() => {}} />
  }

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-lg border border-gray-200 bg-white overflow-hidden">
      <style>{`
        @keyframes pulse-expand {
          0% { r: 36; opacity: 0.8; }
          100% { r: 50; opacity: 0; }
        }
        .pulse-ring {
          animation: pulse-expand 1.5s ease-out infinite;
        }
      `}</style>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
