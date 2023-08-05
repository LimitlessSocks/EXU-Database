const {
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const paginationEmbed = require("./extern/pagination.js");

module.exports = async (interaction, embeds, buttons) => {
    if(embeds.length === 1) {
        if(interaction.deferred) {
            return await interaction.editReply({ embeds: embeds });
        }
        else {
            return await interaction.reply({ embeds: embeds });
        }
    }
    
    if(!buttons) {
        const previousButton = new ButtonBuilder()
            .setCustomId("previousbtn")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Danger);

        const nextButton = new ButtonBuilder()
            .setCustomId("nextbtn")
            .setLabel("Next")
            .setStyle(ButtonStyle.Success);
        buttons = [previousButton, nextButton];
    }
    const timeout = 30000;
    return await paginationEmbed(interaction, embeds, buttons, timeout);
};
