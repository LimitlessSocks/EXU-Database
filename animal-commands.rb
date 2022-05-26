require "net/http"
require "uri"
require "json"

boilerplate = <<EOT
// dynamically generated with animal-commands.rb.
// do not modify if you want persistent changes.
const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

const head = "https://more-random-animals.herokuapp.com/";

const command = {};
command.name = %s;
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription(%s);

command.execute = async (interaction, Database) => {
    const response = await fetch(head + command.name);
    const json = await response.json();
    await interaction.reply(json.url);
};

module.exports = command;
EOT

puts "Getting domains..."
uri = URI("https://more-random-animals.herokuapp.com/domains")
json = Net::HTTP.get(uri)
result = JSON(json)

result["domains"].each { |data|
    protocol = data["commandName"]
    description = data["description"]
    puts "Processing #{protocol}.js..."
    content = boilerplate % [ protocol.inspect, description.inspect ]
    File.write "src/commands/#{protocol}.js", content
}