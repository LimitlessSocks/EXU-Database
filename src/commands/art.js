const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { autocomplete } = require("./../autocomplete.js");
const { search } = require("./../search.js");
const { COLORS } = require("./../static.js");
const paginate = require("./../pagination.js");

const command = {};
command.name = "art";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Gets the art of a searched card")
        .addStringOption((option) =>
            option.setName("name")
                  .setDescription("The card you want to search")
                  .setRequired(true)
                  .setAutocomplete(true)
        );

command.execute = async (interaction, Database) => {
    let cards = await search(interaction, Database);
    
    if(!cards) return;
    
    if(cards.length === 1) {
        await interaction.reply(cards[0].src);
    }
    else {
        let embeds = cards.map(card =>
            new MessageEmbed()
                .setColor(COLORS[card.monster_color] ?? COLORS[card.card_type] ?? "#000000")
                .setImage(card.src)
                .setTitle(card.name)
                .setFooter(card.username ?? "")
        );
        await paginate(interaction, embeds);
    }
};
command.autocomplete = async (interaction, Database) => {
    return await autocomplete(interaction, Database, {
        noId: true
    });
};

module.exports = command;
