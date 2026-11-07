// After a build: copy studio/dist into the repo's main folder, which GitHub Pages publishes
// (https://deltaowleyes.ca/bake-studio/).
import { cpSync, writeFileSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
cpSync(new URL('../dist/', import.meta.url), root, { recursive: true });
writeFileSync(new URL('.nojekyll', root), '');   // serve files as they are, no Jekyll processing
console.log('Placed the build in the repo main folder.');
