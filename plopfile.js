const fs = require('fs');
const path = require('path');

module.exports = function (plop) {
    plop.setActionType('checkOrCreate', function (answers, config) {
        const filePath = path.resolve(__dirname, config.path);
        if (!fs.existsSync(filePath)) return true;
        return `File "${config.path}" already exists. No action taken.`;
    });

    plop.setGenerator('setup-flags', {
        description: 'Create the flags file',
        prompts: [],
        actions: [
            {
                type: 'checkOrCreate',
                path: 'src/flags.local.js',
            },
            {
                type: 'add',
                path: 'src/flags.local.js',
                templateFile: 'templates/flags/flags.js.hbs',
                abortOnFail: true,
            },
        ],
    });
};
