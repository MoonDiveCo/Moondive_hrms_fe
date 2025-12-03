import React from 'react'
import { motion } from 'framer-motion'
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`
export const ShimmerBase = ({ className, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay }}
    className={`relative overflow-hidden bg-gray-200 ${className}`}
    style={{
      background:
        'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}
  >
    {children}
    <style jsx>{shimmerKeyframes}</style>
  </motion.div>
)

export const DashboardCardsShimmer = ({ cards = 6 }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
    {[...Array(cards)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1, duration: 0.3 }}
        className="rounded-xl bg-white p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <ShimmerBase className="h-12 w-12 rounded-lg" delay={i * 0.05} />
          <ShimmerBase
            className="h-8 w-8 rounded-full"
            delay={i * 0.05 + 0.1}
          />
        </div>

        <div className="space-y-3">
          <ShimmerBase className="h-4 w-3/4 rounded" delay={i * 0.05 + 0.2} />
          <ShimmerBase className="h-8 w-1/2 rounded" delay={i * 0.05 + 0.3} />
        </div>
      </motion.div>
    ))}
  </div>
)


export const TableShimmer = ({ rows = 5, cols = 4 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-lg bg-white p-6 shadow-sm"
  >
    {/* Header */}
    <div className="mb-6 flex items-center justify-between">
      <ShimmerBase className="h-8 w-48 rounded" />
      <ShimmerBase className="h-10 w-32 rounded-lg" />
    </div>

    {/* Table Header */}
    <div className="mb-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {[...Array(cols)].map((_, i) => (
        <ShimmerBase key={i} className="h-6 rounded" delay={i * 0.05} />
      ))}
    </div>

    {/* Table Rows */}
    <div className="space-y-3">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, colIndex) => (
            <ShimmerBase
              key={colIndex}
              className="h-8 rounded"
              delay={rowIndex * 0.1 + colIndex * 0.02}
            />
          ))}
        </div>
      ))}
    </div>
  </motion.div>
)

export const EnhancedTableShimmer = ({ rows = 6, cols = 6, hasSearch = true, title = "" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Header with Search */}
    <div className="flex items-center justify-between">
      <ShimmerBase className="h-8 w-40 rounded" />
      <ShimmerBase className="h-10 w-48 rounded-lg" delay={0.1} />
    </div>

    {hasSearch && (
      <div className="flex items-center space-x-4">
        <ShimmerBase className="h-12 w-80 rounded-lg" delay={0.15} />
      </div>
    )}

    {/* Table Container */}
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-4">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {[...Array(cols)].map((_, i) => (
            <ShimmerBase key={i} className="h-4 rounded" delay={i * 0.02} />
          ))}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {[...Array(cols)].map((_, colIndex) => (
                <ShimmerBase
                  key={colIndex}
                  className="h-5 rounded"
                  delay={rowIndex * 0.05 + colIndex * 0.01}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

// Form Shimmer
export const FormShimmer = ({ fields = 4 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-lg bg-white p-6 shadow-sm"
  >
    <div className="mb-6">
      <ShimmerBase className="h-8 w-64 rounded" />
    </div>

    <div className="space-y-6">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <ShimmerBase className="h-4 w-24 rounded" delay={i * 0.1} />
          <ShimmerBase
            className="h-12 w-full rounded-lg"
            delay={i * 0.1 + 0.05}
          />
        </div>
      ))}

      <div className="flex space-x-4 pt-4">
        <ShimmerBase className="h-12 w-32 rounded-lg" delay={0.5} />
        <ShimmerBase className="h-12 w-24 rounded-lg" delay={0.6} />
      </div>
    </div>
  </motion.div>
)

// Input Fields Shimmer (Complex Form)
export const InputFieldsShimmer = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Header */}
    <div className="space-y-2">
      <ShimmerBase className="h-8 w-48 rounded" />
      <ShimmerBase className="h-4 w-96 rounded" delay={0.1} />
    </div>

    {/* Form Fields */}
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Row 1 */}
        <div className="space-y-2">
          <ShimmerBase className="h-4 w-24 rounded" />
          <ShimmerBase className="h-12 w-full rounded-lg" delay={0.05} />
        </div>
        <div className="space-y-2">
          <ShimmerBase className="h-4 w-20 rounded" delay={0.1} />
          <ShimmerBase className="h-12 w-full rounded-lg" delay={0.15} />
        </div>

        {/* Row 2 - Full Width */}
        <div className="col-span-full space-y-2">
          <ShimmerBase className="h-4 w-36 rounded" delay={0.2} />
          <ShimmerBase className="h-32 w-full rounded-lg" delay={0.25} />
        </div>

        {/* Row 3 - File Uploads */}
        <div className="space-y-2">
          <ShimmerBase className="h-4 w-28 rounded" delay={0.3} />
          <div className="flex items-center space-x-3">
            <ShimmerBase className="h-12 w-32 rounded" delay={0.35} />
            <ShimmerBase className="h-10 w-24 rounded-lg" delay={0.4} />
          </div>
        </div>
        <div className="space-y-2">
          <ShimmerBase className="h-4 w-32 rounded" delay={0.35} />
          <div className="flex items-center space-x-3">
            <ShimmerBase className="h-12 w-32 rounded" delay={0.4} />
            <ShimmerBase className="h-10 w-24 rounded-lg" delay={0.45} />
          </div>
        </div>

        {/* Row 4 */}
        <div className="space-y-2">
          <ShimmerBase className="h-4 w-28 rounded" delay={0.45} />
          <div className="flex items-center space-x-3">
            <ShimmerBase className="h-12 w-32 rounded" delay={0.5} />
            <ShimmerBase className="h-10 w-24 rounded-lg" delay={0.55} />
          </div>
        </div>

        {/* Row 5 - Full Width */}
        <div className="col-span-full space-y-2">
          <ShimmerBase className="h-4 w-36 rounded" delay={0.5} />
          <ShimmerBase className="h-12 w-full rounded-lg" delay={0.55} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4 border-t pt-6">
        <ShimmerBase className="h-12 w-32 rounded-lg" delay={0.6} />
        <ShimmerBase className="h-12 w-24 rounded-lg" delay={0.65} />
      </div>
    </div>
  </motion.div>
)

// Blog Cards Shimmer
export const BlogCardsShimmer = ({ cards = 4 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Header */}
    <div className="flex items-center justify-between">
      <ShimmerBase className="h-8 w-32 rounded" />
      <ShimmerBase className="h-10 w-20 rounded-lg" delay={0.1} />
    </div>

    {/* Blog Cards Grid */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {[...Array(cards)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="overflow-hidden rounded-lg bg-white p-0 shadow-sm"
        >
          {/* Blog Image */}
          <ShimmerBase className="h-48 w-full" delay={i * 0.05} />

          {/* Blog Content */}
          <div className="space-y-3 p-6">
            <ShimmerBase className="h-6 w-3/4 rounded" delay={i * 0.05 + 0.1} />
            <div className="space-y-2">
              <ShimmerBase
                className="h-4 w-full rounded"
                delay={i * 0.05 + 0.15}
              />
              <ShimmerBase
                className="h-4 w-full rounded"
                delay={i * 0.05 + 0.2}
              />
              <ShimmerBase
                className="h-4 w-2/3 rounded"
                delay={i * 0.05 + 0.25}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <ShimmerBase
                className="h-4 w-20 rounded"
                delay={i * 0.05 + 0.3}
              />
              <ShimmerBase
                className="h-6 w-6 rounded-full"
                delay={i * 0.05 + 0.35}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

// Testimonial Cards Shimmer
export const TestimonialCardsShimmer = ({ cards = 4 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Header */}
    <div className="flex items-center justify-between">
      <ShimmerBase className="h-8 w-40 rounded" />
      <ShimmerBase className="h-10 w-24 rounded-lg" delay={0.1} />
    </div>

    {/* Testimonial Cards */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {[...Array(cards)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-lg border bg-white p-6 shadow-sm"
        >
          {/* User Info */}
          <div className="mb-4 flex items-center space-x-4">
            <ShimmerBase className="h-12 w-12 rounded-full" delay={i * 0.05} />
            <div className="space-y-2">
              <ShimmerBase
                className="h-5 w-32 rounded"
                delay={i * 0.05 + 0.1}
              />
              <ShimmerBase
                className="h-4 w-24 rounded"
                delay={i * 0.05 + 0.15}
              />
              <ShimmerBase
                className="h-3 w-20 rounded"
                delay={i * 0.05 + 0.2}
              />
            </div>
            <div className="ml-auto flex space-x-2">
              <ShimmerBase
                className="h-6 w-6 rounded"
                delay={i * 0.05 + 0.25}
              />
              <ShimmerBase className="h-6 w-6 rounded" delay={i * 0.05 + 0.3} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

// Work Cards Shimmer (Vertical Layout)
export const WorkCardsShimmer = ({ cards = 3 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Header */}
    <ShimmerBase className="h-8 w-32 rounded" />

    {/* Work Cards - Vertical Layout */}
    <div className="space-y-4">
      {[...Array(cards)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="flex items-center space-x-4">
            {/* Project Images */}
            <div className="flex-shrink-0">
              <div className="space-y-2">
                <ShimmerBase className="h-16 w-20 rounded" delay={i * 0.05} />
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, j) => (
                    <ShimmerBase
                      key={j}
                      className="h-4 w-6 rounded"
                      delay={i * 0.05 + j * 0.02}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="flex-1 space-y-2">
              <ShimmerBase
                className="h-6 w-48 rounded"
                delay={i * 0.05 + 0.1}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <ShimmerBase
                className="h-8 w-8 rounded"
                delay={i * 0.05 + 0.15}
              />
              <ShimmerBase className="h-8 w-8 rounded" delay={i * 0.05 + 0.2} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

// Profile Shimmer
export const ProfileShimmer = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Profile Header */}
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center space-x-6">
        <ShimmerBase className="h-24 w-24 rounded-full" />
        <div className="space-y-3">
          <ShimmerBase className="h-6 w-48 rounded" />
          <ShimmerBase className="h-4 w-32 rounded" />
          <ShimmerBase className="h-4 w-64 rounded" />
        </div>
      </div>
    </div>

    {/* Profile Form */}
    <FormShimmer fields={6} />
  </motion.div>
)

// Analytics Shimmer
export const AnalyticsShimmer = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Header */}
    <div className="flex items-center justify-between">
      <ShimmerBase className="h-8 w-48 rounded" />
      <div className="flex space-x-3">
        <ShimmerBase className="h-10 w-24 rounded-lg" />
        <ShimmerBase className="h-10 w-32 rounded-lg" />
      </div>
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.2 }}
          className="rounded-lg bg-white p-6 shadow-sm"
        >
          <div className="mb-4">
            <ShimmerBase className="h-6 w-32 rounded" />
          </div>
          <ShimmerBase className="h-64 w-full rounded-lg" delay={i * 0.1} />
        </motion.div>
      ))}
    </div>

    {/* Full Width Chart */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-lg bg-white p-6 shadow-sm"
    >
      <div className="mb-4">
        <ShimmerBase className="h-6 w-40 rounded" />
      </div>
      <ShimmerBase className="h-80 w-full rounded-lg" />
    </motion.div>
  </motion.div>
)

// Content Page Shimmer (Generic)
export const ContentPageShimmer = ({ hasStats = true }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Page Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <ShimmerBase className="h-8 w-64 rounded" />
        <ShimmerBase className="h-4 w-96 rounded" />
      </div>
      <ShimmerBase className="h-10 w-32 rounded-lg" delay={0.2} />
    </div>

    {/* Stats Cards */}
    {hasStats && (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <ShimmerBase className="h-4 w-20 rounded" />
                <ShimmerBase className="h-6 w-12 rounded" />
              </div>
              <ShimmerBase className="h-8 w-8 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>
    )}

    {/* Main Content */}
    <TableShimmer rows={8} cols={5} />
  </motion.div>
)

// Shimmer Component Selector
export const ComponentShimmer = ({ section, type = 'auto' }) => {
  // Auto-detect shimmer type based on section if type not specified
  const getShimmerType = () => {
    if (type !== 'auto') return type

    // Auto-detection logic based on section names
    if (section?.includes('dashboard')) return 'dashboard-cards'
    if (section?.includes('table') || section?.includes('list')) return 'table'
    if (section?.includes('form') || section?.includes('input')) return 'form'
    if (section?.includes('blog')) return 'blog-cards'
    if (section?.includes('testimonial')) return 'testimonial-cards'
    if (section?.includes('work')) return 'work-cards'
    if (section?.includes('profile')) return 'profile'
    if (section?.includes('analytics')) return 'analytics'
    
    return 'content-page'
  }

  const shimmerType = getShimmerType()

  const shimmerComponents = {
    'dashboard-cards': <DashboardCardsShimmer />,
    'table': <EnhancedTableShimmer />,
    'form': <FormShimmer />,
    'input-fields': <InputFieldsShimmer />,
    'blog-cards': <BlogCardsShimmer />,
    'testimonial-cards': <TestimonialCardsShimmer />,
    'work-cards': <WorkCardsShimmer />,
    'profile': <ProfileShimmer />,
    'analytics': <AnalyticsShimmer />,
    'content-page': <ContentPageShimmer />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[400px]"
    >
      {shimmerComponents[shimmerType] || <ContentPageShimmer />}
    </motion.div>
  )
}