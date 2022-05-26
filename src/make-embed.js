const { MessageEmbed } = require("discord.js");
const escapeDiscord = require("./escape-discord.js");
const {
    EMOJI,
    COLORS,
    getLinkArrowText,
    BLS
} = require("./static.js");


const extraDeckColors = ["Fusion", "Synchro", "Xyz", "Link"];
const isExtraDeck = (card) =>
    card.card_type === "Monster" &&
    extraDeckColors.some(color => card.monster_color === color);

const isNonEffect = (card) => {
    if(card.card_type !== "Monster") {
        return card.cached_is_non_effect = false;
    }
    
    if(typeof card.cached_is_non_effect !== "undefined") {
        return card.cached_is_non_effect;
    }
    
    if(card.monster_color == "Normal") {
        return card.cached_is_non_effect = true;
    }
    
    if(card.monster_color == "Ritual") {
        let sentences = card.effect
            .replace(/".+?"/g, "")
            .replace(/\.$/g, "")
            .split(".");
        
        return card.cached_is_non_effect = sentences.length === 1;
    }
    
    if(isExtraDeck(card)) {
        let parsed = card.effect
            .replace(/\(.+?\)/g, "")
            .replace(/".+?"/g, "")
        let paras = parsed.trim().split(/\r?\n|\r/g);
        let sentences = parsed.split(".");
        let isNonEffect = paras.length === 1 && sentences.length === 1;
        return card.cached_is_non_effect = isNonEffect;
    }
    
    return card.cached_is_non_effect = false;
};

module.exports = (card) => {
    let fields = [];
    
    let color = "#000000";
    let type = card.type;
    let effect = escapeDiscord(card.effect);
    let name = escapeDiscord(card.name);
    let levelIndicator, footer;
    
    let typeEmoji;
    if(card.monster_color) {
        // TODO: ATK and DEF
        color = COLORS[card.monster_color] ?? color;
        if(card.monster_color == "Normal") {
            effect = `*${effect}*`;
        }
        typeEmoji = EMOJI[card.type.replace(/ |-/g, "")];
        let secondType;
        if(card.pendulum) {
            effect = "**[Pendulum Effect]**\n" + card.pendulum_effect + "\n──────────────────────────────────\n**[Monster Effect]**\n" + effect;
            let pendEmoji = EMOJI[`${card.monster_color}PendulumMonster`] ?? EMOJI.PendulumMonster;
            secondType = "/Pendulum";
            if(card.monster_color !== "Effect") {
                secondType += "/" + card.monster_color;
            }
            typeEmoji += pendEmoji;
        }
        else {
            typeEmoji += EMOJI[card.monster_color];
            if(card.monster_color === "Effect") {
                secondType = "";
            }
            else {
                secondType = "/" + card.monster_color;
            }
        }
        if(card.effect.includes("FLIP:")) {
            secondType += "/Flip";
        }
        else if(card.ability) {
            secondType += "/" + card.ability;
        }
        
        type += secondType;
        if(!isNonEffect(card) && !secondType.includes("Effect")) {
            type += "/Effect";
        }
        
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link Rating";
                break;
            case "Xyz":
                levelIndicator = "Rank";
                break;
            default:
                levelIndicator = "Level";
                break;
        }
        
        let liEmoji = EMOJI[levelIndicator];
        if(liEmoji) {
            liEmoji += " ";
        }
        else {
            liEmoji = "";
        }
        
        fields.push({ name: "Attribute", value: EMOJI[card.attribute] + " " + card.attribute, inline: true });
        fields.push({ name: levelIndicator, value: liEmoji + card.level + "", inline: true });
        
        if(card.monster_color === "Link") {
            fields.push({ name: "ATK", value: card.atk, inline: true });
        }
        else {
            fields.push({ name: "ATK/DEF", value: card.atk + "/" + card.def, inline: true });
        }
        
        if(card.pendulum) {
            fields.push({ name: "Pendulum Scale", value: `${EMOJI.ScaleLeft} ${card.scale}/${card.scale} ${EMOJI.ScaleRight}`, inline: true });
        }
        if(card.monster_color == "Link") {
            fields.push({ name: "Link Arrows", value: getLinkArrowText(card.arrows), inline: true });
        }
    }
    else {
        color = COLORS[card.card_type];
        type += "/" + card.card_type;
        typeEmoji = EMOJI[`${card.type.replace(/ |-/g, "")}Backrow`];
    }
    
    if(typeEmoji) {
        type = typeEmoji + " " + type;
    }
    
    if(card.custom) {
        footer = `${card.username} (${card.id})`;
    }
    else {
        footer = `${card.serial_number} (${card.id})`;
    }
    
    fields.unshift({ name: "Type", value: type, inline: true });
    fields.push({ name: "EXU Banlist Status", value: (card?.exu_limit ?? "3") + "", inline: true });
    fields.push({ name: "Links", value: `[DuelingBook](https://www.duelingbook.com/card?id=${card.id}) · [EXU](https://limitlesssocks.github.io/EXU-Scrape/card?id=${card.id})` });
    
    return new MessageEmbed()
        .setColor(color)
        .setTitle(name)
        // .setDescription("")
        .setDescription(effect)
        .addFields(fields)
        .setThumbnail(card.src)
        .setFooter(footer);
};