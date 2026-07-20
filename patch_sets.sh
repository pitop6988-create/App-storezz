sed -i "s/const newPurchased = new Set(purchaseLibrary);/const newPurchased = new Set<string>(purchaseLibrary);/g" src/App.tsx
sed -i "s/const newDownloaded = new Set(downloadedApps);/const newDownloaded = new Set<string>(downloadedApps);/g" src/App.tsx
