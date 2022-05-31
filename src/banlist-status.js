module.exports = (card) => {
    let limit = "";
    if(card.tcg || card.custom) {
        limit += card?.exu_limit ?? "3";
    }
    else if(card.ocg) {
        limit += "0 [OCG]";
    }
    else {
        limit += "(unknown)";
    }
    return limit;
};