const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { search } = require("./../search.js");
const makeEmbed = require("./../make-embed.js");
const paginate = require("./../pagination.js");

const command = {};
command.name = "search";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Searches for a card in the database")
        .addStringOption((option) =>
            option.setName("name")
                  .setDescription("The card you want to search")
                  .setRequired(true)
                  .setAutocomplete(true)
        );

command.execute = async (interaction, Database) => {
    let cards = await search(interaction, Database);
    
    if(!cards) return;
    
    let embeds = cards.map(card => makeEmbed(card));
    await paginate(interaction, embeds);
};
command.autocomplete = async (interaction, Database) => {
    return await autocomplete(interaction, Database);
};

module.exports = command;
