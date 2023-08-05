const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { search } = require("./../search.js");

const command = {};
command.name = "text";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Minimal search result for a card in the database")
        .addStringOption((option) =>
            option.setName("name")
                  .setDescription("The card you want to search")
                  .setRequired(true)
                  .setAutocomplete(true)
        );

command.execute = async (interaction, Database) => {
    let cards = await search(interaction, Database);
    
    if(!cards.length) return;
    let card = cards[0];
    
    let effect = card.effect;
    if(card.monster_color === "Normal") {
        effect = `*${effect}*`;
    }
    if(card.pendulum) {
        effect = "**[Pendulum Effect]**\n" + card.pendulum_effect + "\n──────────────────────────────────\n**[Monster Effect]**\n" + effect;
    }
    
    let secondary;
    if(card.monster_color) {
        let levelIndicator;
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link-";
                break;
            case "Xyz":
                levelIndicator = "Rank ";
                break;
            default:
                levelIndicator = "Level ";
                break;
        }
        secondary = `${levelIndicator}${card.level} ${card.attribute} ${card.type} ${card.monster_color} Monster`;
    }
    else {
        secondary = `${card.card_type} ${card.type}`;
    }
    
    let text = "__**" + card.name + "**__ [" + secondary + "]\n" + effect;
    
    await interaction.editReply(text);
};
command.autocomplete = async (interaction, Database) => {
    return await autocomplete(interaction, Database);
};

module.exports = command;
