import { motion } from 'framer-motion'
import { Target, Search } from 'lucide-react'
import { ANIMATION_VARIANTS } from '@/lib/constants'
import { useAuditTree } from '@/hooks/useAuditTree'
import AuditTreeD3 from '@/components/objective/AuditTreeD3'
import RadarChart from '@/components/objective/RadarChart'
import DualProgress from '@/components/objective/DualProgress'
import FindingsTable from '@/components/objective/FindingsTable'
import NodeDetail from '@/components/objective/NodeDetail'
import AIInsightPanel from '@/components/objective/AIInsightPanel'
import { useTranslation } from '@/hooks/useTranslation'

export default function ObjectivePage() {
  const {
    treeData,
    selectedNode,
    setSelectedNode,
    searchQuery,
    setSearchQuery,
    isLoading,
  } = useAuditTree()
  const { t } = useTranslation()

  return (
    <motion.div {...ANIMATION_VARIANTS.fadeIn} className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3">
          <Target className="h-7 w-7 text-brand-primary" />
          <h1 className="text-2xl font-bold text-gray-900">{t('objective.title')}</h1>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('objective.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-interactive/30 focus:border-brand-interactive bg-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 min-h-0">
        {/* Left Panel */}
        <div className="flex flex-col gap-5 min-h-0">
          {/* Tree Visualization */}
          <div className="flex-1 min-h-[300px] lg:min-h-[500px]">
            {isLoading ? (
              <div className="w-full h-full rounded-lg border border-gray-200 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-brand-interactive border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">{t('objective.loading')}</span>
                </div>
              </div>
            ) : treeData ? (
              <AuditTreeD3
                data={treeData}
                onNodeSelect={setSelectedNode}
                searchQuery={searchQuery}
                selectedNodeId={selectedNode?.id}
              />
            ) : (
              <div className="w-full h-full rounded-lg border border-gray-200 bg-white flex items-center justify-center">
                <span className="text-sm text-gray-400">{t('objective.noData')}</span>
              </div>
            )}
          </div>

          {/* Findings Table */}
          <FindingsTable />
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <RadarChart />
          <DualProgress />
          <AIInsightPanel />
        </div>
      </div>

      {/* Node Detail Sheet */}
      <NodeDetail
        node={selectedNode}
        open={selectedNode !== null}
        onClose={() => setSelectedNode(null)}
      />
    </motion.div>
  )
}
