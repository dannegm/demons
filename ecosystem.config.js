module.exports = {
    apps: [
        {
            name: 'demons',
            script: './build',
            interpreter: 'node',
            interpreter_args: '-r dotenv/config',
            watch: false,
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
