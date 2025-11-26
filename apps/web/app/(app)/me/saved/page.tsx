'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Search,
  MapPin,
  Trash2,
  Sparkles,
  Grid3X3,
  List,
  Bell,
  BellOff,
  ArrowRight,
  Filter,
} from 'lucide-react';
import clsx from 'clsx';

// Mock data
const mockSavedListings = [
  {
    id: '1',
    title: 'Sunny room in Nachlaot',
    type: 'room',
    price: 2800,
    neighborhood: 'Nachlaot',
    address: 'Ben Yehuda Street',
    rooms: 1,
    size: 18,
    furnished: true,
    availableFrom: '2024-02-01',
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'],
    match: 95,
    savedAt: '2024-01-18',
    notifications: true,
    status: 'active',
  },
  {
    id: '2',
    title: 'Modern studio in Baka',
    type: 'apartment',
    price: 4200,
    neighborhood: 'Baka',
    address: 'Derech Beit Lechem',
    rooms: 1,
    size: 35,
    furnished: true,
    availableFrom: '2024-01-15',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop'],
    match: 88,
    savedAt: '2024-01-15',
    notifications: false,
    status: 'active',
  },
  {
    id: '3',
    title: 'Cozy apartment in Katamon',
    type: 'apartment',
    price: 5500,
    neighborhood: 'Katamon',
    address: 'Haportzim Street',
    rooms: 2,
    size: 55,
    furnished: false,
    availableFrom: '2024-02-15',
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop'],
    match: 82,
    savedAt: '2024-01-10',
    notifications: true,
    status: 'active',
  },
  {
    id: '4',
    title: 'Spacious apartment in German Colony',
    type: 'apartment',
    price: 7500,
    neighborhood: 'German Colony',
    address: 'Emek Refaim',
    rooms: 3,
    size: 85,
    furnished: true,
    availableFrom: '2024-03-01',
    photos: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop'],
    match: 72,
    savedAt: '2024-01-05',
    notifications: false,
    status: 'filled',
  },
];

export default function SavedPage() {
  const [listings, setListings] = useState(mockSavedListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilledOnly, setShowFilledOnly] = useState(false);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showFilledOnly ? listing.status === 'filled' : listing.status === 'active';
    return matchesSearch && matchesStatus;
  });

  const removeListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const toggleNotifications = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notifications: !l.notifications } : l))
    );
  };

  const activeCount = listings.filter((l) => l.status === 'active').length;
  const filledCount = listings.filter((l) => l.status === 'filled').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-bold text-midnight">
            Saved Listings
          </h1>
          <p className="text-midnight/60 mt-1">
            {activeCount} saved listing{activeCount !== 1 ? 's' : ''}
            {filledCount > 0 && ` • ${filledCount} no longer available`}
          </p>
        </div>
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-mint font-medium hover:underline"
        >
          Browse more listings <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-float p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/40" />
            <input
              type="text"
              placeholder="Search saved listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint text-sm"
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center gap-2 bg-sandstone/50 rounded-xl p-1">
            <button
              onClick={() => setShowFilledOnly(false)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                !showFilledOnly
                  ? 'bg-white text-midnight shadow-sm'
                  : 'text-midnight/60 hover:text-midnight'
              )}
            >
              Available ({activeCount})
            </button>
            <button
              onClick={() => setShowFilledOnly(true)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                showFilledOnly
                  ? 'bg-white text-midnight shadow-sm'
                  : 'text-midnight/60 hover:text-midnight'
              )}
            >
              Filled ({filledCount})
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-mint text-white'
                  : 'bg-sandstone/50 text-midnight/60 hover:bg-sandstone'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-mint text-white'
                  : 'bg-sandstone/50 text-midnight/60 hover:bg-sandstone'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-float p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-sandstone mx-auto flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-midnight/30" />
          </div>
          <h3 className="text-lg font-bold text-midnight mb-2">
            {searchQuery ? 'No matching listings' : 'No saved listings'}
          </h3>
          <p className="text-midnight/60 mb-6">
            {searchQuery
              ? 'Try adjusting your search'
              : showFilledOnly
              ? 'No filled listings in your saved collection'
              : 'Start saving listings you like to keep track of them'}
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-5 py-3 bg-mint text-white font-bold rounded-full hover:bg-mint/90 transition-all"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <motion.div
          layout
          className={clsx(
            viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredListings.map((listing) => (
              <SavedListingCard
                key={listing.id}
                listing={listing}
                viewMode={viewMode}
                onRemove={() => removeListing(listing.id)}
                onToggleNotifications={() => toggleNotifications(listing.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Notification Info */}
      {filteredListings.some((l) => l.notifications) && (
        <div className="mt-8 p-4 bg-mint/10 rounded-2xl flex items-start gap-3">
          <Bell className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-midnight">Price Drop Alerts Active</p>
            <p className="text-sm text-midnight/60 mt-1">
              You'll receive notifications when prices change for listings with alerts enabled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SavedListingCard({
  listing,
  viewMode,
  onRemove,
  onToggleNotifications,
}: {
  listing: typeof mockSavedListings[0];
  viewMode: 'grid' | 'list';
  onRemove: () => void;
  onToggleNotifications: () => void;
}) {
  const isFilled = listing.status === 'filled';

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={clsx(
          'bg-white rounded-2xl shadow-float overflow-hidden',
          isFilled && 'opacity-60'
        )}
      >
        <div className="flex">
          <Link
            href={`/listing/${listing.id}`}
            className="relative w-48 flex-shrink-0"
          >
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {isFilled && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white/90 text-midnight text-sm font-medium px-3 py-1 rounded-full">
                  No longer available
                </span>
              </div>
            )}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-mint flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {listing.match}%
            </div>
          </Link>

          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-mint uppercase tracking-wider">
                  {listing.type}
                </span>
                <Link
                  href={`/listing/${listing.id}`}
                  className="block font-bold text-midnight text-lg mt-1 hover:text-mint transition-colors"
                >
                  {listing.title}
                </Link>
                <div className="flex items-center gap-1 text-sm text-midnight/60 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.neighborhood}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleNotifications}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    listing.notifications
                      ? 'bg-mint/10 text-mint'
                      : 'bg-sandstone text-midnight/40 hover:text-midnight'
                  )}
                  title={listing.notifications ? 'Disable price alerts' : 'Enable price alerts'}
                >
                  {listing.notifications ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={onRemove}
                  className="p-2 rounded-lg bg-sandstone text-midnight/40 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-midnight/60">
              <span>{listing.rooms} {listing.rooms === 1 ? 'room' : 'rooms'}</span>
              <span>•</span>
              <span>{listing.size}m²</span>
              <span>•</span>
              <span>{listing.furnished ? 'Furnished' : 'Unfurnished'}</span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-sandstone">
              <p className="text-xl font-bold text-midnight">
                ₪{listing.price.toLocaleString()}
                <span className="text-sm font-normal text-midnight/50">/mo</span>
              </p>
              <span className="text-xs text-midnight/40">
                Saved {new Date(listing.savedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={clsx(
        'group bg-white rounded-2xl shadow-float overflow-hidden',
        isFilled && 'opacity-60'
      )}
    >
      <Link href={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {isFilled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white/90 text-midnight text-sm font-medium px-3 py-1 rounded-full">
                No longer available
              </span>
            </div>
          )}

          {/* Match Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-mint flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {listing.match}% match
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleNotifications();
              }}
              className={clsx(
                'p-2 rounded-full transition-all',
                listing.notifications
                  ? 'bg-mint text-white'
                  : 'bg-white/80 backdrop-blur-sm text-midnight/40 hover:text-mint'
              )}
              title={listing.notifications ? 'Disable price alerts' : 'Enable price alerts'}
            >
              {listing.notifications ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemove();
              }}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-midnight/40 hover:text-red-500 hover:bg-white transition-all"
              title="Remove from saved"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Type Badge */}
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-midnight/80 backdrop-blur-sm rounded-full text-xs font-medium text-white capitalize">
            {listing.type}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-midnight group-hover:text-mint transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-midnight/60 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {listing.neighborhood}
          </div>

          <div className="flex items-center gap-3 mt-3 text-sm text-midnight/60">
            <span>{listing.rooms} {listing.rooms === 1 ? 'room' : 'rooms'}</span>
            <span>•</span>
            <span>{listing.size}m²</span>
            {listing.furnished && (
              <>
                <span>•</span>
                <span>Furnished</span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-sandstone">
            <p className="text-xl font-bold text-midnight">
              ₪{listing.price.toLocaleString()}
              <span className="text-sm font-normal text-midnight/50">/mo</span>
            </p>
            <span className="text-xs text-midnight/40">
              {new Date(listing.availableFrom).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
