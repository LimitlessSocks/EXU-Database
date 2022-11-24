require("dotenv").config();

const APPLICATION_ID = process.env.APPLICATION_ID;
const TOKEN = process.env.BOT_TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY || "not set";
const PORT = process.env.PORT || 8999;

const axios = require("axios");
const express = require("express");
const {
    InteractionType,
    InteractionResponseType,
    verifyKeyMiddleware
} = require("discord-interactions");

module.exports = function ({ guilds, commandData }) {

    const app = express();
    // app.use(bodyParser.json());

    const discord_api = axios.create({
        baseURL: "https://discord.com/api/",
        timeout: 3000,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
            "Access-Control-Allow-Headers": "Authorization",
            "Authorization": `Bot ${TOKEN}`
        }
    });
    
    app.post("/interactions", verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
        const interaction = req.body;
        console.log("Interaction: ", interaction);
        if(interaction.data.name == "search") {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Yo ${interaction.member.user.username}!`,
                },
            });
        }
    });
    
    app.get("/register_commands", async (req, res) => {
        for(let GUILD_ID of guilds) {
            try {
                // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
                let discord_response = await discord_api.put(
                    `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
                    commandData
                );
                console.log("Discord response:");
                console.log(Object.keys(discord_response));
                console.log(discord_response.status, ";", discord_response.statusText);
                // console.log("Discord response:\n", discord_response.data);
                return res.send("commands have been registered");
            }
            catch(e) {
                console.error(e.code);
                console.error(e.response?.data);
                return res.send(`${e.code} error from discord`);
            }
        }
    });
    
    app.get("/", async (req, res) => {
        return res.send("Follow documentation");
    });
    
    console.log(`Listening on port ${PORT}...`);
    console.log(`Hint: visit :${PORT}/register_commands`);
    app.listen(PORT, () => {
        // empty
    });
};