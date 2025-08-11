/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // This plugin is essential for Tailwind CSS to process its directives.
    '@tailwindcss/postcss': {},
  },
}

export default config
