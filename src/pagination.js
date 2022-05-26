const { MessageButton } = require("discord.js");
const paginationEmbed = require("./extern/pagination.js");

module.exports = async (interaction, embeds, buttons) => {
    if(embeds.length === 1) {
        return await interaction.reply({ embeds: embeds });
    }
    
    if(!buttons) {
        const previousButton = new MessageButton()
            .setCustomId("previousbtn")
            .setLabel("Previous")
            .setStyle("DANGER");

        const nextButton = new MessageButton()
            .setCustomId("nextbtn")
            .setLabel("Next")
            .setStyle("SUCCESS");
        buttons = [previousButton, nextButton];
    }
    const timeout = 30000;
    return await paginationEmbed(interaction, embeds, buttons, timeout);
};
