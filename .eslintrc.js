export default {
    extends: ['recommended'],
    rules: {
        'no-unused-vars': 'on',
    },
    parserOptions: {
        ecmaVersion: 6,
    },
    env: {
        node: true,
        browser: true,
        es6: true,
    },
};
