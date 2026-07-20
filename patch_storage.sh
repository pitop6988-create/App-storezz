sed -i "/return unique;\n  });/a \  useEffect(() => {\n    localStorage.setItem('ios_store_all_users', JSON.stringify(allUsers));\n  }, [allUsers]);" src/App.tsx
