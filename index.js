const { Plugin } = require('powercord/entities');
const { get } = require('powercord/http');

class LicenseChecker extends Plugin {
    startPlugin() {
        this.registerCommand();
    }

    registerCommand() {
        powercord.api.commands.registerCommand({
            command: 'license',
            aliases: ['lic'],
            usage: '{c} <license>',
            executor: (args) => this.getLicense(args)
        });
    }

    getLicense(args) {
        if (!args.length)
            return {
                send: false,
                result: 'What license should I fetch info on?'
            };

        const { body } = get(`https://api.github.com/licenses/${args[0]}`);
        if (!body || body.message === 'Not Found')
            return {
                send: false,
                result: `Couldn't find the ${args[0]} license...`
            };

        const capitalize = (text) => text[0].toUpperCase() + text.slice(1);

        const result = {
            send: false,
            result: {
                type: 'rich',
                title: body.name,
                description: `${body.description}\n[Read more](${body.html_url})`,
                fields: [
                    {
                        name: 'Implementation',
                        value: body.implementation
                    },
                    {
                        name: 'Permissions',
                        value: body.permissions.map((perm) =>
                            capitalize(perm.replace('-', ' '))
                        ),
                        inline: true
                    }
                ]
            }
        };

        const loop = (keys) =>
            keys.forEach((elem) => {
                if (body[elem].length)
                    result.fields.push({
                        name: capitalize(elem),
                        value: body[elem].map((e) => capitalize(e.replace('-', ' '))),
                        inline: true
                    });
            });

        loop(['conditions', 'limitations']);

        if (body.featured)
            result.fields.push({
                name: 'Featured',
                value: '`true`'
            });

        return result;
    }
}

module.exports = LicenseChecker;