const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { initialize, queryNaturalInput } = require("./../tag-extract.js");
const makeEmbed = require("./../make-embed.js");
const paginate = require("./../pagination.js");

const command = {};
command.name = "query";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Search using natural input")
        .addStringOption((option) =>
            option.setName("input")
                  .setDescription("The natural input")
                  .setRequired(true)
        );

command.execute = async (interaction, Database) => {
    let input = interaction.options.getString("input");
    console.log("Natural input query: ", input);
    
    initialize(Database);
    let cards = queryNaturalInput(input);
    
    if(!cards.length) {
        interaction.reply({ content: "No results found for " + input, ephemeral: true });
        return;
    }
    
    let embeds = cards.map(makeEmbed);
    await paginate(interaction, embeds);
};

module.exports = command;
