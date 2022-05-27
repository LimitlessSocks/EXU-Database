const { SlashCommandBuilder } = require("@discordjs/builders");
const { initialize, queryNaturalInput } = require("./../tag-extract.js");
const makeArtEmbed = require("./../make-art-embed.js");

const command = {};
command.name = "random-art-query";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Gets the art of a random card filtered by natural input")
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
    await interaction.reply({ embeds: [makeArtEmbed(card)] });
};

module.exports = command;
