const { SlashCommandBuilder } = require("@discordjs/builders");

const command = {};
command.name = "link";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Outputs a link for the website");

command.execute = async (interaction, Database) => {
    await interaction.reply("Website: https://limitlesssocks.github.io/EXU-Scrape/\nQuery: https://limitlesssocks.github.io/EXU-Scrape/new-search\nSearch: https://limitlesssocks.github.io/EXU-Scrape/search");
};

module.exports = command;
