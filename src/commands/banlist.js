const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { search } = require("./../search.js");

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
    let card = await search(interaction, Database);
    
    if(!card) return;
    
    await interaction.reply(`**${card.name}** is at ${card.exu_limit ?? 3}.`);
};
command.autocomplete = async (interaction, Database) => {
    return await autocomplete(interaction, Database, {
        suggestRestricted: true
    });
};

module.exports = command;
