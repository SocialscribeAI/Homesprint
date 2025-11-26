// Simple mock database for MVP development
// Replace with Supabase/Prisma when ready

export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  role: 'SEEKER' | 'LISTER' | 'ADMIN';
  lang: string;
  verifiedFlags: any;
  profileCompleteness?: number;
}

export interface Profile {
  userId: string;
  budgetMin: number;
  budgetMax: number;
  moveInEarliest: Date;
  moveInLatest: Date;
  areas: string[];
  occupancyType: string;
  lifestyle: any;
  bio?: string;
}

export interface Listing {
  id: string;
  ownerUserId: string;
  type: 'room' | 'apartment';
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  rent: number;
  billsAvg?: number;
  deposit?: number;
  sizeM2?: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  elevator?: boolean;
  furnished?: boolean;
  amenities: string[];
  accessibility: string[];
  roommates?: any;
  policies?: any;
  availableFrom: Date;
  leaseTermMonths?: number;
  photos: string[];
  videoUrl?: string;
  description: string;
  completeness: number;
  status: string;
  createdAt: Date;
}

// In-memory storage (persists during dev server session)
class MockDB {
  private users: User[] = [
    {
      id: 'user-admin',
      phone: '+972501234567',
      email: 'admin@homesprint.com',
      name: 'Admin User',
      role: 'ADMIN',
      lang: 'en',
      verifiedFlags: { phone_verified: true, email_verified: true }
    },
    {
      id: 'user-lister-1',
      phone: '+972502468135',
      email: 'sarah@homesprint.com',
      name: 'Sarah Cohen',
      role: 'LISTER',
      lang: 'en',
      verifiedFlags: { phone_verified: true, email_verified: true, lister_verified: true }
    },
    {
      id: 'user-seeker-1',
      phone: '+972506843297',
      email: 'maya@homesprint.com',
      name: 'Maya Student',
      role: 'SEEKER',
      lang: 'en',
      verifiedFlags: { phone_verified: true }
    }
  ];

  private profiles: Profile[] = [
    {
      userId: 'user-seeker-1',
      budgetMin: 3000,
      budgetMax: 4500,
      moveInEarliest: new Date('2024-12-01'),
      moveInLatest: new Date('2025-02-01'),
      areas: ['Rehavia', 'Nachlaot', 'German Colony'],
      occupancyType: 'room',
      lifestyle: {
        smoking: 'no',
        pets: 'cats',
        guests: 'occasionally',
        cleaning: 'somewhat_important',
        noise: 'moderate',
        religion: 'secular'
      },
      bio: 'Hebrew University student looking for a quiet room near campus. Love cats and enjoy cooking.'
    }
  ];

  private listings: Listing[] = [
    {
      id: 'listing-1',
      ownerUserId: 'user-lister-1',
      type: 'room',
      address: 'Rehavia 45, Jerusalem',
      neighborhood: 'Rehavia',
      lat: 31.7714,
      lng: 35.2094,
      rent: 3500,
      billsAvg: 300,
      sizeM2: 25,
      rooms: 1,
      bathrooms: 1,
      furnished: true,
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Parking'],
      accessibility: ['Elevator', 'Wheelchair accessible'],
      policies: {
        smoking: 'no',
        pets: 'cats_allowed',
        guests: 'occasionally',
        cleaning: 'shared_responsibility'
      },
      availableFrom: new Date('2024-12-01'),
      leaseTermMonths: 12,
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
      ],
      description: 'Beautiful furnished room in the heart of Rehavia. Walking distance to Hebrew University and downtown. Shared apartment with 2 other students. Modern kitchen, laundry facilities, and secure building.',
      completeness: 95,
      status: 'active',
      createdAt: new Date('2024-11-01')
    }
  ];

  // User methods
  findUserByPhone(phone: string): User | undefined {
    return this.users.find(user => user.phone === phone);
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      phone: userData.phone!,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'SEEKER',
      lang: userData.lang || 'en',
      verifiedFlags: userData.verifiedFlags || { phone_verified: true }
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;

    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  // Profile methods
  findProfileByUserId(userId: string): Profile | undefined {
    return this.profiles.find(profile => profile.userId === userId);
  }

  upsertProfile(profileData: Profile): Profile {
    const existingIndex = this.profiles.findIndex(p => p.userId === profileData.userId);
    if (existingIndex >= 0) {
      this.profiles[existingIndex] = profileData;
      return profileData;
    } else {
      this.profiles.push(profileData);
      return profileData;
    }
  }

  // Listing methods
  findListings(filters: any = {}): Listing[] {
    let results = [...this.listings];

    // Status filter
    results = results.filter(listing => listing.status === 'active');

    // Type filter
    if (filters.type) {
      results = results.filter(listing => listing.type === filters.type);
    }

    // Price filters
    if (filters.minRent) {
      results = results.filter(listing => listing.rent >= filters.minRent);
    }
    if (filters.maxRent) {
      results = results.filter(listing => listing.rent <= filters.maxRent);
    }

    // Neighborhood filter
    if (filters.neighborhood) {
      results = results.filter(listing =>
        listing.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())
      );
    }

    // Furnished filter
    if (filters.furnished !== undefined) {
      results = results.filter(listing => listing.furnished === filters.furnished);
    }

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(listing =>
        listing.description.toLowerCase().includes(query) ||
        listing.address.toLowerCase().includes(query) ||
        listing.neighborhood.toLowerCase().includes(query)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.rent - b.rent);
        break;
      case 'price_desc':
        results.sort((a, b) => b.rent - a.rent);
        break;
      case 'date_desc':
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      default: // relevance
        results.sort((a, b) => b.completeness - a.completeness);
    }

    return results;
  }

  createListing(listingData: Partial<Listing>): Listing {
    const newListing: Listing = {
      id: `listing-${Date.now()}`,
      ownerUserId: listingData.ownerUserId!,
      type: listingData.type!,
      address: listingData.address!,
      neighborhood: listingData.neighborhood!,
      lat: listingData.lat || 31.7684,
      lng: listingData.lng || 35.2194,
      rent: listingData.rent!,
      billsAvg: listingData.billsAvg,
      deposit: listingData.deposit,
      sizeM2: listingData.sizeM2,
      rooms: listingData.rooms,
      bathrooms: listingData.bathrooms,
      floor: listingData.floor,
      elevator: listingData.elevator,
      furnished: listingData.furnished,
      amenities: listingData.amenities || [],
      accessibility: listingData.accessibility || [],
      roommates: listingData.roommates,
      policies: listingData.policies,
      availableFrom: listingData.availableFrom || new Date(),
      leaseTermMonths: listingData.leaseTermMonths,
      photos: listingData.photos || [],
      videoUrl: listingData.videoUrl,
      description: listingData.description!,
      completeness: listingData.completeness || 0,
      status: listingData.status || 'draft',
      createdAt: new Date()
    };

    this.listings.push(newListing);
    return newListing;
  }

  getListingsCount(filters: any = {}): number {
    return this.findListings(filters).length;
  }
}

// Export singleton instance
export const mockDB = new MockDB();

