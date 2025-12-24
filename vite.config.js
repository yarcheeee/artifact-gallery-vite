import { defineConfig } from 'vite';

// Для GitHub Pages (project pages) относительный base удобнее всего.
// Тогда сборка работает и в подкаталоге (например /my-deploy-project/), и локально.
export default defineConfig({
  base: './',
});
