// dynamically generated with animal-commands.rb.
// do not modify if you want persistent changes.
const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

const head = "https://more-random-animals.herokuapp.com/";

const command = {};
command.name = "duck";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Random picture of a duck");

command.execute = async (interaction, Database) => {
    const response = await fetch(head + command.name);
    const json = await response.json();
    await interaction.reply(json.url);
};

module.exports = command;
