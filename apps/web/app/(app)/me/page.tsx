'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Heart,
  MessageSquare,
  Calendar,
  Building2,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isLister = user?.role === 'LISTER' || user?.role === 'ADMIN';

  // Mock data - in production, fetch from API
  const stats = {
    savedListings: 12,
    activeApplications: 3,
    scheduledViewings: 2,
    unreadMessages: 5,
    // Lister stats
    activeListings: 4,
    totalViews: 234,
    pendingApplications: 8,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'message',
      title: 'New message from David',
      subtitle: 'About: Cozy room in Rehavia',
      time: '5 min ago',
      icon: MessageSquare,
    },
    {
      id: 2,
      type: 'viewing',
      title: 'Viewing confirmed',
      subtitle: 'Tomorrow at 2:00 PM',
      time: '1 hour ago',
      icon: Calendar,
    },
    {
      id: 3,
      type: 'application',
      title: 'Application viewed',
      subtitle: 'Modern apartment in German Colony',
      time: '3 hours ago',
      icon: FileText,
    },
  ];

  const recommendedListings = [
    {
      id: '1',
      title: 'Sunny room in Nachlaot',
      price: 2800,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
      neighborhood: 'Nachlaot',
      match: 95,
    },
    {
      id: '2',
      title: 'Modern studio in Baka',
      price: 4200,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
      neighborhood: 'Baka',
      match: 88,
    },
    {
      id: '3',
      title: 'Cozy apartment in Katamon',
      price: 5500,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      neighborhood: 'Katamon',
      match: 82,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-bold text-midnight">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-midnight/60 mt-1">
            {isLister 
              ? "Here's how your listings are performing today."
              : "Here's what's happening with your home search."}
          </p>
        </div>
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 px-5 py-3 bg-midnight text-white rounded-full font-bold hover:bg-midnight/90 transition-all hover:scale-105 hover:shadow-glow"
        >
          <Search className="w-4 h-4" />
          Find Homes
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLister ? (
          <>
            <StatCard
              icon={Building2}
              label="Active Listings"
              value={stats.activeListings}
              color="mint"
              href="/me/listings"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Views"
              value={stats.totalViews}
              color="apricot"
            />
            <StatCard
              icon={FileText}
              label="Applications"
              value={stats.pendingApplications}
              color="mint"
              href="/me/applications"
            />
            <StatCard
              icon={MessageSquare}
              label="Messages"
              value={stats.unreadMessages}
              color="apricot"
              href="/messages"
              badge
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Heart}
              label="Saved"
              value={stats.savedListings}
              color="apricot"
              href="/me/saved"
            />
            <StatCard
              icon={FileText}
              label="Applications"
              value={stats.activeApplications}
              color="mint"
              href="/me/applications"
            />
            <StatCard
              icon={Calendar}
              label="Viewings"
              value={stats.scheduledViewings}
              color="mint"
              href="/schedule"
            />
            <StatCard
              icon={MessageSquare}
              label="Messages"
              value={stats.unreadMessages}
              color="apricot"
              href="/messages"
              badge
            />
          </>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 shadow-float">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-bold text-midnight">Recent Activity</h2>
              <Link
                href="/messages"
                className="text-sm text-mint font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-2xl hover:bg-sandstone/50 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activity.type === 'message' ? 'bg-mint/10 text-mint' :
                    activity.type === 'viewing' ? 'bg-apricot/20 text-apricot' :
                    'bg-midnight/5 text-midnight'
                  }`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-midnight">{activity.title}</p>
                    <p className="text-sm text-midnight/60 truncate">{activity.subtitle}</p>
                  </div>
                  <span className="text-xs text-midnight/40 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>

            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-sandstone mx-auto flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-midnight/30" />
                </div>
                <p className="text-midnight/60">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Completion / Quick Actions */}
        <motion.div variants={item} className="space-y-6">
          {/* Profile Completion */}
          <div className="bg-gradient-to-br from-mint/10 to-apricot/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-mint" />
              </div>
              <div>
                <h3 className="font-bold text-midnight">Complete Profile</h3>
                <p className="text-sm text-midnight/60">Better matches await!</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-midnight/60">Progress</span>
                <span className="font-bold text-midnight">65%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-gradient-to-r from-mint to-apricot rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <ProfileTask completed label="Phone verified" />
              <ProfileTask completed label="Email added" />
              <ProfileTask label="Add profile photo" />
              <ProfileTask label="Set preferences" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-float">
            <h3 className="font-bold text-midnight mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionButton
                href="/listings"
                icon={Search}
                label="Search listings"
              />
              <QuickActionButton
                href="/schedule"
                icon={Calendar}
                label="Schedule viewing"
              />
              {isLister && (
                <QuickActionButton
                  href="/me/listings/new"
                  icon={Building2}
                  label="Create listing"
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommended Listings (for seekers) */}
      {!isLister && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-sans font-bold text-midnight">Recommended for You</h2>
              <p className="text-sm text-midnight/60">Based on your preferences</p>
            </div>
            <Link
              href="/listings"
              className="text-sm text-mint font-medium hover:underline flex items-center gap-1"
            >
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {recommendedListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-float hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-mint flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {listing.match}% match
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
                  <p className="text-lg font-bold text-midnight mt-2">
                    ₪{listing.price.toLocaleString()}
                    <span className="text-sm font-normal text-midnight/50">/mo</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
  badge,
}: {
  icon: any;
  label: string;
  value: number;
  color: 'mint' | 'apricot';
  href?: string;
  badge?: boolean;
}) {
  const content = (
    <div className={`bg-white rounded-2xl p-5 shadow-float hover:shadow-xl transition-all ${href ? 'cursor-pointer hover:-translate-y-1' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          color === 'mint' ? 'bg-mint/10 text-mint' : 'bg-apricot/20 text-apricot'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && value > 0 && (
          <span className="w-2.5 h-2.5 bg-mint rounded-full animate-pulse" />
        )}
      </div>
      <p className="text-2xl font-bold text-midnight">{value}</p>
      <p className="text-sm text-midnight/60">{label}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function ProfileTask({ completed, label }: { completed?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2 className={`w-4 h-4 ${completed ? 'text-mint' : 'text-midnight/20'}`} />
      <span className={completed ? 'text-midnight/60 line-through' : 'text-midnight'}>
        {label}
      </span>
    </div>
  );
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-sandstone transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-sandstone group-hover:bg-mint/10 flex items-center justify-center transition-colors">
        <Icon className="w-4 h-4 text-midnight/60 group-hover:text-mint transition-colors" />
      </div>
      <span className="font-medium text-midnight/80 group-hover:text-midnight transition-colors">
        {label}
      </span>
      <ArrowRight className="w-4 h-4 text-midnight/30 group-hover:text-mint ml-auto transition-colors" />
    </Link>
  );
}
