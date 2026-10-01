import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The same package works at username.github.io/ and username.github.io/repo/.
  base: './',
})
