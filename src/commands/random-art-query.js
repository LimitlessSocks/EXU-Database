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
    
    await interaction.deferReply();
    initialize(Database);
    let cards = queryNaturalInput(input);
    
    if(!cards.length) {
        interaction.editReply({ content: "No results found for " + input, ephemeral: true });
        return;
    }
    
    let card = cards[Math.random() * cards.length | 0];
    await interaction.editReply({ embeds: [makeArtEmbed(card)] });
};

module.exports = command;
