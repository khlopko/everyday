/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./**/*.{html,js,ts}"],
    theme: {
        screens: {
            'sm': '480px',
            'md': '640px',
            'lg': '768px',
            'xl': '768px',
            '2xl': '768px',
        },
        extend: {},
    },
    plugins: [],
}

