import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import type { AuditTreeNode } from '@/types/audit'

interface AuditTreeD3Props {
  data: AuditTreeNode
  onNodeSelect: (node: AuditTreeNode) => void
  searchQuery?: string
  selectedNodeId?: string | null
}

const STATUS_COLOR_MAP: Record<string, string> = {
  completed: '#009A44',
  in_progress: '#1E49E2',
  pending: '#E0E0E0',
  deficiency: '#D32F2F',
  delayed: '#FF6B00',
}

const LEVEL_RADIUS: Record<string, number> = {
  root: 28,
  risk_area: 24,
  control: 20,
  finding: 16,
}

function getStatusColor(status: string): string {
  return STATUS_COLOR_MAP[status] || '#E0E0E0'
}

// Extended hierarchy node type with _children for collapse state
type TreeHierarchyNode = d3.HierarchyPointNode<AuditTreeNode> & {
  _children?: TreeHierarchyNode[] | undefined
  children: TreeHierarchyNode[] | undefined
  x0?: number
  y0?: number
}

export default function AuditTreeD3({ data, onNodeSelect, searchQuery, selectedNodeId }: AuditTreeD3Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<TreeHierarchyNode | null>(null)
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const treeLayoutRef = useRef<d3.TreeLayout<AuditTreeNode> | null>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const initializedRef = useRef(false)

  // Collapse nodes at depth >= 2 initially
  const collapseDeep = useCallback((node: TreeHierarchyNode, depth: number) => {
    if (node.children) {
      node.children.forEach((child) => collapseDeep(child as TreeHierarchyNode, depth + 1))
      if (depth >= 2) {
        node._children = node.children
        node.children = undefined
      }
    }
  }, [])

  // Check if a node has children (visible or hidden)
  const hasChildren = (d: TreeHierarchyNode): boolean => {
    return !!(d.children && d.children.length > 0) || !!(d._children && d._children.length > 0)
  }

  // Toggle children on click
  const toggle = useCallback((d: TreeHierarchyNode) => {
    if (d.children) {
      d._children = d.children
      d.children = undefined
    } else if (d._children) {
      d.children = d._children
      d._children = undefined
    }
  }, [])

  // Main update function with transitions
  const update = useCallback((source: TreeHierarchyNode) => {
    if (!gRef.current || !rootRef.current || !treeLayoutRef.current) return

    const root = rootRef.current
    const g = gRef.current
    const treeLayout = treeLayoutRef.current
    const duration = 300

    // Recompute the tree layout
    treeLayout(root as unknown as d3.HierarchyNode<AuditTreeNode>)

    const nodes = root.descendants() as TreeHierarchyNode[]
    const links = root.links() as d3.HierarchyPointLink<AuditTreeNode>[]

    // Normalize for fixed-depth
    nodes.forEach((d) => {
      d.y = d.depth * 220
    })

    // ---- LINKS ----
    const linkGenerator = d3.linkHorizontal<d3.HierarchyPointLink<AuditTreeNode>, { x: number; y: number }>()
      .x((d) => d.y)
      .y((d) => d.x)

    const link = g.selectAll<SVGPathElement, d3.HierarchyPointLink<AuditTreeNode>>('path.link')
      .data(links, (d) => (d.target as TreeHierarchyNode).data.id)

    // Enter links at the source's previous position
    const linkEnter = link.enter().append('path')
      .attr('class', 'link')
      .attr('d', () => {
        const o = { x: source.x0 ?? source.x, y: source.y0 ?? source.y }
        return linkGenerator({ source: o, target: o } as unknown as d3.HierarchyPointLink<AuditTreeNode>)
      })
      .attr('fill', 'none')
      .attr('stroke', (d) => getStatusColor((d.source as TreeHierarchyNode).data.status))
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 2)

    // Update + Enter merge
    const linkUpdate = linkEnter.merge(link)

    linkUpdate.transition()
      .duration(duration)
      .attr('d', (d) => linkGenerator(d as unknown as d3.HierarchyPointLink<AuditTreeNode>)!)
      .attr('stroke', (d) => getStatusColor((d.source as TreeHierarchyNode).data.status))
      .attr('stroke-opacity', 0.6)

    // Exit links - animate to source's new position
    link.exit<d3.HierarchyPointLink<AuditTreeNode>>().transition()
      .duration(duration)
      .attr('d', () => {
        const o = { x: source.x, y: source.y }
        return linkGenerator({ source: o, target: o } as unknown as d3.HierarchyPointLink<AuditTreeNode>)
      })
      .attr('stroke-opacity', 0)
      .remove()

    // ---- NODES ----
    const node = g.selectAll<SVGGElement, TreeHierarchyNode>('g.node')
      .data(nodes, (d) => d.data.id)

    // Enter nodes at the source's previous position
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.y0 ?? source.y},${source.x0 ?? source.x})`)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .on('click', (_event, d) => {
        if (hasChildren(d)) {
          toggle(d)
          update(d)
        }
        onNodeSelect(d.data)
      })

    // Node circles
    nodeEnter.append('circle')
      .attr('class', 'node-circle')
      .attr('r', (d) => LEVEL_RADIUS[d.data.level] || 16)
      .attr('fill', (d) => getStatusColor(d.data.status))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)

    // Expand/collapse indicator
    nodeEnter.append('text')
      .attr('class', 'expand-indicator')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (d) => (LEVEL_RADIUS[d.data.level] || 16) + 10)
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .attr('fill', '#666')
      .text((d) => {
        if (!hasChildren(d)) return ''
        return d._children ? '+' : '−'
      })

    // Node labels
    nodeEnter.append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.35em')
      .attr('x', (d) => {
        const hasChild = hasChildren(d)
        const radius = LEVEL_RADIUS[d.data.level] || 16
        if (hasChild) return -(radius) - 8
        return radius + 8
      })
      .attr('text-anchor', (d) => hasChildren(d) ? 'end' : 'start')
      .text((d) => d.data.name.length > 10 ? d.data.name.slice(0, 10) + '…' : d.data.name)
      .attr('font-size', (d) => d.data.level === 'root' ? '13px' : d.data.level === 'finding' ? '10px' : '11px')
      .attr('fill', '#333')
      .attr('font-weight', (d) => d.data.level === 'root' ? '600' : '400')

    // Node value badges
    nodeEnter.filter((d) => d.data.value !== undefined && d.data.level !== 'finding')
      .append('text')
      .attr('class', 'node-value')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => `${d.data.value}%`)
      .attr('font-size', '9px')
      .attr('fill', 'white')
      .attr('font-weight', '600')

    // Update + Enter merge
    const nodeUpdate = nodeEnter.merge(node)

    nodeUpdate.transition()
      .duration(duration)
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
      .style('opacity', 1)

    // Update circle styles (selection, search highlight)
    nodeUpdate.select<SVGCircleElement>('circle.node-circle')
      .attr('fill', (d) => getStatusColor(d.data.status))
      .attr('stroke', (d) => {
        if (selectedNodeId && d.data.id === selectedNodeId) return '#1E49E2'
        return 'white'
      })
      .attr('stroke-width', (d) => {
        if (selectedNodeId && d.data.id === selectedNodeId) return 3
        return 2
      })
      .style('filter', (d) => {
        if (selectedNodeId && d.data.id === selectedNodeId) {
          return 'drop-shadow(0 0 4px #1E49E2)'
        }
        if (searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return 'drop-shadow(0 0 6px #C5A04E)'
        }
        return 'none'
      })
      .attr('transform', (d) => {
        if (searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return 'scale(1.2)'
        }
        return 'scale(1)'
      })

    // Update expand/collapse indicator
    nodeUpdate.select<SVGTextElement>('text.expand-indicator')
      .text((d) => {
        if (!hasChildren(d)) return ''
        return d._children ? '+' : '−'
      })

    // Exit nodes - animate to source's new position
    const nodeExit = node.exit<TreeHierarchyNode>().transition()
      .duration(duration)
      .attr('transform', () => `translate(${source.y},${source.x})`)
      .style('opacity', 0)
      .remove()

    nodeExit.select('circle').attr('r', 1e-6)

    // Store previous positions for transition
    nodes.forEach((d) => {
      d.x0 = d.x
      d.y0 = d.y
    })
  }, [onNodeSelect, searchQuery, selectedNodeId, toggle])

  // Initialize the tree
  const initTree = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !data) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const containerRect = containerRef.current.getBoundingClientRect()
    const width = containerRect.width || 900
    const height = Math.max(containerRect.height, 500)

    svg.attr('width', width).attr('height', height)

    const margin = { top: 40, right: 160, bottom: 40, left: 80 }
    const innerHeight = height - margin.top - margin.bottom

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        if (gRef.current) {
          gRef.current.attr('transform', event.transform)
        }
      })

    zoomBehaviorRef.current = zoomBehavior
    svg.call(zoomBehavior)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    gRef.current = g

    // Create hierarchy
    const root = d3.hierarchy<AuditTreeNode>(data) as unknown as TreeHierarchyNode

    // Set up tree layout
    const treeLayout = d3.tree<AuditTreeNode>().size([innerHeight, 800])
    treeLayoutRef.current = treeLayout

    // Collapse deep nodes (depth >= 2)
    collapseDeep(root, 0)

    // Store root
    root.x0 = innerHeight / 2
    root.y0 = 0
    rootRef.current = root

    // Initial render
    update(root)

    // Initial zoom to fit
    const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top).scale(0.85)
    svg.call(zoomBehavior.transform, initialTransform)

    initializedRef.current = true
  }, [data, collapseDeep, update])

  // Re-render for visual state changes (selectedNodeId, searchQuery) without resetting collapse state
  const updateVisuals = useCallback(() => {
    if (!rootRef.current || !gRef.current) return
    update(rootRef.current)
  }, [update])

  useEffect(() => {
    initializedRef.current = false
    initTree()
  }, [data]) // Only reinit on data change

  useEffect(() => {
    if (initializedRef.current) {
      updateVisuals()
    }
  }, [searchQuery, selectedNodeId, updateVisuals])

  useEffect(() => {
    const handleResize = () => {
      initializedRef.current = false
      initTree()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initTree])

  return (
    <div ref={containerRef} className="w-full min-h-[500px] h-full rounded-lg border border-gray-200 bg-white overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '500px' }} />
    </div>
  )
}
