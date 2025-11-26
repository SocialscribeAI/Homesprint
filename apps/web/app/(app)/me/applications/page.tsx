'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Eye,
  Check,
  X,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';

// Mock data for seekers (their applications)
const mockSeekerApplications = [
  {
    id: '1',
    listing: {
      id: 'listing1',
      title: 'Sunny room in Nachlaot',
      price: 2800,
      neighborhood: 'Nachlaot',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    },
    owner: {
      name: 'Sarah Cohen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    status: 'pending',
    appliedAt: '2024-01-18',
    message: 'Hi! I am very interested in this room. I am a graduate student...',
    preferredMoveIn: '2024-02-01',
    viewingScheduled: true,
    viewingDate: '2024-01-22',
  },
  {
    id: '2',
    listing: {
      id: 'listing2',
      title: 'Modern studio in Baka',
      price: 4200,
      neighborhood: 'Baka',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    },
    owner: {
      name: 'David Levy',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    status: 'accepted',
    appliedAt: '2024-01-15',
    message: 'Hello! I love this studio and would be a great tenant...',
    preferredMoveIn: '2024-01-20',
    viewingScheduled: true,
    viewingDate: '2024-01-17',
  },
  {
    id: '3',
    listing: {
      id: 'listing3',
      title: 'Cozy apartment in Katamon',
      price: 5500,
      neighborhood: 'Katamon',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    },
    owner: {
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    status: 'rejected',
    appliedAt: '2024-01-10',
    message: 'I am interested in this apartment for my family...',
    preferredMoveIn: '2024-02-15',
    viewingScheduled: false,
  },
];

// Mock data for listers (applications to their listings)
const mockListerApplications = [
  {
    id: '1',
    listing: {
      id: 'listing1',
      title: 'Sunny room in Nachlaot',
      price: 2800,
    },
    applicant: {
      id: 'user1',
      name: 'Michael Brown',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      occupation: 'Software Engineer',
      age: 28,
    },
    status: 'pending',
    appliedAt: '2024-01-20',
    message: 'Hi! I am a software engineer looking for a quiet place to work from home...',
    preferredMoveIn: '2024-02-01',
    matchScore: 92,
  },
  {
    id: '2',
    listing: {
      id: 'listing1',
      title: 'Sunny room in Nachlaot',
      price: 2800,
    },
    applicant: {
      id: 'user2',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      occupation: 'Graduate Student',
      age: 25,
    },
    status: 'pending',
    appliedAt: '2024-01-19',
    message: 'Hello! I am a graduate student at Hebrew University...',
    preferredMoveIn: '2024-02-15',
    matchScore: 88,
  },
  {
    id: '3',
    listing: {
      id: 'listing2',
      title: 'Modern studio in Baka',
      price: 4200,
    },
    applicant: {
      id: 'user3',
      name: 'James Chen',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      occupation: 'Marketing Manager',
      age: 32,
    },
    status: 'accepted',
    appliedAt: '2024-01-15',
    message: 'I love this studio! Perfect location for my work...',
    preferredMoveIn: '2024-01-25',
    matchScore: 85,
  },
];

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-apricot/10 text-apricot',
    icon: Clock,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-mint/10 text-mint',
    icon: Check,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 text-red-500',
    icon: X,
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-sandstone text-midnight/50',
    icon: AlertCircle,
  },
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const isLister = user?.role === 'LISTER' || user?.role === 'ADMIN';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Use appropriate data based on user role
  const applications = isLister ? mockListerApplications : mockSeekerApplications;

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = isLister
      ? (app as any).applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      : app.listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-sans font-bold text-midnight">
          {isLister ? 'Applications Received' : 'My Applications'}
        </h1>
        <p className="text-midnight/60 mt-1">
          {isLister
            ? 'Review and manage applications to your listings'
            : 'Track the status of your rental applications'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-float text-center">
          <p className="text-2xl font-bold text-midnight">{stats.total}</p>
          <p className="text-xs text-midnight/50">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-float text-center">
          <p className="text-2xl font-bold text-apricot">{stats.pending}</p>
          <p className="text-xs text-midnight/50">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-float text-center">
          <p className="text-2xl font-bold text-mint">{stats.accepted}</p>
          <p className="text-xs text-midnight/50">Accepted</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-float text-center">
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          <p className="text-xs text-midnight/50">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-float p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/40" />
            <input
              type="text"
              placeholder={isLister ? 'Search applicants or listings...' : 'Search applications...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-10 bg-sandstone/50 rounded-xl border-0 focus:ring-2 focus:ring-mint text-sm font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-float p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-sandstone mx-auto flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-midnight/30" />
          </div>
          <h3 className="text-lg font-bold text-midnight mb-2">No applications found</h3>
          <p className="text-midnight/60 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : isLister
              ? "You haven't received any applications yet"
              : "You haven't applied to any listings yet"}
          </p>
          {!isLister && (
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 text-mint font-medium hover:underline"
            >
              Browse listings <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const status = statusConfig[application.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            const isExpanded = expandedId === application.id;

            return (
              <motion.div
                key={application.id}
                layout
                className="bg-white rounded-2xl shadow-float overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Image/Avatar */}
                    {isLister ? (
                      <img
                        src={(application as any).applicant.avatar}
                        alt={(application as any).applicant.name}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <Link
                        href={`/listing/${application.listing.id}`}
                        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={(application as any).listing.image}
                          alt={application.listing.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </Link>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {isLister ? (
                            <>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-midnight">
                                  {(application as any).applicant.name}
                                </p>
                                <span
                                  className={clsx(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                    status.color
                                  )}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                              </div>
                              <p className="text-sm text-midnight/60 mt-0.5">
                                {(application as any).applicant.occupation}, {(application as any).applicant.age} years old
                              </p>
                              <p className="text-xs text-midnight/40 mt-1">
                                Applied for: {application.listing.title}
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/listing/${application.listing.id}`}
                                  className="font-bold text-midnight hover:text-mint transition-colors"
                                >
                                  {application.listing.title}
                                </Link>
                                <span
                                  className={clsx(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                    status.color
                                  )}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-midnight/60 mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {(application as any).listing.neighborhood}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Match Score (for listers) */}
                        {isLister && (application as any).matchScore && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-mint">
                              {(application as any).matchScore}%
                            </p>
                            <p className="text-xs text-midnight/40">match</p>
                          </div>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-midnight/60">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(application.appliedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Move-in: {new Date(application.preferredMoveIn).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {!isLister && (application as any).viewingScheduled && (
                          <div className="flex items-center gap-1 text-mint">
                            <Eye className="w-4 h-4" />
                            Viewing {new Date((application as any).viewingDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        )}
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : application.id)}
                        className="mt-3 text-sm text-mint font-medium hover:underline flex items-center gap-1"
                      >
                        {isExpanded ? 'Show less' : 'View details'}
                        <ChevronDown
                          className={clsx(
                            'w-4 h-4 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-sandstone">
                          <p className="text-sm font-medium text-midnight mb-2">Application Message</p>
                          <p className="text-sm text-midnight/70 bg-sandstone/30 rounded-xl p-4">
                            "{application.message}"
                          </p>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3 mt-4">
                            {isLister ? (
                              <>
                                {application.status === 'pending' && (
                                  <>
                                    <button className="flex-1 py-2.5 bg-mint text-white font-medium rounded-xl hover:bg-mint/90 transition-colors flex items-center justify-center gap-2">
                                      <Check className="w-4 h-4" />
                                      Accept
                                    </button>
                                    <button className="flex-1 py-2.5 border-2 border-midnight/10 text-midnight font-medium rounded-xl hover:border-red-200 hover:text-red-500 transition-colors flex items-center justify-center gap-2">
                                      <X className="w-4 h-4" />
                                      Decline
                                    </button>
                                  </>
                                )}
                                <Link
                                  href={`/messages?user=${(application as any).applicant.id}`}
                                  className="flex-1 py-2.5 border-2 border-midnight/10 text-midnight font-medium rounded-xl hover:border-mint hover:text-mint transition-colors flex items-center justify-center gap-2"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Message
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link
                                  href={`/listing/${application.listing.id}`}
                                  className="flex-1 py-2.5 bg-mint text-white font-medium rounded-xl hover:bg-mint/90 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Listing
                                </Link>
                                <Link
                                  href={`/messages?listing=${application.listing.id}`}
                                  className="flex-1 py-2.5 border-2 border-midnight/10 text-midnight font-medium rounded-xl hover:border-mint hover:text-mint transition-colors flex items-center justify-center gap-2"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Message Owner
                                </Link>
                                {application.status === 'pending' && (
                                  <button className="py-2.5 px-4 border-2 border-midnight/10 text-midnight/60 font-medium rounded-xl hover:border-red-200 hover:text-red-500 transition-colors">
                                    Withdraw
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
