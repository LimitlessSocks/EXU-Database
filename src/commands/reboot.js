const { SlashCommandBuilder } = require("@discordjs/builders");

const command = {};
command.name = "reboot";
command.data =
    new SlashCommandBuilder()
		.setName(command.name)
		.setDescription("SOCK-ONLY reboots the bot");

command.execute = async (interaction, Database) => {
    if(interaction.user.id !== "277600188002992129") {
        await interaction.reply("## You are not Sock!\n# Begone!\n# <:aftonblast:1160749342139891834> <:aftonblast:1160749342139891834> <:aftonblast:1160749342139891834>");
        return;
    }
    await interaction.reply("Rebooting...");
    setTimeout(() => {
        // https://stackoverflow.com/a/46825815/4119004
        process.on("exit", () => {
            require("child_process").spawn(process.argv.shift(), process.argv, {
                cwd: process.cwd(),
                detached: true,
                stdio: "inherit",
            });
        });
        process.exit();
    }, 1000);
};

module.exports = command;
