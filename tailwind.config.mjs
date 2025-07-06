// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        colors: {
          'main-bg': '#F7F8FC', // Light grayish blue
          'sidebar-bg': '#FFFFFF',
          'sidebar-text': '#6B7280', // Gray-500
          'sidebar-active-bg': '#EBF4FF', // Light blue
          'sidebar-active-text': '#2563EB', // Blue-600
          'header-bg': '#FFFFFF',
          'card-bg': '#FFFFFF',
          'text-primary': '#1F2937', // Gray-800
          'text-secondary': '#6B7280', // Gray-500
          'brand-primary': '#3B82F6', // Blue-500
          'brand-accent-green': '#10B981', // Green-500
          'danger': '#EF4444', // Red-500
        },
        boxShadow: {
          'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
      },
    },
    plugins: [],
  }