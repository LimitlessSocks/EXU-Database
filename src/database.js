const { REST } = require("@discordjs/rest");
const { Client, Intents } = require("discord.js");
const { Routes } = require("discord-api-types/v9");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("node:fs");
const path = require("node:path");
const fetch = require("node-fetch");

require('dotenv').config();

let Database = {
    cards: null,
    lastUpdated: null,
};

// obtain the database
const loadDatabase = async function() {
    const db = {};
    console.log("reading databases");
    const head = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
    const urls = [
        "ycg.json",
        "db.json",
    ];
    
    for(let url of urls) {
        console.log("reading " + url);
        const response = await fetch(head + url);
        const data = await response.json();
        console.log("done reading " + url + ", received " + Object.keys(data).length);
        Object.assign(db, data);
    }
    console.log("pre-caching search terms");
    // process db, cache search names
    for(let card of Object.values(db)) {
        card.lname = card.name.toLowerCase();
        card.idString = card.id + "";
        card.exu_limit ??= 3;
        card.src = card.src || (
            "http://storage.googleapis.com/ygoprodeck.com/pics_artgame/" + card.serial_number + ".jpg"
        );
    }
    console.log("assign database");
    // only update once we have all the information
    Database.cards = db;
    Database.lastUpdated = new Date().valueOf(); 
};
Database.loadDatabase = loadDatabase;
loadDatabase();

const commands = new Map([]);
const commandData = [];
const commandFiles = fs.readdirSync(path.join(__dirname, "commands"))
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    console.log("-- parsing " + file);
	const cmd = require(`./commands/${file}`);
	commandData.push(cmd.data.toJSON());
    commands.set(cmd.name, cmd);
    console.log("---- ", cmd.name);
}

// Place your client and guild ids here
const clientId = "918264011903086602";
const guilds = [
    "743977258762633246", //sock's test server
    "614168076065177620", //extinction unleashed
];

const HOST_LOCAL = "local";
const HOST_CYCLIC = "cyclic";
const VALID_HOSTS = [
    HOST_LOCAL,
    HOST_CYCLIC
];

const { BOT_HOST } = process.env ?? HOST_LOCAL;

if(!VALID_HOSTS.includes(BOT_HOST)) {
    console.error(`Invalid host name: ${BOT_HOST}`);
    console.error(`(Expected one of ${VALID_HOSTS.join(" | ")})`);
    return;
}

if(BOT_HOST === HOST_CYCLIC) {
    require("./cyclic.js")({ guilds, commandData });
}
else if(BOT_HOST === HOST_LOCAL) {
    const client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    });
    // When the client is ready, run this code (only once)
    client.once("ready", c => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    client.on("interactionCreate", async interaction => {

        const { commandName } = interaction;
        
        if (interaction.isAutocomplete()) {
            let { autocomplete } = commands.get(commandName);
            if(autocomplete) {
                try {
                    await autocomplete(interaction, Database);
                }
                catch(error) {
                    console.error("Error occurred while executing command " + commandName);
                    console.error(error);
                }
            }
            else {
                console.error("Missing autocomplete for " + commandName);
                // await interaction.reply({
                    // content: "Non-existent autocomplete when expected for " + commandName,
                    // ephemeral: true
                // });
            }
        }
        else if (interaction.isCommand()) {
            let { execute } = commands.get(commandName);
            if(execute) {
                try {
                    await execute(interaction, Database);
                }
                catch(error) {
                    console.error("Error occurred while executing command " + commandName);
                    console.error(error);
                    await interaction.reply({
                        content: "There was an error while executing this command!",
                        ephemeral: true
                    });
                }
            }
            else {
                await interaction.reply({
                    content: "Non-existent command " + commandName,
                    ephemeral: true
                });
            }
        }
        else {
            // do nothing
        }
    });

    (function () {
        const token = process.env.BOT_TOKEN;
        if(!token) {
            console.error("Could not find token in .env");
            return;
        }
        
        for(let guildId of guilds) {
            const rest = new REST({ version: "9" }).setToken(token);
            (async () => {
                try {
                    console.log("Started refreshing application (/) commands.");

                    await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        { body: commandData },
                    );

                    console.log("Successfully reloaded application (/) commands.");
                } catch (error) {
                    console.error(error);
                }
            })();
        }

        client.login(token);
    })();
}
else {
    console.error("Unhandled host name: ${BOT_HOST}");
    console.error("(This error should not appear: Validated host name has no implementation.)");
    return;
}

