// Mock data for MVP development
// Replace with actual database calls when ready

export interface MockUser {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  role: 'SEEKER' | 'LISTER' | 'ADMIN';
  lang: string;
  verifiedFlags: any;
  profileCompleteness?: number;
}

export interface MockProfile {
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

export interface MockListing {
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
  owner?: {
    id: string;
    name?: string;
    verifiedFlags: any;
  };
}

// Mock Users
export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    phone: '+972501234567',
    email: 'admin@homesprint.com',
    name: 'Admin User',
    role: 'ADMIN',
    lang: 'en',
    verifiedFlags: { phone_verified: true, email_verified: true }
  },
  {
    id: 'user-2',
    phone: '+972502468135',
    email: 'sarah@homesprint.com',
    name: 'Sarah Cohen',
    role: 'LISTER',
    lang: 'en',
    verifiedFlags: { phone_verified: true, email_verified: true, lister_verified: true }
  },
  {
    id: 'user-3',
    phone: '+972503579246',
    email: 'david@homesprint.com',
    name: 'David Levy',
    role: 'LISTER',
    lang: 'en',
    verifiedFlags: { phone_verified: true, email_verified: true, lister_verified: true }
  },
  {
    id: 'user-4',
    phone: '+972506843297',
    email: 'maya@homesprint.com',
    name: 'Maya Student',
    role: 'SEEKER',
    lang: 'en',
    verifiedFlags: { phone_verified: true }
  },
  {
    id: 'user-5',
    phone: '+972507951468',
    email: 'yossi@homesprint.com',
    name: 'Yossi Professional',
    role: 'SEEKER',
    lang: 'en',
    verifiedFlags: { phone_verified: true }
  }
];

// Mock Profiles
export const mockProfiles: MockProfile[] = [
  {
    userId: 'user-4',
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
  },
  {
    userId: 'user-5',
    budgetMin: 5000,
    budgetMax: 7000,
    moveInEarliest: new Date('2024-11-15'),
    moveInLatest: new Date('2025-01-15'),
    areas: ['Talpiot', 'Bakaa', 'Malha'],
    occupancyType: 'apartment',
    lifestyle: {
      smoking: 'no',
      pets: 'no',
      guests: 'frequently',
      cleaning: 'flexible',
      noise: 'moderate',
      religion: 'traditional'
    },
    bio: 'Young professional looking for a spacious apartment. Work in tech and enjoy hosting friends.'
  }
];

// Mock Listings
export const mockListings: MockListing[] = [
  {
    id: 'listing-1',
    ownerUserId: 'user-2',
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
    createdAt: new Date('2024-11-01'),
    owner: {
      id: 'user-2',
      name: 'Sarah Cohen',
      verifiedFlags: { phone_verified: true, email_verified: true, lister_verified: true }
    }
  },
  {
    id: 'listing-2',
    ownerUserId: 'user-3',
    type: 'apartment',
    address: 'Beit Hakerem 12, Jerusalem',
    neighborhood: 'Beit Hakerem',
    lat: 31.7678,
    lng: 35.1854,
    rent: 6000,
    billsAvg: 400,
    deposit: 6000,
    sizeM2: 85,
    rooms: 3,
    bathrooms: 2,
    floor: 3,
    elevator: true,
    furnished: false,
    amenities: ['WiFi', 'Kitchen', 'Laundry', 'Balcony', 'Parking', 'Storage'],
    accessibility: ['Elevator'],
    policies: {
      smoking: 'no',
      pets: 'no',
      guests: 'frequently_allowed',
      cleaning: 'tenant_responsible'
    },
    availableFrom: new Date('2024-11-20'),
    leaseTermMonths: 24,
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    description: 'Spacious 3-bedroom apartment in quiet Beit Hakerem neighborhood. Perfect for young professionals or small families. Close to shopping centers and public transport. Renovated kitchen and bathrooms.',
    completeness: 92,
    status: 'active',
    createdAt: new Date('2024-11-05'),
    owner: {
      id: 'user-3',
      name: 'David Levy',
      verifiedFlags: { phone_verified: true, email_verified: true, lister_verified: true }
    }
  },
  {
    id: 'listing-3',
    ownerUserId: 'user-2',
    type: 'room',
    address: 'Nachlaot 8, Jerusalem',
    neighborhood: 'Nachlaot',
    lat: 31.7684,
    lng: 35.2194,
    rent: 2800,
    billsAvg: 250,
    sizeM2: 18,
    rooms: 1,
    bathrooms: 1,
    furnished: true,
    amenities: ['WiFi', 'Shared Kitchen'],
    accessibility: ['Stairs only'],
    policies: {
      smoking: 'no',
      pets: 'no',
      guests: 'rarely',
      cleaning: 'shared_responsibility'
    },
    availableFrom: new Date('2025-01-01'),
    leaseTermMonths: 6,
    photos: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
    ],
    description: 'Cozy room in artistic Nachlaot neighborhood. Perfect for students. Walking distance to Machane Yehuda market and downtown. Shared apartment with creative professionals.',
    completeness: 78,
    status: 'active',
    createdAt: new Date('2024-11-10'),
    owner: {
      id: 'user-2',
      name: 'Sarah Cohen',
      verifiedFlags: { phone_verified: true, email_verified: true, lister_verified: true }
    }
  }
];

// Mock Applications
export const mockApplications = [
  {
    id: 'app-1',
    listingId: 'listing-1',
    seekerUserId: 'user-4',
    status: 'pending',
    score: { compatibility: 85, budget: 90, timeline: 80 },
    message: 'Hi Sarah! I love the location and the fact that cats are allowed. I\'m a Hebrew University student and would love to meet the current roommates.',
    createdAt: new Date('2024-11-15')
  }
];

// Mock database functions
export class MockDatabase {
  static users = mockUsers;
  static profiles = mockProfiles;
  static listings = mockListings;
  static applications = mockApplications;

  // User operations
  static findUserByPhone(phone: string): MockUser | undefined {
    return this.users.find(user => user.phone === phone);
  }

  static findUserById(id: string): MockUser | undefined {
    return this.users.find(user => user.id === id);
  }

  static createUser(userData: Partial<MockUser>): MockUser {
    const newUser: MockUser = {
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

  static updateUser(id: string, updates: Partial<MockUser>): MockUser | null {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;

    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  // Profile operations
  static findProfileByUserId(userId: string): MockProfile | undefined {
    return this.profiles.find(profile => profile.userId === userId);
  }

  static upsertProfile(profileData: MockProfile): MockProfile {
    const existingIndex = this.profiles.findIndex(p => p.userId === profileData.userId);
    if (existingIndex >= 0) {
      this.profiles[existingIndex] = profileData;
      return profileData;
    } else {
      this.profiles.push(profileData);
      return profileData;
    }
  }

  // Listing operations
  static findListings(filters: any = {}): MockListing[] {
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

  static createListing(listingData: Partial<MockListing>): MockListing {
    const newListing: MockListing = {
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

  static getListingsCount(filters: any = {}): number {
    return this.findListings(filters).length;
  }
}

