import { AppEntry } from './types';

export const INITIAL_APPS: AppEntry[] = [
  {
    id: 'pubg-mobile',
    name: 'PUBG MOBILE',
    subtitle: 'Epic Battle Royale 3.5',
    category: 'Game',
    iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&h=200&q=80',
    rating: 4.6,
    reviewsCount: '42M',
    description: 'The official PUBG MOBILE designed exclusively for mobile. Extreme gunfights, 10-minute matches. Extreme battles, intense firepower, victory at all costs! Parachute into Erangel and battle against 99 other players in survival combat.',
    developer: 'Level Infinite',
    screenshots: [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    size: '1.8 GB',
    ageRating: '17+',
    downloadUrl: 'https://example.com/pubg-mobile',
    hasInAppPurchases: true,
    redirectTime: 2,
    hasUpdate: true,
    updateId: 350,
    version: '3.5.0',
    versionDate: '1d ago',
    whatsNew: 'Version 3.5.0 Update: New Icemire Frontier themed mode! Battle frozen frost monsters, explore the Dragon Realm, and master ice weapons.',
    versionHistory: [
      { version: '3.5.0', date: '1d ago', notes: 'New Icemire Frontier themed mode & Dragon Realm!' },
      { version: '3.4.0', date: '1m ago', notes: 'Bloodmoon Awakening mode & vampire powers.' }
    ],
    price: 'Free',
    country: 'Global',
    downloads: '100M'
  },
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
    hasUpdate: true,
    updateId: 410,
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
    id: 'coc',
    name: 'Clash of Clans',
    subtitle: 'Build, Raid & Clash!',
    category: 'Game',
    iconUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&h=200&q=80',
    rating: 4.7,
    reviewsCount: '58M',
    description: 'Mustache-wearing Barbarians, fire-raising Wizards, and other unique troops are waiting for you! Build your village, raise a clan, and compete in epic Clan Wars!',
    developer: 'Supercell',
    screenshots: [
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=600&h=400&q=80',
      'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&h=400&q=80'
    ],
    size: '380 MB',
    ageRating: '9+',
    downloadUrl: 'https://example.com/clashofclans',
    hasInAppPurchases: true,
    hasUpdate: true,
    updateId: 160,
    version: '16.0.1',
    versionDate: '3d ago',
    whatsNew: 'Town Hall 16 Update! Unleash the Root Rider troop, upgrade hero equipment, and dominate Clan Capital.',
    versionHistory: [
      { version: '16.0.1', date: '3d ago', notes: 'Town Hall 16, Hero Equipment & Root Rider!' },
      { version: '15.9.0', date: '2w ago', notes: 'Balance adjustments & Clan Games rewards.' }
    ],
    price: 'Free',
    country: 'Global',
    downloads: '500M'
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
    hasUpdate: true,
    updateId: 281,
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
