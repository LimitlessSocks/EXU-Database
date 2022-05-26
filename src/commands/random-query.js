const { SlashCommandBuilder } = require("@discordjs/builders");
const { initialize, queryNaturalInput } = require("./../tag-extract.js");
const makeEmbed = require("./../make-embed.js");

const command = {};
command.name = "random-query";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Gives a random card in the database (custom or not)")
        .addStringOption((option) =>
            option.setName("input")
                  .setDescription("The natural input")
                  .setRequired(true)
        );

command.execute = async (interaction, Database) => {
    let input = interaction.options.getString("input");
    
    initialize(Database);
    let cards = queryNaturalInput(input);
    
    if(!cards.length) {
        interaction.reply({ content: "No results found for " + input, ephemeral: true });
        return;
    }
    
    let card = cards[Math.random() * cards.length | 0];
    
    let embed = makeEmbed(card);
    await interaction.reply({
        embeds: [embed],
    });
};

module.exports = command;
