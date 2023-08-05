const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { initialize, queryNaturalInput } = require("./../tag-extract.js");
const paginate = require("./../pagination.js");
const makeArtEmbed = require("./../make-art-embed.js");
const TimedConsole = require("./../timed-console.js");

const command = {};
command.name = "load";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Reloads the database")

command.execute = async (interaction, Database) => {
    if (!interaction.deferred) {
        try {
            await interaction.deferReply();
        }
        catch(e) {
            TimedConsole.error("commands/load.js: Could not defer reply:", e);
        }
    }
    try {
        TimedConsole.log("commands/load.js: Attempting to load database");
        await Database.loadDatabase();
        TimedConsole.log("commands/load.js: Database loaded");
        await interaction.editReply("Database reloaded.");
    }
    catch(e) {
        await interaction.editReply("Something went wrong loading the database.");
        TimedConsole.error("commands/load.js: Error loading:" ,e);
    }
};

module.exports = command;
