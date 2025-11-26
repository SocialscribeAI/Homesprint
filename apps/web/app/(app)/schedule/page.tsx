'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Video,
  Building,
  MessageSquare,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Plus,
} from 'lucide-react';
import clsx from 'clsx';

// Mock data
const mockViewings = [
  {
    id: '1',
    listing: {
      id: 'listing1',
      title: 'Sunny room in Nachlaot',
      address: 'Ben Yehuda Street 42',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&h=200&fit=crop',
    },
    owner: {
      name: 'Sarah Cohen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: '14:00',
    duration: 30,
    status: 'confirmed',
    type: 'physical',
  },
  {
    id: '2',
    listing: {
      id: 'listing2',
      title: 'Modern studio in Baka',
      address: 'Derech Beit Lechem 15',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=200&fit=crop',
    },
    owner: {
      name: 'David Levy',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '10:00',
    duration: 30,
    status: 'pending',
    type: 'virtual',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: '3',
    listing: {
      id: 'listing3',
      title: 'Cozy apartment in Katamon',
      address: 'Haportzim Street 8',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop',
    },
    owner: {
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    time: '16:00',
    duration: 45,
    status: 'completed',
    type: 'physical',
  },
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: (Date | null)[] = [];

    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  const getViewingsForDate = (date: Date) => {
    return mockViewings.filter((v) => {
      const viewingDate = new Date(v.date);
      return (
        viewingDate.getDate() === date.getDate() &&
        viewingDate.getMonth() === date.getMonth() &&
        viewingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const upcomingViewings = mockViewings
    .filter((v) => new Date(v.date) >= today && v.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastViewings = mockViewings
    .filter((v) => new Date(v.date) < today || v.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === new Date(today.getTime() + 86400000).toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-bold text-midnight">
            Your Viewings
          </h1>
          <p className="text-midnight/60 mt-1">
            {upcomingViewings.length} upcoming viewing{upcomingViewings.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-sandstone/50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'calendar'
                  ? 'bg-white text-midnight shadow-sm'
                  : 'text-midnight/60 hover:text-midnight'
              )}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'list'
                  ? 'bg-white text-midnight shadow-sm'
                  : 'text-midnight/60 hover:text-midnight'
              )}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar / List View */}
        <div className="lg:col-span-2">
          {viewMode === 'calendar' ? (
            <div className="bg-white rounded-3xl shadow-float p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-midnight">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-sandstone transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-midnight" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 text-sm font-medium text-mint hover:bg-mint/10 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-sandstone transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-midnight" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-midnight/50 py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const viewings = getViewingsForDate(date);
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const isPast = date < today;

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={clsx(
                        'aspect-square p-1 rounded-xl transition-all relative',
                        isSelected && 'bg-mint text-white',
                        isToday && !isSelected && 'bg-mint/10',
                        !isSelected && !isToday && 'hover:bg-sandstone',
                        isPast && 'opacity-50'
                      )}
                    >
                      <span
                        className={clsx(
                          'text-sm font-medium',
                          isSelected ? 'text-white' : 'text-midnight'
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {viewings.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {viewings.slice(0, 3).map((v, i) => (
                            <span
                              key={i}
                              className={clsx(
                                'w-1.5 h-1.5 rounded-full',
                                isSelected ? 'bg-white' : 'bg-mint'
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Date Viewings */}
              {selectedDate && (
                <div className="mt-6 pt-6 border-t border-sandstone">
                  <h3 className="font-medium text-midnight mb-4">
                    {formatDate(selectedDate)}
                  </h3>
                  {getViewingsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getViewingsForDate(selectedDate).map((viewing) => (
                        <ViewingCard key={viewing.id} viewing={viewing} compact />
                      ))}
                    </div>
                  ) : (
                    <p className="text-midnight/50 text-sm">No viewings scheduled</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming */}
              <div>
                <h2 className="text-lg font-bold text-midnight mb-4">Upcoming</h2>
                {upcomingViewings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingViewings.map((viewing) => (
                      <ViewingCard key={viewing.id} viewing={viewing} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-float text-center">
                    <div className="w-16 h-16 rounded-full bg-sandstone mx-auto flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-midnight/30" />
                    </div>
                    <p className="text-midnight/60">No upcoming viewings</p>
                    <Link
                      href="/listings"
                      className="inline-flex items-center gap-2 mt-4 text-mint font-medium hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Browse listings
                    </Link>
                  </div>
                )}
              </div>

              {/* Past */}
              {pastViewings.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-midnight mb-4">Past</h2>
                  <div className="space-y-4 opacity-60">
                    {pastViewings.map((viewing) => (
                      <ViewingCard key={viewing.id} viewing={viewing} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Quick Stats & Tips */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-float">
            <h3 className="font-bold text-midnight mb-4">Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-mint" />
                  </div>
                  <span className="text-midnight/70">Confirmed</span>
                </div>
                <span className="font-bold text-midnight">
                  {mockViewings.filter((v) => v.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-apricot/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-apricot" />
                  </div>
                  <span className="text-midnight/70">Pending</span>
                </div>
                <span className="font-bold text-midnight">
                  {mockViewings.filter((v) => v.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sandstone flex items-center justify-center">
                    <Check className="w-5 h-5 text-midnight/40" />
                  </div>
                  <span className="text-midnight/70">Completed</span>
                </div>
                <span className="font-bold text-midnight">
                  {mockViewings.filter((v) => v.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-mint/10 to-apricot/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-mint" />
              </div>
              <h3 className="font-bold text-midnight">Viewing Tips</h3>
            </div>
            <ul className="space-y-3 text-sm text-midnight/70">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                <span>Arrive 5 minutes early to make a good impression</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                <span>Prepare questions about bills, neighbors, and rules</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                <span>Take photos and notes during the viewing</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                <span>Check water pressure, outlets, and storage space</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewingCard({
  viewing,
  compact = false,
}: {
  viewing: typeof mockViewings[0];
  compact?: boolean;
}) {
  const statusColors = {
    confirmed: 'bg-mint/10 text-mint',
    pending: 'bg-apricot/10 text-apricot',
    completed: 'bg-sandstone text-midnight/50',
    cancelled: 'bg-red-50 text-red-500',
  };

  const statusLabels = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  if (compact) {
    return (
      <Link
        href={`/listing/${viewing.listing.id}`}
        className="flex items-center gap-3 p-3 bg-sandstone/30 rounded-xl hover:bg-sandstone/50 transition-colors"
      >
        <img
          src={viewing.listing.image}
          alt=""
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-midnight text-sm truncate">
            {viewing.listing.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-midnight/50">
            <Clock className="w-3 h-3" />
            {viewing.time}
            <span
              className={clsx(
                'px-1.5 py-0.5 rounded-full text-xs font-medium',
                statusColors[viewing.status as keyof typeof statusColors]
              )}
            >
              {statusLabels[viewing.status as keyof typeof statusLabels]}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-float overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <img
            src={viewing.listing.image}
            alt=""
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/listing/${viewing.listing.id}`}
                  className="font-bold text-midnight hover:text-mint transition-colors"
                >
                  {viewing.listing.title}
                </Link>
                <div className="flex items-center gap-1 text-sm text-midnight/60 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {viewing.listing.address}
                </div>
              </div>
              <span
                className={clsx(
                  'px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0',
                  statusColors[viewing.status as keyof typeof statusColors]
                )}
              >
                {statusLabels[viewing.status as keyof typeof statusLabels]}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-midnight/70">
                <Calendar className="w-4 h-4 text-midnight/40" />
                {viewing.date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-midnight/70">
                <Clock className="w-4 h-4 text-midnight/40" />
                {viewing.time} ({viewing.duration} min)
              </div>
              <div className="flex items-center gap-2 text-sm text-midnight/70">
                {viewing.type === 'virtual' ? (
                  <>
                    <Video className="w-4 h-4 text-midnight/40" />
                    Virtual
                  </>
                ) : (
                  <>
                    <Building className="w-4 h-4 text-midnight/40" />
                    In-person
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Owner */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-sandstone">
          <div className="flex items-center gap-3">
            <img
              src={viewing.owner.avatar}
              alt={viewing.owner.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm text-midnight/70">
              with <span className="font-medium text-midnight">{viewing.owner.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/messages?thread=${viewing.id}`}
              className="p-2 rounded-lg hover:bg-sandstone transition-colors text-midnight/60 hover:text-midnight"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>
            <button className="p-2 rounded-lg hover:bg-sandstone transition-colors text-midnight/60 hover:text-midnight">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Virtual Meeting Link */}
        {viewing.type === 'virtual' && viewing.meetingUrl && viewing.status === 'confirmed' && (
          <a
            href={viewing.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-4 py-3 bg-mint text-white font-medium rounded-xl hover:bg-mint/90 transition-colors"
          >
            <Video className="w-4 h-4" />
            Join Video Call
          </a>
        )}
      </div>
    </div>
  );
}
