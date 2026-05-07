import React from 'react';

// Card Skeleton Loader
export const CardSkeleton = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    ))}
  </div>
);

// Task Card Skeleton
export const TaskCardSkeleton = ({ count = 1 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-2 h-2 bg-gray-200 rounded-full mt-2" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Project Card Skeleton
export const ProjectCardSkeleton = ({ count = 1 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="space-y-3 mb-4">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white" />
            <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white" />
            <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-12 mb-3" />
        <div className="w-full bg-gray-200 rounded-full h-2" />
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
    <div className="border-b border-gray-200">
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton = ({ count = 5, hasAvatar = true }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg animate-pulse">
        {hasAvatar && <div className="w-8 h-8 bg-gray-200 rounded-full" />}
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
    ))}
  </div>
);

// Form Skeleton
export const FormSkeleton = () => (
  <div className="space-y-4">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-24 bg-gray-200 rounded-lg" />
    </div>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/5 mb-2" />
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
    <div className="flex gap-3">
      <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse" />
      <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
    </div>
  </div>
);

export default {
  CardSkeleton,
  TaskCardSkeleton,
  ProjectCardSkeleton,
  StatsCardSkeleton,
  TableSkeleton,
  ListSkeleton,
  FormSkeleton,
};
