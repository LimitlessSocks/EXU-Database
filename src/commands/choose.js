const { SlashCommandBuilder } = require("@discordjs/builders");

const command = {};
command.name = "choose";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Chooses between a comma-separated list of options")
        .addStringOption((option) =>
            option.setName("choices")
                  .setDescription("List of comma-separated choices")
                  .setRequired(true)
        );

command.execute = async (interaction, Database) => {
    let choices = interaction.options.getString("choices");
    choices = choices.split(/\s*,\s*/);
    
    let choice = choices[Math.random() * choices.length | 0];
    
    await interaction.reply(`I choose... **${choice}**!`);
};

module.exports = command;
