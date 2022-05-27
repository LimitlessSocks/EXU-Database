const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { initialize, queryNaturalInput } = require("./../tag-extract.js");
const paginate = require("./../pagination.js");
const makeArtEmbed = require("./../make-art-embed.js");

const command = {};
command.name = "art-query";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Gets the art of a searched card")
        .addStringOption((option) =>
            option.setName("input")
                  .setDescription("The natural input")
                  .setRequired(true)
        );

command.execute = async (interaction, Database) => {
    let input = interaction.options.getString("input");
    
    initialize(Database);
    let cards = queryNaturalInput(input);
    
    if(!cards) return;
    
    let embeds = cards.map(makeArtEmbed);
    await paginate(interaction, embeds);
};
command.autocomplete = async (interaction, Database) => {
    return await autocomplete(interaction, Database, {
        noId: true
    });
};

module.exports = command;
