/*
@ Person __Submission:__ [`Name`]
```Feedback here.```
[`Staff Consensus`]: ✅⚠️🚫 

*/

const {
    SlashCommandBuilder,
    userMention,
    codeBlock,
    inlineCode,
    time,
} = require("@discordjs/builders");
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { COLORS } = require("./../static.js");

const command = {};
command.name = "feedback";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("Delivers feedback, pinging Bear")
        .addUserOption((option) =>
            option.setName("creator")
                  .setDescription("The person who made the submission")
                  .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("submission")
                  .setDescription("The name of the submission")
                  .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName("decision")
                  .setDescription("The verdict for the submission")
                  .setRequired(true)
                  .addChoices(
                       { name: "Approve✅",   value: ":white_check_mark:" },
                       { name: "Warn⚠️",      value: ":warning:" },
                       { name: "Reject🚫",    value: ":no_entry_sign:" },
                       { name: "Other❗",      value: ":exclamation:" },
                   )
        )
        .addStringOption((option) =>
            option.setName("paragraph1")
                  .setDescription("The content of the feedback")
                  .setRequired(true)
        )
const PARAGRAPH_MAX = 7;
for(let i = 2; i <= PARAGRAPH_MAX; i++) {
    command.data.addStringOption((option) =>
        option.setName(`paragraph${i}`)
              .setDescription("The content of the feedback")
    );
}

// const BEAR = "277600188002992129";
const BEAR = "728518668845187113";
// #submission-feedback
const FEEDBACK_DESTINATION = "641406822581796888";
// #cat-team
const BEAR_NOTIFICATION_DESTINATION = "716028795978776586";
const STAFF_ROLE = "614665426311446549";
command.execute = async (interaction, Database) => {
    const { user, client, options } = interaction;
    const feedbackChannel = client.channels.cache.get(FEEDBACK_DESTINATION);
    // verify
    if(!feedbackChannel.permissionsFor(user).has(PermissionFlagsBits.SendMessages)) {
        await interaction.reply({
            content: "You are not authorized to use this command!",
            ephemeral: true
        });
        return;
    }
    // console.log(options);
    const paragraphs = [];
    for(let i = 1; i <= PARAGRAPH_MAX; i++) {
        let p = options.getString(`paragraph${i}`);
        if(p) {
            paragraphs.push(p);
        }
    }
    const { id: creatorId } = options.getUser("creator");
    const subName = options.getString("submission");
    const decision = options.getString("decision");
    let body = codeBlock(paragraphs.join("\n\n"));
    let message = `${userMention(creatorId)} __Submission:__ [${inlineCode(subName)}]\n${body}\n[\`Staff Consensus\`]: ${decision}`;
    
    await feedbackChannel.send(message);
    await interaction.reply("Sent feedback at " + time(new Date()) + "!");
    await client.channels.cache.get(BEAR_NOTIFICATION_DESTINATION)
        .send(`${userMention(BEAR)} Feedback delivered for ${inlineCode(subName)}! Decision: ${decision}`);
};

module.exports = command;
