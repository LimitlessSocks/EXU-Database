const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { initialize, queryNaturalInput } = require("./../tag-extract.js");
const makeEmbed = require("./../make-embed.js");
const paginate = require("./../pagination.js");
const TimedConsole = require("./../timed-console.js");

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
    TimedConsole.log("commands/query.js: Natural input query: ", input);
    
    initialize(Database);
    let cards = queryNaturalInput(input);
    
    if(!cards.length) {
        let reason = "";
        if(/^[\w ]+$/.test(input)) {
            reason = ". Did you mean to search by part of a card's name (`\"" + input + "\"`)?";
        }
        interaction.reply({ content: "No results found for " + input + reason, ephemeral: true });
        return;
    }
    
    let embeds = cards.map(card => makeEmbed(card, { natural: input }));
    await paginate(interaction, embeds);
};

module.exports = command;
