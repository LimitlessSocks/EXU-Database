const { SlashCommandBuilder } = require("@discordjs/builders");

const command = {};
command.name = "kill";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("SOCK-ONLY kills the bot");

command.execute = async (interaction, Database) => {
    if(interaction.user.id !== "277600188002992129") {
        await interaction.reply("## You are not Sock!\n# Begone!\n# <:aftonblast:1160749342139891834> <:aftonblast:1160749342139891834> <:aftonblast:1160749342139891834>");
        return;
    }
    await interaction.reply("Exiting...");
    process.exit();
};

module.exports = command;
