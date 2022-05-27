const { SlashCommandBuilder } = require("@discordjs/builders");

const command = {};
command.name = "random-art";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Gives the art of a random card in the database (custom or not)");

command.execute = async (interaction, Database) => {
    let values = Object.values(Database.cards);
    let card = values[Math.random() * values.length | 0];
    await interaction.reply({ embeds: [makeArtEmbed(card)] });
};

module.exports = command;
