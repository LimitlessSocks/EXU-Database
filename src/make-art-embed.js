const { EmbedBuilder } = require("discord.js");
const { COLORS } = require("./static.js");

module.exports = card =>
    new EmbedBuilder()
        .setColor(COLORS[card.monster_color] ?? COLORS[card.card_type] ?? "#000000")
        .setImage(card.src)
        .setTitle(card.name)
        .setFooter({ text: card.username || null });
