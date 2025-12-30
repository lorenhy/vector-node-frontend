'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import BidCard from '@/components/bids/BidCard';

interface MatchingStats {
  totalBids: number;
  topMatches: number;
  goodMatches: number;
  standardMatches: number;
  averageScore: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export default function ShipmentBidsPage() {
  const params = useParams();
  const router = useRouter();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShipment();
  }, [params.id]);

  async function loadShipment() {
    try {
      setLoading(true);
      const res = await api.get(`/shipments/${params.id}/ranked-bids`);
      setShipment(res.data);
    } catch (error: any) {
      console.error('Failed to load shipment:', error);
      setError(error.response?.data?.error || 'Failed to load shipment');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectBid(bidId: string) {
    if (!confirm('Are you sure you want to select this carrier? This action cannot be undone.')) {
      return;
    }

    try {
      setSelecting(true);
      await api.post(`/shipments/${params.id}/select-bid`, { bidId });
      alert('Carrier selected successfully!');
      router.push(`/shipper/shipments/${params.id}`);
    } catch (error: any) {
      console.error('Failed to select bid:', error);
      alert(error.response?.data?.error || 'Failed to select carrier');
    } finally {
      setSelecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading bids...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => router.push('/shipper')}
            className="mt-4 text-red-600 hover:text-red-800 underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Shipment not found</p>
        </div>
      </div>
    );
  }

  const { bids, matchingStats } = shipment;
  const topMatches = bids?.filter((b: any) => b.rank === 'TOP_MATCH') || [];
  const goodMatches = bids?.filter((b: any) => b.rank === 'GOOD_MATCH') || [];
  const otherBids = bids?.filter((b: any) => b.rank === 'STANDARD') || [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/shipper')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Select Carrier for Your Shipment
        </h1>
        <p className="text-gray-600 mb-4">
          {shipment.pickupCity}, {shipment.pickupCountry} → {shipment.deliveryCity}, {shipment.deliveryCountry}
        </p>

        {/* Price Range Confidence */}
        {matchingStats && bids.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="text-sm text-blue-700 font-medium">Fair Market Price</div>
                <div className="text-2xl font-bold text-blue-900">
                  €{matchingStats.priceRange.min.toLocaleString()} - €{matchingStats.priceRange.max.toLocaleString()}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className={`inline-block px-3 py-1 rounded-full ${
                  matchingStats.confidence === 'HIGH' ? 'bg-green-100 border border-green-300' :
                  matchingStats.confidence === 'MEDIUM' ? 'bg-blue-100 border border-blue-300' :
                  'bg-yellow-100 border border-yellow-300'
                }`}>
                  <span className={`text-xs font-semibold ${
                    matchingStats.confidence === 'HIGH' ? 'text-green-800' :
                    matchingStats.confidence === 'MEDIUM' ? 'text-blue-800' :
                    'text-yellow-800'
                  }`}>
                    {matchingStats.confidence || 'Medium'} Confidence
                  </span>
                </div>
                <div className="text-xs text-blue-600 mt-1">Based on {matchingStats.totalBids} competitive bids</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {matchingStats && bids.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{matchingStats.totalBids}</div>
              <div className="text-sm text-gray-600">Total Bids</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{matchingStats.topMatches}</div>
              <div className="text-sm text-gray-600">Top Matches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{matchingStats.averageScore}/100</div>
              <div className="text-sm text-gray-600">Avg Match Score</div>
            </div>
          </div>
        )}
      </div>

      {/* No Bids State */}
      {(!bids || bids.length === 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bids Yet</h3>
          <p className="text-gray-600">
            Carriers will start bidding on your shipment soon. Check back in a few hours.
          </p>
        </div>
      )}

      {/* Top Matches */}
      {topMatches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900">
              Best Match{topMatches.length > 1 ? 'es' : ''}
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            Our smart matching engine identified {topMatches.length === 1 ? 'this carrier' : 'these carriers'} as the best fit for your shipment.
          </p>
          {topMatches.map((bid: any) => (
            <BidCard key={bid.id} bid={bid} onSelect={handleSelectBid} isSelecting={selecting} />
          ))}
        </section>
      )}

      {/* Good Matches */}
      {goodMatches.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Good Alternatives
          </h2>
          <p className="text-gray-600 mb-4">
            These carriers also match your requirements well.
          </p>
          {goodMatches.map((bid: any) => (
            <BidCard key={bid.id} bid={bid} onSelect={handleSelectBid} isSelecting={selecting} />
          ))}
        </section>
      )}

      {/* Other Bids */}
      {otherBids.length > 0 && (
        <details className="mt-8 bg-gray-50 rounded-lg p-4">
          <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            View {otherBids.length} more bid{otherBids.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-4">
            {otherBids.map((bid: any) => (
              <BidCard key={bid.id} bid={bid} onSelect={handleSelectBid} isSelecting={selecting} />
            ))}
          </div>
        </details>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          How does Smart Matching work?
        </h3>
        <p className="text-blue-800 text-sm">
          VectorNode analyzes 50+ factors including carrier rating, on-time delivery rate, verification level,
          price competitiveness, response time, and fleet size to recommend the best carriers for your shipment.
          Higher match scores indicate better overall fit.
        </p>
      </div>
    </div>
  );
}
