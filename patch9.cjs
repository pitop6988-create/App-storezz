const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// I need to find the broken string literal and fix it.
code = code.replace(/parseFloat\(app\.price\.replace\('([^']*)'[^)]*\)\);/, "parseFloat(app.price.replace('$', ''));");
code = code.replace(/parseFloat\(app\.price\.replace\('([^']*)'[^)]*\)\);/, "parseFloat(app.price.replace('$', ''));");
fs.writeFileSync('src/App.tsx', code);
