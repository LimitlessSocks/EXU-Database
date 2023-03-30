const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { initialize, queryNaturalInput } = require("./../tag-extract.js");
const paginate = require("./../pagination.js");
const makeArtEmbed = require("./../make-art-embed.js");

const command = {};
command.name = "load";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Reloads the database")

command.execute = async (interaction, Database) => {
    try {
        await Database.loadDatabase();
        await interaction.reply("Database reloaded.");
    }
    catch(e) {
        await interaction.reply("Something went wrong loading the database.");
    }
};

module.exports = command;
