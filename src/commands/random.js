const { SlashCommandBuilder } = require("@discordjs/builders");
const makeEmbed = require("./../make-embed.js");

const command = {};
command.name = "random";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Gives a random card in the database (custom or not)");

command.execute = async (interaction, Database) => {
    let values = Object.values(Database.cards);
    let card = values[Math.random() * values.length | 0];
    
    let embed = makeEmbed(card);
    await interaction.reply({
        embeds: [embed],
    });
};

module.exports = command;
