'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Archive,
  TrendingUp,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

// Mock data
const mockMyListings = [
  {
    id: '1',
    title: 'Sunny room in Nachlaot',
    type: 'room',
    price: 2800,
    neighborhood: 'Nachlaot',
    address: 'Ben Yehuda Street 42',
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
    status: 'active',
    completeness: 92,
    views: 156,
    applications: 8,
    messages: 12,
    viewings: 3,
    createdAt: '2024-01-10',
    availableFrom: '2024-02-01',
  },
  {
    id: '2',
    title: 'Modern studio in Baka',
    type: 'apartment',
    price: 4200,
    neighborhood: 'Baka',
    address: 'Derech Beit Lechem 15',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'],
    status: 'active',
    completeness: 85,
    views: 89,
    applications: 5,
    messages: 7,
    viewings: 2,
    createdAt: '2024-01-15',
    availableFrom: '2024-01-20',
  },
  {
    id: '3',
    title: 'Cozy apartment in Katamon',
    type: 'apartment',
    price: 5500,
    neighborhood: 'Katamon',
    address: 'Haportzim Street 8',
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
    status: 'draft',
    completeness: 65,
    views: 0,
    applications: 0,
    messages: 0,
    viewings: 0,
    createdAt: '2024-01-18',
    availableFrom: '2024-03-01',
  },
  {
    id: '4',
    title: 'Charming room in Rehavia',
    type: 'room',
    price: 3200,
    neighborhood: 'Rehavia',
    address: 'Azza Street 25',
    photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop'],
    status: 'filled',
    completeness: 100,
    views: 234,
    applications: 15,
    messages: 28,
    viewings: 6,
    createdAt: '2023-12-01',
    availableFrom: '2024-01-01',
  },
];

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-mint/10 text-mint',
    icon: CheckCircle,
  },
  draft: {
    label: 'Draft',
    color: 'bg-apricot/10 text-apricot',
    icon: Clock,
  },
  paused: {
    label: 'Paused',
    color: 'bg-sandstone text-midnight/60',
    icon: AlertCircle,
  },
  filled: {
    label: 'Filled',
    color: 'bg-midnight/10 text-midnight/60',
    icon: CheckCircle,
  },
};

export default function MyListingsPage() {
  const [listings, setListings] = useState(mockMyListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    totalViews: listings.reduce((sum, l) => sum + l.views, 0),
    totalApplications: listings.reduce((sum, l) => sum + l.applications, 0),
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-bold text-midnight">
            My Listings
          </h1>
          <p className="text-midnight/60 mt-1">
            Manage your property listings
          </p>
        </div>
        <Link
          href="/me/listings/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-mint text-white font-bold rounded-full hover:bg-mint/90 transition-all hover:shadow-glow"
        >
          <Plus className="w-4 h-4" />
          Create Listing
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FileText}
          label="Total Listings"
          value={stats.total}
          color="midnight"
        />
        <StatCard
          icon={CheckCircle}
          label="Active"
          value={stats.active}
          color="mint"
        />
        <StatCard
          icon={Eye}
          label="Total Views"
          value={stats.totalViews}
          color="apricot"
        />
        <StatCard
          icon={MessageSquare}
          label="Applications"
          value={stats.totalApplications}
          color="mint"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-float p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/40" />
            <input
              type="text"
              placeholder="Search your listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint text-sm font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="filled">Filled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-float p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-sandstone mx-auto flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-midnight/30" />
          </div>
          <h3 className="text-lg font-bold text-midnight mb-2">No listings found</h3>
          <p className="text-midnight/60 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : "You haven't created any listings yet"}
          </p>
          <Link
            href="/me/listings/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-mint text-white font-bold rounded-full hover:bg-mint/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => {
            const status = statusConfig[listing.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-float overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image */}
                    <Link
                      href={`/listing/${listing.id}`}
                      className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {listing.status === 'draft' && listing.completeness < 70 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <p className="text-sm font-medium">{listing.completeness}% complete</p>
                            <p className="text-xs opacity-80">Finish to publish</p>
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={clsx(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                status.color
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                            <span className="text-xs text-midnight/40 capitalize">
                              {listing.type}
                            </span>
                          </div>
                          <Link
                            href={`/listing/${listing.id}`}
                            className="font-bold text-midnight hover:text-mint transition-colors"
                          >
                            {listing.title}
                          </Link>
                          <div className="flex items-center gap-1 text-sm text-midnight/60 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {listing.neighborhood}
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(openMenuId === listing.id ? null : listing.id)
                            }
                            className="p-2 rounded-lg hover:bg-sandstone transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-midnight/60" />
                          </button>

                          <AnimatePresence>
                            {openMenuId === listing.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-sandstone py-1 z-10 min-w-[160px]"
                              >
                                <Link
                                  href={`/me/listings/${listing.id}/edit`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-midnight/70 hover:bg-sandstone hover:text-midnight transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Link>
                                <Link
                                  href={`/listing/${listing.id}`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-midnight/70 hover:bg-sandstone hover:text-midnight transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Link>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-midnight/70 hover:bg-sandstone hover:text-midnight transition-colors">
                                  <Archive className="w-4 h-4" />
                                  {listing.status === 'active' ? 'Pause' : 'Activate'}
                                </button>
                                <hr className="my-1 border-sandstone" />
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-sm text-midnight/60">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium text-midnight">{listing.views}</span> views
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-midnight/60">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium text-midnight">{listing.applications}</span>{' '}
                          applications
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-midnight/60">
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-medium text-midnight">{listing.messages}</span>{' '}
                          messages
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-midnight/60">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium text-midnight">{listing.viewings}</span>{' '}
                          viewings
                        </div>
                      </div>

                      {/* Price & Date */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-sandstone">
                        <p className="text-xl font-bold text-midnight">
                          ₪{listing.price.toLocaleString()}
                          <span className="text-sm font-normal text-midnight/50">/mo</span>
                        </p>
                        <p className="text-sm text-midnight/50">
                          Available{' '}
                          {new Date(listing.availableFrom).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      {/* Completeness Bar (for drafts) */}
                      {listing.status === 'draft' && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-midnight/60">Completeness</span>
                            <span className="font-medium text-midnight">{listing.completeness}%</span>
                          </div>
                          <div className="h-2 bg-sandstone rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all',
                                listing.completeness >= 70 ? 'bg-mint' : 'bg-apricot'
                              )}
                              style={{ width: `${listing.completeness}%` }}
                            />
                          </div>
                          {listing.completeness < 70 && (
                            <p className="text-xs text-apricot mt-1">
                              Complete at least 70% to publish
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: 'mint' | 'apricot' | 'midnight';
}) {
  const colorClasses = {
    mint: 'bg-mint/10 text-mint',
    apricot: 'bg-apricot/10 text-apricot',
    midnight: 'bg-midnight/5 text-midnight',
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-float">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colorClasses[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-midnight">{value}</p>
      <p className="text-sm text-midnight/60">{label}</p>
    </div>
  );
}
