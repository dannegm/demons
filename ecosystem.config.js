module.exports = {
    apps: [
        {
            name: 'demons',
            script: './build',
            cron_restart: "0 */6 * * *",
            interpreter: 'node',
            interpreter_args: '-r dotenv/config',
            watch: false,
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
