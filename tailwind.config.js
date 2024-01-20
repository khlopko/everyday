/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js,ts}"],
    theme: {
        screens: {
            'sm': '240px',
            'md': '320px',
            'lg': '480px',
            'xl': '640px',
            '2xl': '768px',
        },
        extend: {},
    },
    plugins: [],
}

