/*
 * copied from https://raw.githubusercontent.com/ryzyx/discordjs-button-pagination/interaction/index.js
 * but modifying setFooter calls
 */

const {
  ActionRowBuilder,
  Message,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");

/**
 * Creates a pagination embed
 * @param {Interaction} interaction
 * @param {EmbedBuilder[]} pages
 * @param {ButtonBuilder[]} buttonList
 * @param {number} timeout
 * @returns
 */
const paginationEmbed = async (
  interaction,
  pages,
  buttonList,
  timeout = 120000
) => {
  if (!pages) throw new Error("Pages are not given.");
  if (!buttonList) throw new Error("Buttons are not given.");
  if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK")
    throw new Error(
      "Link buttons are not supported with discordjs-button-pagination"
    );
  if (buttonList.length !== 2) throw new Error("Need two buttons.");

  let page = 0;
  
  const ownerId = interaction.user.id;
  const ownerName = `${interaction.user.username}#${interaction.user.discriminator}`;

  const row = new ActionRowBuilder().addComponents(buttonList);

  //has the interaction already been deferred? If not, defer the reply.
  if (interaction.deferred == false) {
    await interaction.deferReply();
  }
  
  let oldFooters = pages.map(e => e.data?.footer?.text);
  
  const updateFooter = () => {
    let text = `Page ${page + 1} / ${pages.length}`;
    if(oldFooters[page]) {
      text += ` · ${oldFooters[page]}`;
    }
    return pages[page].setFooter({ text });
  }

  const curPage = await interaction.editReply({
    embeds: [updateFooter()],
    components: [row],
    fetchReply: true,
  });
  
  // why on earth does discord.js use snake_case here??
  // XXX: this can't be stable, i expect this to change to customId in the future
  const buttonIds = buttonList.map(button => button.data.custom_id);
  
  const filter = i =>
    i.customId === buttonIds[0] || i.customId === buttonIds[1];

  const collector = await curPage.createMessageComponentCollector({
    filter,
    time: timeout,
  });

  collector.on("collect", async (i) => {
    if(i.user.id !== ownerId) {
        i.reply({
            content: `This is ${ownerName}'s, not yours!`,
            ephemeral: true
        });
        return;
    }
    switch (i.customId) {
      case buttonIds[0]:
        page = page > 0 ? --page : pages.length - 1;
        break;
      case buttonIds[1]:
        page = page + 1 < pages.length ? ++page : 0;
        break;
      default:
        break;
    }
    await i.deferUpdate();
    await i.editReply({
      embeds: [updateFooter()],
      components: [row],
    });
    collector.resetTimer();
  });

  collector.on("end", (_, reason) => {
    if (reason !== "messageDelete") {
      const disabledRow = new ActionRowBuilder().addComponents(
        buttonList[0].setDisabled(true),
        buttonList[1].setDisabled(true)
      );
      curPage.edit({
        embeds: [updateFooter()],
        components: [disabledRow],
      });
    }
  });

  return curPage;
};
module.exports = paginationEmbed;
