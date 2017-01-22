module.exports = {
    root: true,
    parserOptions: {
        sourceType: 'module'
    },
    extends: "standard",    
    plugins: [
        "standard",
        "promise"
    ],
    rules: {
        'no-unused-vars': 1
    },
    globals: {
        'self': true
    }
};