import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import config from './config';

const rest = new REST({ version: '9' }).setToken(config.token);
// Routes.applicationCommands(clientId) Deletes all global commands.
rest.get(Routes.applicationGuildCommands(config.clientId, config.guildId))
  .then(data => {
    const promises = [];
    for (const command of data) {
      const deleteUrl = `${Routes.applicationGuildCommands(config.clientId, config.guildId)}/${command.id}`;
      promises.push(rest.delete(deleteUrl));
    }
    return Promise.all(promises);
  });
