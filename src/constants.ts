import { AppEntry } from './types';

export const INITIAL_APPS: AppEntry[] = [
  {
    id: '1',
    name: 'Genshin Impact',
    subtitle: 'Adventure RPG',
    category: 'Game',
    iconUrl: 'https://picsum.photos/seed/genshin/200/200',
    rating: 4.8,
    reviewsCount: '2.5M',
    description: 'Step into Teyvat, a vast world teeming with life and flowing with elemental energy.',
    developer: 'COGNOSPHERE PTE. LTD.',
    screenshots: [
      'https://picsum.photos/seed/gi1/600/400',
      'https://picsum.photos/seed/gi2/600/400',
    ],
    size: '3.5 GB',
    ageRating: '12+',
    downloadUrl: 'https://example.com/genshin',
    hasInAppPurchases: true,
    redirectTime: 2,
    version: '4.1.0',
    versionDate: '2w ago',
    whatsNew: 'Step into Teyvat with optimized performance and new seasonal events.',
    versionHistory: [
      { version: '4.1.0', date: '2w ago', notes: 'Optimized performance and new seasonal events.' },
      { version: '4.0.0', date: '1m ago', notes: 'New region Fontaine unlocked!' }
    ],
    events: [
      {
        id: 'e1',
        title: 'New Season: Flowing Elemental',
        subtitle: 'Special Summer Gathering',
        badge: 'MAJOR EVENT',
        imageUrl: 'https://picsum.photos/seed/ev1/800/400'
      }
    ],
    compatibility: 'Works on this iPhone',
    price: 'Free',
    country: 'Global',
    downloads: '1.2M'
  },
  {
    id: '2',
    name: 'Instagram',
    subtitle: 'Photo & Video',
    category: 'App',
    iconUrl: 'https://picsum.photos/seed/insta/200/200',
    rating: 4.7,
    reviewsCount: '15M',
    description: 'Bringing you closer to the people and things you love.',
    developer: 'Instagram, Inc.',
    screenshots: [
      'https://picsum.photos/seed/in1/600/400',
      'https://picsum.photos/seed/in2/600/400',
    ],
    size: '250 MB',
    ageRating: '12+',
    downloadUrl: 'https://example.com/instagram',
    hasInAppPurchases: false,
    redirectTime: 2,
    version: '281.0.0',
    versionDate: '4d ago',
    whatsNew: 'Bug fixes and performance improvements to help you connect with friends even faster.',
    versionHistory: [
      { version: '281.0.0', date: '4d ago', notes: 'Bug fixes and performance improvements.' },
      { version: '280.0.0', date: '1w ago', notes: 'New creative tools for Stories.' }
    ],
    price: 'Free',
    country: 'Global',
    downloads: '500M'
  },
  {
    id: '3',
    name: 'Candy Crush Saga',
    subtitle: 'Sweet Puzzle Game',
    category: 'Game',
    iconUrl: 'https://picsum.photos/seed/candy/200/200',
    rating: 4.6,
    reviewsCount: '34M',
    description: 'Join Tiffi and Mr. Toffee on their sweet adventure through the Candy Kingdom.',
    developer: 'King',
    screenshots: [
      'https://picsum.photos/seed/cc1/600/400',
      'https://picsum.photos/seed/cc2/600/400',
    ],
    size: '412 MB',
    ageRating: '4+',
    downloadUrl: 'https://example.com/candycrush',
    hasInAppPurchases: true,
    redirectTime: 2,
    version: '1.250.1',
    versionDate: '1w ago',
    whatsNew: 'New levels added! Sweeten your day with over 100 new challenges in the Candy Kingdom.',
    versionHistory: [
      { version: '1.250.1', date: '1w ago', notes: '100 new levels added!' },
      { version: '1.249.0', date: '2w ago', notes: 'Performance improvements.' }
    ],
    price: 'Free',
    country: 'Global',
    downloads: '1B'
  }
];
