import React from 'react'
import Image from 'next/image'

const OpenGraphPreviewCard = ({ title, description, image, websiteUrl }) => {
  return (
    <div className="flex h-[128px] w-[520px] flex-shrink-0 overflow-hidden rounded border border-gray-200 shadow-md">
      {image && (
        <div className="relative h-full w-[160px] flex-shrink-0">
          <Image
            src={image}
            alt="Open Graph"
            layout="fill"
            objectFit="cover"
            className="rounded-l"
          />
        </div>
      )}
      {/* Scrollable Right Section */}
      <div className="flex h-full w-[360px] flex-col overflow-y-auto bg-gray-50 px-3 pt-3">
        <div>
          <p className="mb-1 font-bold text-black">{title}</p>
          <p className="mb-2 text-xs text-black">{description}</p>
        </div>
        <p className="mt-auto text-xs text-black">{websiteUrl}</p>
      </div>
    </div>
  )
}

export default OpenGraphPreviewCard
