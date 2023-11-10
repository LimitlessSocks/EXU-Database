const { REST } = require("@discordjs/rest");
const { Client, IntentsBitField } = require("discord.js");
const { Routes } = require("discord-api-types/v9");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("node:fs");
const path = require("node:path");
const fetch = require("node-fetch");
const TimedConsole = require("./timed-console.js");

require('dotenv').config();

// const ART_SOURCE = "http://storage.googleapis.com/ygoprodeck.com/pics_artgame/";
const ART_SOURCE = "https://images.ygoprodeck.com/images/cards_cropped/";

let Database = {
    cards: null,
    lastUpdated: null,
};

const CACHE_LOCATION = "./cache.json";
// obtain the database
const loadDatabase = async function() {
    const db = {};
    TimedConsole.log("loadDatabase: reading databases");
    const head = "https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/";
    // const head = "./../../EXU-Scrape/";
    const urls = [
        // "ycg.json",
        "db.json",
    ];
    
    let useLocal = !Database.cards;
    
    if(useLocal) {
        // TODO: use promises?
        useLocal = fs.existsSync(CACHE_LOCATION);
        if(useLocal) {
            TimedConsole.log("loadDatabase: cached resource exist, populating initial database");
        }
        else {
            TimedConsole.log("loadDatabase: using remote resource to populate cache and initial database");
        }
    }
    else {
        TimedConsole.log("loadDatabase: refreshing cache and database with new resources");
    }
    
    if(useLocal) {
        TimedConsole.log("loadDatabase: reading " + CACHE_LOCATION);
        let rawContents = fs.readFileSync(CACHE_LOCATION);
        let data = JSON.parse(rawContents);
        Object.assign(db, data);
        TimedConsole.log("loadDatabase: done reading " + CACHE_LOCATION + ", received " + Object.keys(data).length);
    }
    else {
        for(let url of urls) {
            TimedConsole.log("loadDatabase: reading " + head + url);
            // TODO: try again if we do not Successfully read (e.g. due to poor connection)
            // w/ max retry count e.g. 3
            if(head.startsWith("http")) {
                const response = await fetch(head + url);
                const data = await response.json();
                TimedConsole.log("loadDatabase: done reading " + head + url + ", received " + Object.keys(data).length);
                Object.assign(db, data);
            }
            else {
                const response = fs.readFileSync(head + url);
                const data = JSON.parse(response);
                TimedConsole.log("loadDatabase: done reading !! debug testing local resource !! " + head + url + ", received " + Object.keys(data).length);
                Object.assign(db, data);
            }
        }
        TimedConsole.log("loadDatabase: pre-caching search terms");
        // process db, cache search names
        for(let card of Object.values(db)) {
            card.lname = card.name.toLowerCase();
            card.idString = card.id + "";
            card.exu_limit ??= 3;
            card.src = card.src || (ART_SOURCE + card.serial_number + ".jpg");
        }
        TimedConsole.log("loadDatabase: saving local copy of database");
        fs.writeFileSync(CACHE_LOCATION, JSON.stringify(db));
    }
    TimedConsole.log("loadDatabase: assign database");
    // only update once we have all the information
    Database.cards = db;
    Database.lastUpdated = new Date().valueOf();
    TimedConsole.log("loadDatabase: database finished loading");
};
Database.loadDatabase = loadDatabase;
loadDatabase();

const commands = new Map([]);
const commandData = [];
const commandFiles = fs.readdirSync(path.join(__dirname, "commands"))
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    TimedConsole.log("main: -- parsing " + file);
	const cmd = require(`./commands/${file}`);
	commandData.push(cmd.data.toJSON());
    commands.set(cmd.name, cmd);
    TimedConsole.log("main: ---- ", cmd.name);
}

// Place your client and guild ids here
const clientId = "918264011903086602";
const guilds = [
    "743977258762633246", //sock's test server
    "614168076065177620", //extinction unleashed
    // "820940036576903169", //knight's server
    //todo:make public?
];

const HOST_LOCAL = "local";
const HOST_CYCLIC = "cyclic";
const VALID_HOSTS = [
    HOST_LOCAL,
    HOST_CYCLIC
];

const { BOT_HOST } = process.env ?? HOST_LOCAL;

if(!VALID_HOSTS.includes(BOT_HOST)) {
    TimedConsole.error(`main: Invalid host name: ${BOT_HOST}`);
    TimedConsole.error(`main: (Expected one of ${VALID_HOSTS.join(" | ")})`);
    return;
}

if(BOT_HOST === HOST_CYCLIC) {
    require("./cyclic.js")({ guilds, commandData });
}
else if(BOT_HOST === HOST_LOCAL) {
    const client = new Client({
        intents: IntentsBitField.Flags.Guilds | IntentsBitField.Flags.GuildMessages
    });
    // When the client is ready, run this code (only once)
    client.once("ready", c => {
        TimedConsole.log(`client.ready: Client is ready! Logged in as ${c.user.tag}`);
    });

    client.on("interactionCreate", async interaction => {
        const { commandName } = interaction;
        TimedConsole.log(`client.interactionCreate: Command /${commandName} created at`, TimedConsole.formatter.format(interaction.createdAt));
        
        if (interaction.isAutocomplete()) {
            TimedConsole.log(`client.interactionCreate: /${commandName}'s autocompletion`);
            let { autocomplete } = commands.get(commandName);
            if(autocomplete) {
                try {
                    await autocomplete(interaction, Database);
                }
                catch(error) {
                    TimedConsole.error("client.interactionCreate: Error occurred while executing command " + commandName);
                    TimedConsole.error("client.interactionCreate:", error);
                }
            }
            else {
                TimedConsole.error("client.interactionCreate: Missing autocomplete for " + commandName);
                // await interaction.reply({
                    // content: "Non-existent autocomplete when expected for " + commandName,
                    // ephemeral: true
                // });
            }
        }
        else if (interaction.isCommand()) {
            TimedConsole.log(`client.interactionCreate: /${commandName}'s command execution`);
            let { execute } = commands.get(commandName);
            if(execute) {
                try {
                    await execute(interaction, Database);
                }
                catch(error) {
                    TimedConsole.error("client.interactionCreate: Error occurred while executing command " + commandName);
                    TimedConsole.error("client.interactionCreate:", error);
                    try {
                        await interaction.reply({
                            content: "There was an error while executing this command!",
                            ephemeral: true
                        });
                    }
                    catch(e) {
                        TimedConsole.error("client.interactionCreate: Could not return error reply", e);
                    }
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
            // TimedConsole.error("client.interactionCreate: Unexpected interaction", interaction);
            // do nothing
        }
    });
    
    // closure for token lifetime
    (function () {
        const token = process.env.BOT_TOKEN;
        if(!token) {
            TimedConsole.error(".env closure: Could not find token in .env");
            return;
        }
        
        for(let guildId of guilds) {
            const rest = new REST({ version: "9" }).setToken(token);
            (async () => {
                try {
                    TimedConsole.log(`.env closure: Started refreshing application (/) commands for guild ${guildId}.`);

                    await rest.put(
                        Routes.applicationGuildCommands(clientId, guildId),
                        { body: commandData },
                    );

                    TimedConsole.log(`.env closure: Successfully reloaded application (/) commands for guild ${guildId}.`);
                } catch (error) {
                    TimedConsole.error(".env closure:", error);
                }
            })();
        }

        client.login(token);
    })();
}
else {
    TimedConsole.error("main: Unhandled host name: ${BOT_HOST}");
    TimedConsole.error("main: (This error should not appear: Validated host name has no implementation.)");
    return;
}
