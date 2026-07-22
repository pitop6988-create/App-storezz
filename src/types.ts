export type AppCategory = 'Game' | 'App' | 'Arcade';

export interface VersionEntry {
  version: string;
  date: string;
  notes: string;
}

export interface AppEvent {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
}

export interface AppEntry {
  id: string;
  name: string;
  subtitle: string;
  category: AppCategory;
  iconUrl: string;
  rating: number;
  reviewsCount: string;
  description: string;
  developer: string;
  screenshots: string[];
  size: string;
  ageRating: string;
  downloadUrl: string;
  hasInAppPurchases?: boolean;
  redirectTime?: number;
  version?: string;
  versionDate?: string;
  whatsNew?: string;
  versionHistory?: VersionEntry[];
  events?: AppEvent[];
  compatibility?: string;
  price?: string;
  country?: string;
  apkUrl?: string;
  externalLink?: string;
  iosUrl?: string;
  androidUrl?: string;
  downloads?: string;
  creatorAppleId?: string;
  videoUrl?: string;
}

export interface AppStoreState {
  apps: AppEntry[];
  activeTab: 'Today' | 'Games' | 'Apps' | 'Search' | 'Admin';
  viewingAppId: string | null;
  isAdmin: boolean;
}

export interface UserEntry {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
}
