'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Heart,
  X,
  ChevronDown,
  Grid3X3,
  List,
  Sparkles,
  Home,
  Building,
  Wifi,
  Car,
  Dumbbell,
  Wind,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';

// Mock data - replace with API calls
const mockListings = [
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
    amenities: ['wifi', 'ac', 'laundry'],
    match: 95,
    saved: false,
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
    amenities: ['wifi', 'ac', 'parking', 'gym'],
    match: 88,
    saved: true,
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
    amenities: ['wifi', 'parking'],
    match: 82,
    saved: false,
  },
  {
    id: '4',
    title: 'Charming room in Rehavia',
    type: 'room',
    price: 3200,
    neighborhood: 'Rehavia',
    address: 'Azza Street',
    rooms: 1,
    size: 22,
    furnished: true,
    availableFrom: '2024-01-20',
    photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop'],
    amenities: ['wifi', 'ac', 'laundry'],
    match: 78,
    saved: false,
  },
  {
    id: '5',
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
    amenities: ['wifi', 'ac', 'parking', 'gym', 'laundry'],
    match: 72,
    saved: true,
  },
  {
    id: '6',
    title: 'Budget room in Givat Ram',
    type: 'room',
    price: 2200,
    neighborhood: 'Givat Ram',
    address: 'Near Hebrew University',
    rooms: 1,
    size: 15,
    furnished: true,
    availableFrom: '2024-01-25',
    photos: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&h=400&fit=crop'],
    amenities: ['wifi'],
    match: 68,
    saved: false,
  },
];

const neighborhoods = [
  'All Areas',
  'Nachlaot',
  'Baka',
  'Katamon',
  'Rehavia',
  'German Colony',
  'Givat Ram',
  'Talbiyeh',
  'Ein Kerem',
];

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  gym: Dumbbell,
  ac: Wind,
  laundry: Home,
};

export default function ListingsPage() {
  const [listings, setListings] = useState(mockListings);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [savedListings, setSavedListings] = useState<Set<string>>(
    new Set(mockListings.filter(l => l.saved).map(l => l.id))
  );

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All Areas');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [propertyType, setPropertyType] = useState<'all' | 'room' | 'apartment'>('all');
  const [furnished, setFurnished] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'price_asc' | 'price_desc' | 'date'>('match');

  // Apply filters
  useEffect(() => {
    let filtered = [...mockListings];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        l =>
          l.title.toLowerCase().includes(query) ||
          l.neighborhood.toLowerCase().includes(query) ||
          l.address.toLowerCase().includes(query)
      );
    }

    // Neighborhood
    if (selectedNeighborhood !== 'All Areas') {
      filtered = filtered.filter(l => l.neighborhood === selectedNeighborhood);
    }

    // Price range
    filtered = filtered.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);

    // Property type
    if (propertyType !== 'all') {
      filtered = filtered.filter(l => l.type === propertyType);
    }

    // Furnished
    if (furnished !== null) {
      filtered = filtered.filter(l => l.furnished === furnished);
    }

    // Sort
    switch (sortBy) {
      case 'match':
        filtered.sort((a, b) => b.match - a.match);
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'date':
        filtered.sort((a, b) => new Date(a.availableFrom).getTime() - new Date(b.availableFrom).getTime());
        break;
    }

    setListings(filtered);
  }, [searchQuery, selectedNeighborhood, priceRange, propertyType, furnished, sortBy]);

  const toggleSave = (id: string) => {
    setSavedListings(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedNeighborhood('All Areas');
    setPriceRange([0, 10000]);
    setPropertyType('all');
    setFurnished(null);
    setSortBy('match');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedNeighborhood !== 'All Areas' ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000 ||
    propertyType !== 'all' ||
    furnished !== null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-sans font-bold text-midnight">
          Find Your Place
        </h1>
        <p className="text-midnight/60 mt-1">
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'} available
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl shadow-float p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/40" />
            <input
              type="text"
              placeholder="Search by location, neighborhood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint focus:bg-white transition-all placeholder:text-midnight/40"
            />
          </div>

          {/* Neighborhood Select */}
          <div className="relative md:w-48">
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint focus:bg-white transition-all cursor-pointer font-medium text-midnight"
            >
              {neighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/40 pointer-events-none" />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all',
              showFilters || hasActiveFilters
                ? 'bg-mint text-white'
                : 'bg-sandstone/50 text-midnight hover:bg-sandstone'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-white text-mint text-xs font-bold rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-sandstone">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-midnight/60 mb-2">
                      Price Range (₪/mo)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0] || ''}
                        onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 bg-sandstone/50 rounded-lg border-0 focus:ring-2 focus:ring-mint text-sm"
                      />
                      <span className="text-midnight/40">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1] === 10000 ? '' : priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 10000])}
                        className="w-full px-3 py-2 bg-sandstone/50 rounded-lg border-0 focus:ring-2 focus:ring-mint text-sm"
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-midnight/60 mb-2">
                      Property Type
                    </label>
                    <div className="flex gap-2">
                      {(['all', 'room', 'apartment'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setPropertyType(type)}
                          className={clsx(
                            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            propertyType === type
                              ? 'bg-mint text-white'
                              : 'bg-sandstone/50 text-midnight/60 hover:bg-sandstone'
                          )}
                        >
                          {type === 'all' ? 'All' : type === 'room' ? 'Room' : 'Apt'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Furnished */}
                  <div>
                    <label className="block text-sm font-medium text-midnight/60 mb-2">
                      Furnished
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: null, label: 'Any' },
                        { value: true, label: 'Yes' },
                        { value: false, label: 'No' },
                      ].map((opt) => (
                        <button
                          key={String(opt.value)}
                          onClick={() => setFurnished(opt.value)}
                          className={clsx(
                            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            furnished === opt.value
                              ? 'bg-mint text-white'
                              : 'bg-sandstone/50 text-midnight/60 hover:bg-sandstone'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-midnight/60 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full appearance-none px-3 py-2 bg-sandstone/50 rounded-lg border-0 focus:ring-2 focus:ring-mint text-sm font-medium cursor-pointer"
                    >
                      <option value="match">Best Match</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="date">Available Soonest</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-mint font-medium hover:underline flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Toggle & Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-midnight/60">
          Showing <span className="font-medium text-midnight">{listings.length}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-mint text-white' : 'bg-sandstone/50 text-midnight/60 hover:bg-sandstone'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-mint text-white' : 'bg-sandstone/50 text-midnight/60 hover:bg-sandstone'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Listings Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-mint animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-sandstone mx-auto flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-midnight/30" />
          </div>
          <h3 className="text-lg font-bold text-midnight mb-2">No listings found</h3>
          <p className="text-midnight/60 mb-4">Try adjusting your filters</p>
          <button
            onClick={clearFilters}
            className="text-mint font-medium hover:underline"
          >
            Clear all filters
          </button>
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
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                viewMode={viewMode}
                isSaved={savedListings.has(listing.id)}
                onToggleSave={() => toggleSave(listing.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function ListingCard({
  listing,
  viewMode,
  isSaved,
  onToggleSave,
}: {
  listing: typeof mockListings[0];
  viewMode: 'grid' | 'list';
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-float overflow-hidden hover:shadow-xl transition-all"
      >
        <Link href={`/listing/${listing.id}`} className="flex">
          <div className="relative w-48 md:w-64 flex-shrink-0">
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-mint flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {listing.match}%
            </div>
          </div>
          <div className="flex-1 p-5 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-mint uppercase tracking-wider">
                  {listing.type}
                </span>
                <h3 className="font-bold text-midnight text-lg mt-1">{listing.title}</h3>
                <div className="flex items-center gap-1 text-sm text-midnight/60 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.neighborhood}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave();
                }}
                className={clsx(
                  'p-2 rounded-full transition-all',
                  isSaved ? 'bg-apricot/20 text-apricot' : 'bg-sandstone hover:bg-apricot/20 text-midnight/40 hover:text-apricot'
                )}
              >
                <Heart className={clsx('w-5 h-5', isSaved && 'fill-current')} />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-midnight/60">
              <span>{listing.rooms} {listing.rooms === 1 ? 'room' : 'rooms'}</span>
              <span>•</span>
              <span>{listing.size}m²</span>
              <span>•</span>
              <span>{listing.furnished ? 'Furnished' : 'Unfurnished'}</span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {listing.amenities.slice(0, 4).map((amenity) => {
                const Icon = amenityIcons[amenity] || Home;
                return (
                  <div
                    key={amenity}
                    className="w-8 h-8 rounded-lg bg-sandstone/50 flex items-center justify-center"
                    title={amenity}
                  >
                    <Icon className="w-4 h-4 text-midnight/50" />
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              <p className="text-xl font-bold text-midnight">
                ₪{listing.price.toLocaleString()}
                <span className="text-sm font-normal text-midnight/50">/mo</span>
              </p>
              <span className="text-sm text-midnight/50">
                Available {new Date(listing.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-white rounded-2xl shadow-float overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <Link href={`/listing/${listing.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Match Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-mint flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {listing.match}% match
          </div>

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleSave();
            }}
            className={clsx(
              'absolute top-3 right-3 p-2 rounded-full transition-all',
              isSaved 
                ? 'bg-white text-apricot' 
                : 'bg-white/80 backdrop-blur-sm text-midnight/40 hover:text-apricot'
            )}
          >
            <Heart className={clsx('w-5 h-5', isSaved && 'fill-current')} />
          </button>

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
            <span className="text-xs text-midnight/50">
              {new Date(listing.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
