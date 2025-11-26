'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Home,
  Maximize2,
  Bed,
  Bath,
  Building,
  Wifi,
  Car,
  Dumbbell,
  Wind,
  Sparkles,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Shield,
  Clock,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import clsx from 'clsx';

// Mock data - replace with API call
const mockListing = {
  id: '1',
  title: 'Sunny room in Nachlaot',
  type: 'room',
  price: 2800,
  billsAvg: 200,
  deposit: 2800,
  neighborhood: 'Nachlaot',
  address: 'Ben Yehuda Street 42',
  lat: 31.7767,
  lng: 35.2234,
  rooms: 1,
  bathrooms: 1,
  size: 18,
  floor: 2,
  elevator: false,
  furnished: true,
  availableFrom: '2024-02-01',
  leaseTermMonths: 12,
  description: `Beautiful sunny room in the heart of Nachlaot, one of Jerusalem's most charming and vibrant neighborhoods. 

The room is fully furnished with a comfortable double bed, desk, wardrobe, and bookshelf. Large windows provide excellent natural light throughout the day.

You'll be sharing the apartment with 2 friendly roommates (both students). The common areas include a spacious living room, fully equipped kitchen, and a cozy balcony perfect for morning coffee.

The location is unbeatable - walking distance to the Mahane Yehuda market, cafes, restaurants, and public transportation. The neighborhood has a unique artistic vibe with beautiful old Jerusalem stone buildings.`,
  photos: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
  ],
  amenities: ['wifi', 'ac', 'laundry', 'balcony', 'heating'],
  accessibility: ['ground_floor_access'],
  roommates: {
    current: 2,
    total: 3,
    genders: ['female', 'female'],
    ages: [24, 26],
    occupations: ['student', 'student'],
  },
  policies: {
    smoking: 'no',
    pets: 'no',
    guests: 'occasionally',
    couples: false,
  },
  owner: {
    id: 'owner1',
    name: 'Sarah Cohen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    verified: true,
    responseTime: '< 1 hour',
    joinedDate: '2023-06-15',
  },
  match: 95,
  completeness: 92,
};

const amenityLabels: Record<string, { label: string; icon: any }> = {
  wifi: { label: 'WiFi', icon: Wifi },
  ac: { label: 'Air Conditioning', icon: Wind },
  parking: { label: 'Parking', icon: Car },
  gym: { label: 'Gym Access', icon: Dumbbell },
  laundry: { label: 'Laundry', icon: Home },
  balcony: { label: 'Balcony', icon: Home },
  heating: { label: 'Heating', icon: Wind },
  elevator: { label: 'Elevator', icon: Building },
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const listing = mockListing; // In production, fetch by params.id

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.photos.length) % listing.photos.length);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-midnight/60 hover:text-midnight transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </button>

        {/* Photo Gallery */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px]">
            {/* Main Image */}
            <div
              className="col-span-4 md:col-span-2 md:row-span-2 relative cursor-pointer"
              onClick={() => setShowGallery(true)}
            >
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
            </div>

            {/* Secondary Images */}
            {listing.photos.slice(1, 5).map((photo, index) => (
              <div
                key={index}
                className={clsx(
                  'relative cursor-pointer hidden md:block',
                  index === 3 && 'relative'
                )}
                onClick={() => {
                  setCurrentImageIndex(index + 1);
                  setShowGallery(true);
                }}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                {index === 3 && listing.photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      +{listing.photos.length - 5} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Match Badge */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-2 shadow-float">
            <Sparkles className="w-4 h-4 text-mint" />
            <span className="font-bold text-mint">{listing.match}% match</span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={clsx(
                'p-3 rounded-full shadow-float transition-all',
                isSaved ? 'bg-apricot text-white' : 'bg-white text-midnight hover:text-apricot'
              )}
            >
              <Heart className={clsx('w-5 h-5', isSaved && 'fill-current')} />
            </button>
            <button className="p-3 bg-white rounded-full shadow-float text-midnight hover:text-mint transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* View All Photos Button (Mobile) */}
          <button
            onClick={() => setShowGallery(true)}
            className="md:hidden absolute bottom-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full font-medium text-sm shadow-float"
          >
            View all {listing.photos.length} photos
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Location */}
            <div>
              <div className="flex items-center gap-2 text-sm text-mint font-medium mb-2">
                <span className="px-2 py-0.5 bg-mint/10 rounded-full capitalize">{listing.type}</span>
                {listing.furnished && (
                  <span className="px-2 py-0.5 bg-sandstone rounded-full text-midnight/60">Furnished</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-sans font-bold text-midnight">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 text-midnight/60 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{listing.address}, {listing.neighborhood}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat icon={Bed} label="Rooms" value={listing.rooms} />
              <QuickStat icon={Bath} label="Bathrooms" value={listing.bathrooms} />
              <QuickStat icon={Maximize2} label="Size" value={`${listing.size}m²`} />
              <QuickStat icon={Building} label="Floor" value={listing.floor} />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-float">
              <h2 className="text-lg font-bold text-midnight mb-4">About this place</h2>
              <p className="text-midnight/70 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-float">
              <h2 className="text-lg font-bold text-midnight mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.amenities.map((amenity) => {
                  const { label, icon: Icon } = amenityLabels[amenity] || { label: amenity, icon: Home };
                  return (
                    <div key={amenity} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-mint" />
                      </div>
                      <span className="text-midnight/80">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Roommates */}
            {listing.roommates && (
              <div className="bg-white rounded-2xl p-6 shadow-float">
                <h2 className="text-lg font-bold text-midnight mb-4">Current Roommates</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-3">
                    {listing.roommates.genders.map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-mint to-apricot flex items-center justify-center text-white font-bold border-2 border-white"
                      >
                        {listing.roommates!.occupations[i]?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-medium text-midnight">
                      {listing.roommates.current} roommate{listing.roommates.current !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-midnight/60">
                      Ages {listing.roommates.ages.join(' & ')}
                    </p>
                  </div>
                </div>
                <p className="text-midnight/70">
                  {listing.roommates.occupations.map((o, i) => (
                    <span key={i}>
                      {i > 0 && ', '}
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* House Rules */}
            <div className="bg-white rounded-2xl p-6 shadow-float">
              <h2 className="text-lg font-bold text-midnight mb-4">House Rules</h2>
              <div className="grid grid-cols-2 gap-4">
                <PolicyItem
                  label="Smoking"
                  value={listing.policies.smoking}
                  allowed={listing.policies.smoking !== 'no'}
                />
                <PolicyItem
                  label="Pets"
                  value={listing.policies.pets}
                  allowed={listing.policies.pets !== 'no'}
                />
                <PolicyItem
                  label="Guests"
                  value={listing.policies.guests}
                  allowed={true}
                />
                <PolicyItem
                  label="Couples"
                  value={listing.policies.couples ? 'Allowed' : 'Not allowed'}
                  allowed={listing.policies.couples}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-2xl p-6 shadow-float sticky top-4">
              <div className="mb-6">
                <p className="text-3xl font-bold text-midnight">
                  ₪{listing.price.toLocaleString()}
                  <span className="text-lg font-normal text-midnight/50">/month</span>
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-midnight/60">
                  <span>+ ₪{listing.billsAvg}/mo bills</span>
                  <span>•</span>
                  <span>₪{listing.deposit} deposit</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-midnight/40" />
                  <span className="text-midnight/70">
                    Available from{' '}
                    <span className="font-medium text-midnight">
                      {new Date(listing.availableFrom).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-midnight/40" />
                  <span className="text-midnight/70">
                    Minimum{' '}
                    <span className="font-medium text-midnight">
                      {listing.leaseTermMonths} months
                    </span>{' '}
                    lease
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full py-4 bg-mint text-white font-bold rounded-xl hover:bg-mint/90 transition-all hover:shadow-glow"
              >
                Apply Now
              </button>

              <button className="w-full py-4 mt-3 border-2 border-midnight/10 text-midnight font-bold rounded-xl hover:border-mint hover:text-mint transition-all flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message Owner
              </button>
            </div>

            {/* Owner Card */}
            <div className="bg-white rounded-2xl p-6 shadow-float">
              <h3 className="font-bold text-midnight mb-4">Listed by</h3>
              <div className="flex items-center gap-4">
                <img
                  src={listing.owner.avatar}
                  alt={listing.owner.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-midnight">{listing.owner.name}</p>
                    {listing.owner.verified && (
                      <Shield className="w-4 h-4 text-mint" />
                    )}
                  </div>
                  <p className="text-sm text-midnight/60">
                    Responds {listing.owner.responseTime}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-sandstone text-sm text-midnight/60">
                <p>Member since {new Date(listing.owner.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={listing.photos[currentImageIndex]}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />

            <button
              onClick={nextImage}
              className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {listing.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={clsx(
                    'w-2 h-2 rounded-full transition-all',
                    currentImageIndex === index ? 'bg-white w-4' : 'bg-white/50'
                  )}
                />
              ))}
            </div>

            {/* Counter */}
            <div className="absolute top-4 left-4 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
              {currentImageIndex + 1} / {listing.photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-xl"
            >
              <h2 className="text-2xl font-bold text-midnight mb-2">Apply for this place</h2>
              <p className="text-midnight/60 mb-6">
                Send your application to {listing.owner.name}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight mb-2">
                    Introduce yourself
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell the owner a bit about yourself..."
                    className="w-full px-4 py-3 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight mb-2">
                    Preferred move-in date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-mint/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-midnight">Your profile is {listing.match}% compatible!</p>
                    <p className="text-midnight/60 mt-1">
                      Complete your profile to increase your chances of getting accepted.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-3 border-2 border-midnight/10 text-midnight font-bold rounded-xl hover:border-midnight/30 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-mint text-white font-bold rounded-xl hover:bg-mint/90 transition-all">
                  Send Application
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function QuickStat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-float text-center">
      <Icon className="w-5 h-5 text-mint mx-auto mb-2" />
      <p className="text-lg font-bold text-midnight">{value}</p>
      <p className="text-xs text-midnight/50">{label}</p>
    </div>
  );
}

function PolicyItem({ label, value, allowed }: { label: string; value: string; allowed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={clsx(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        allowed ? 'bg-mint/10 text-mint' : 'bg-apricot/10 text-apricot'
      )}>
        {allowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </div>
      <div>
        <p className="text-sm font-medium text-midnight">{label}</p>
        <p className="text-xs text-midnight/50 capitalize">{value}</p>
      </div>
    </div>
  );
}
