// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import vercelAdapter from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), icon()],
  output: 'server',
  adapter: vercelAdapter(),
  vite: {
    plugins: [tailwindcss()]
  }
});