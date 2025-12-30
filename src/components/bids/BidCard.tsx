'use client';

import React from 'react';

interface BidCardProps {
  bid: {
    id: string;
    totalPrice: number;
    matchScore: number;
    rank: 'TOP_MATCH' | 'GOOD_MATCH' | 'STANDARD';
    insights: string[];
    estimatedPickupDate?: string;
    estimatedDeliveryDate?: string;
    carrier: {
      id: string;
      companyName: string;
      rating: number;
      successRate?: number;
      onTimeDeliveryRate?: number;
      verifications: any[];
    };
  };
  onSelect: (bidId: string) => void;
  isSelecting?: boolean;
}

export default function BidCard({ bid, onSelect, isSelecting = false }: BidCardProps) {
  const isTopMatch = bid.rank === 'TOP_MATCH';
  const isGoodMatch = bid.rank === 'GOOD_MATCH';

  return (
    <div
      className={`
        relative border rounded-lg p-6 mb-4 transition-all hover:shadow-lg
        ${isTopMatch ? 'border-green-500 border-2 bg-green-50' : ''}
        ${isGoodMatch ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}
      `}
    >
      {/* Top Match Badge */}
      {isTopMatch && (
        <div className="absolute -top-3 left-6 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Recommended by VectorNode
        </div>
      )}

      {/* Top Match Reason */}
      {isTopMatch && bid.insights.length > 0 && (
        <div className="mt-2 mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900">
            <strong className="font-semibold">Why this carrier?</strong>{' '}
            {bid.insights.slice(0, 2).join(', ').toLowerCase()}.
          </p>
        </div>
      )}

      <div className="flex justify-between items-start mt-2">
        {/* Carrier Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {bid.carrier.companyName}
          </h3>

          {/* Rating & Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Star Rating */}
            {bid.carrier.rating > 0 && (
              <div className="flex items-center bg-white px-2 py-1 rounded border border-gray-200">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 font-semibold text-gray-900">{bid.carrier.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Verified Badge */}
            {bid.carrier.verifications.length >= 3 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}

            {/* On-Time Badge */}
            {(() => {
              const rate = bid.carrier.successRate ?? bid.carrier.onTimeDeliveryRate ?? 0;
              const normalizedRate = rate > 1 ? rate / 100 : rate;
              return normalizedRate >= 0.90 ? (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {Math.round(normalizedRate * 100)}% success
                </span>
              ) : null;
            })()}
          </div>

          {/* Insights */}
          {bid.insights.length > 0 && (
            <ul className="text-sm text-gray-700 space-y-1.5 mb-3">
              {bid.insights.slice(0, 3).map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Estimated Dates */}
          {(bid.estimatedPickupDate || bid.estimatedDeliveryDate) && (
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              {bid.estimatedPickupDate && (
                <div>Pickup: {new Date(bid.estimatedPickupDate).toLocaleDateString()}</div>
              )}
              {bid.estimatedDeliveryDate && (
                <div>Delivery: {new Date(bid.estimatedDeliveryDate).toLocaleDateString()}</div>
              )}
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="text-right ml-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            €{bid.totalPrice.toLocaleString()}
          </div>

          {isTopMatch && (
            <div className="text-xs text-green-700 mb-3 font-medium">
              Match Score: {bid.matchScore}/100
            </div>
          )}

          <button
            onClick={() => onSelect(bid.id)}
            disabled={isSelecting}
            className={`
              px-6 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
              ${isTopMatch
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                : isGoodMatch
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                : 'bg-gray-700 hover:bg-gray-800 text-white'
              }
            `}
          >
            {isSelecting ? 'Selecting...' : 'Select Carrier'}
          </button>
        </div>
      </div>

      {/* Match indicator for non-top matches */}
      {!isTopMatch && bid.matchScore >= 65 && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 flex items-center justify-between">
          <span>Good alternative</span>
          <span className="font-medium">Match score: {bid.matchScore}/100</span>
        </div>
      )}

      {/* Lower score indicator */}
      {bid.matchScore < 65 && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between">
          <span>Standard match</span>
          <span>Score: {bid.matchScore}/100</span>
        </div>
      )}
    </div>
  );
}
