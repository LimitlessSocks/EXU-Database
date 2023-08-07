const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { search } = require("./../search.js");
const banlistLimit = require("./../banlist-status.js");

const command = {};
command.name = "banlist";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Gets the banlist status of a card")
        .addStringOption((option) =>
            option.setName("name")
                  .setDescription("The card you want to examine")
                  .setRequired(true)
                  .setAutocomplete(true)
        );

command.execute = async (interaction, Database) => {
    let cards = await search(interaction, Database);
    
    if(!cards || !cards.length) return;
    
    let card = cards[0];
    let limit = banlistLimit(card);
    
    await interaction.editReply(`**${card.name}** is at ${limit}.`);
};
command.autocomplete = async (interaction, Database) => {
    return await autocomplete(interaction, Database, {
        suggestRestricted: true
    });
};

module.exports = command;
