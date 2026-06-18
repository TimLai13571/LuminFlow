import { useState, useEffect, useCallback, useMemo } from 'react'
import type { AuditTreeNode } from '@/types/audit'
import { getAuditTree } from '@/services/mock-data'

function filterTree(node: AuditTreeNode, query: string): AuditTreeNode | null {
  const lowerQuery = query.toLowerCase()
  const nameMatch = node.name.toLowerCase().includes(lowerQuery)
  const idMatch = node.id.toLowerCase().includes(lowerQuery)

  if (!node.children || node.children.length === 0) {
    return nameMatch || idMatch ? node : null
  }

  const filteredChildren = node.children
    .map((child) => filterTree(child, query))
    .filter(Boolean) as AuditTreeNode[]

  if (nameMatch || idMatch || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children }
  }

  return null
}

export function useAuditTree() {
  const [treeData, setTreeData] = useState<AuditTreeNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<AuditTreeNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getAuditTree().then((data) => {
      if (!cancelled) {
        setTreeData(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredTreeData = useMemo(() => {
    if (!treeData || !searchQuery.trim()) return treeData
    return filterTree(treeData, searchQuery.trim())
  }, [treeData, searchQuery])

  const handleSelectNode = useCallback((node: AuditTreeNode | null) => {
    setSelectedNode(node)
  }, [])

  return {
    treeData: filteredTreeData,
    selectedNode,
    setSelectedNode: handleSelectNode,
    searchQuery,
    setSearchQuery,
    isLoading,
  }
}
