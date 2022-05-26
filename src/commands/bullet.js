const { SlashCommandBuilder } = require("@discordjs/builders");

const command = {};
command.name = "bullet";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Outputs the bullets");

command.execute = async (interaction, Database) => {
    await interaction.reply("● ★ ☆ — ♡");
};

module.exports = command;
