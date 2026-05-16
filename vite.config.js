// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['firebase/auth', 'firebase/app', 'firebase/firestore'] // ← Add this line
//   },
//   base: '/chat-app/', // 🔁 important!
// })

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load .env files based on the current mode (e.g., development or production)
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['firebase/auth', 'firebase/app', 'firebase/firestore']
    },
    base: '/chat-app/',

    define: {
      'process.env': env // optional if you're using `process.env`, but not needed for `import.meta.env`
    }
  }
})
