// Before a build: remove the previous build from the repo's main folder (GitHub Pages publishes from there).
import { rmSync } from 'node:fs';
rmSync(new URL('../../assets', import.meta.url), { recursive: true, force: true });
rmSync(new URL('../../index.html', import.meta.url), { force: true });
