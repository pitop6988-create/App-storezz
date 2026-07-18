sed -i "s/toggleDarkMode={toggleDarkMode}/toggleDarkMode={toggleDarkMode}\n              allUsers={allUsers}/g" src/App.tsx
sed -i "s/  currentUser:/  allUsers: any[],\n  currentUser:/g" src/App.tsx
sed -i "s/  currentUser,/  allUsers,\n  currentUser,/g" src/App.tsx
