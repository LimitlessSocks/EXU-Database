const CardViewer = {
    autoSearch: false,
    Database: {
        cards: null,
        cardsIdsByName: null,
    },
    Filters: {
        Dictionary: null,
    },
    Search: {
        pageSize: 30,
        columnWidth: 2,
        pages: null,
        currentPage: null,
        processResults: null,
    },
    Elements: {},
    // methods
    submit: null,
    query: null,
    excludeTcg: true,
    SaveData: {
        local: {},
        KEY: "EXU",
    },
    format: "exu"
};

const isNode = typeof window === "undefined";
if(isNode) {
    window = { DEBUG: false };
}

CardViewer.initCardIdsByName = () => {
    CardViewer.Database.cardsIdsByName = {};
    for(let card of Object.values(CardViewer.Database.cards)) {
        let key = card.name.toLowerCase();
        CardViewer.Database.cardsIdsByName[key] ??= [];
        CardViewer.Database.cardsIdsByName[key].push(card.id);
    }
};
CardViewer.getCardByName = name => {
    if(!CardViewer.Database.cardsIdsByName) {
        CardViewer.initCardIdsByName();
    }
    return CardViewer.Database.cards[
        CardViewer.Database.cardsIdsByName[name.toLowerCase()]?.[0]
    ];
};

CardViewer.getCardLink = card =>
    `https://limitlesssocks.github.io/EXU-Scrape/card?id=${card.id}`;

// some constants
const CATEGORY_RETRAIN = 1;
const CATEGORY_ALT_ART = 2;

CardViewer.SaveData.init = () => {
    let localItem = localStorage.getItem(CardViewer.SaveData.KEY);
    
    CardViewer.SaveData.local = localItem === null ? {} : JSON.parse(localItem);
    CardViewer.SaveData.sync();
};
CardViewer.SaveData.sync = () => {
    localStorage.setItem(CardViewer.SaveData.KEY, JSON.stringify(CardViewer.SaveData.local));
};
CardViewer.SaveData.get = (key) => {
    return CardViewer.SaveData.local[key];
};
CardViewer.SaveData.set = (key, value) => {
    CardViewer.SaveData.local[key] = value;
    CardViewer.SaveData.sync();
};

if(typeof localStorage !== "undefined") {
    CardViewer.SaveData.init();
}

const downloadFile = (content, type = "application/octet-stream", filename = null) => {
    let uri = "data:" + type + "," + encodeURIComponent(content);
    let anchor = $("<a>");
    anchor.attr("href", uri);
    if(filename) {
        anchor.attr("download", filename);
    }
    anchor.get(0).click();
};

const escapeXMLString = (str) =>
    str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const DB_DATE_FORMAT = /(.{4})-(.{2})-(.{2})/; // year-month-day
const EXU_DATE_FORMAT = /(.{2})-(.{2})-(.{4})\.(.{2})\.(.{2})\.(.{2})/; // month-day-year.hour.minute.second
const DISPLAY_DATE_FORMAT = /(.{2})\/(.{2})\/(.{4})/; // month/day/year
const formatDateAdded = (date) => {
    let fmt, year, month, day, hour, minute, second;
    // let action;
    if(fmt = DB_DATE_FORMAT.exec(date)) {
        [, year, month, day] = fmt;
        // action = "Released";
    }
    else if(fmt = EXU_DATE_FORMAT.exec(date)) {
        [, month, day, year, hour, minute, second] = fmt;
        // action = "Integrated";
    }
    else if(fmt = DISPLAY_DATE_FORMAT.exec(date)) {
        [, month, day, year] = fmt;
        // action = null;
    }
    
    let str = month + "/" + day + "/" + year;
    
    // if(!raw && action) {
        // str = action + " " + str;
    // }
    
    return str;
};
const getComparableDate = (date) => {
    let dateString = formatDateAdded(date);
    return new Date(dateString);
};

class Prompt {
    constructor(title, innerFn, buttons, type = null) {
        this.title = title;
        if(typeof innerFn !== "function") {
            let oldInnerFn = innerFn;
            innerFn = () => oldInnerFn;
        }
        this.innerFn = innerFn;
        this.buttons = buttons;
        this.type = type;
    }
    
    deploy() {
        this.anchor = $("<div>").addClass("popup-background");
        
        this.anchor.click(e => {
            const popupBackground = this.anchor.get(0);
            if(e.target == popupBackground) {
                this.close(true);
            }
            // console.log(e.target);
        });
        let inner = this.innerFn(this) || $("");
        let buttonEls = this.buttons.map(text => $("<button>").text(text));
        inner = $("<div class=popup-inner>").append(
            $("<h2 class=popup-title>").text(this.title),
            inner,
            $("<div>").append(buttonEls),
        );
        if(this.type !== null) {
            inner.addClass(this.type);
        }
        this.anchor.append(inner);
        return new Promise((resolve, reject) => {
            this.reject = reject;
            let i = 0;
            for(let button of buttonEls) {
                let v = i;
                button.click(() => {
                    resolve([v, this]);
                    this.close();
                });
                i++;
            }
            $("body").append(this.anchor);
        });
    }
    
    close(reject = false) {
        if(this.anchor) {
            this.anchor.remove();
        }
        if(reject && this.reject) {
            this.reject();
        }
    }
    
    static OK(title) {
        return new Prompt(title, null, ["OK"], "small");
    }
};

const CardsOfTheWeek = [
    1117429, //Battlewasp - Akiza the Berserker
    1175945, //ON SALE!!!
    1222148, //Called by the Spell Book
    // 1000049, //Little Tanker
    // 1411709, //Gradielle, Symphony of Harmony
    // 1069476, //Elon Musk 1
    // 1331629, //Elon Musk 2
    1482984, //Wingbeat Wyrm (Elon Musk 3)
    1311654, //Torrential Fusion
    // 1079215, //Grasp
    1298826, //Eye of the Shadows
    1333641, //Chained Down
    1061760, //Sacrificial Soul Reborn
    1393301, //Cosmic Vacuum
    1374705, //Bone Chimera
    // 1268592, //Max Evolution Pill
    1537818, //Destoroyah, the One True Devil
    1526913, //Spellbook of Forbidden Arts
    930975,  //Equip Equality
    // 1471876, //Flimsy Shot
    1537498, //Ghost Wind & Bright Mist
    1818903, //Ghost Wheel & Floating Lantern
    1818868, //Caltrops
    1409651, //Underwhelming Observations
    1473788, //Malformed Test Subject
    1558753, //Charismatic Priestess
    1644436, //Solar Flare
    1649242, //Mokey Mokey Shadow
    747487,  //Reset!
    1765725, //Number 108: Divine Wind Dragon
    1805896, //Localized Tornado Dragon
    1736029, //Lost Wind's Cyclone
    1409993, //Localized Typhoon
    1951637, //Half-Exchanged Spirit
    1956938, //Shattered Heart
    1770162, //Number 129: Lost Chained Dragon
    1731724, //Artifact Teiws
    1642313, //Rooftop Inu
    1551870, //Exquisite Knowledge
    1638767, //Abyss Insurgent
    1599951, //Spawn of Exile
];

const OTKTools = [
    1547701, //1,000 Sun Sword
    1000049, //Little Tanker
    956234,  //Zeredia, the Spellswordswoman
    1358152, //The Green Lion
    1372934, //Tanegashima
    1479910, //Swift Archer Lumis
    1061760, //Sacrificial Soul Reborn
    1129090, //Psykid
    1067731, //Piping Hot Pink Overheatin'
    1532800, //Modernote Icon - Waterflame
    1499399, //Modernote Freshbeat
    982826,  //Aerosmith
    472990,  //Akali, the Rhino
    1485923, //Cozmo Lord, The Ultimate Lifeform
    1089148, //Damia, Sage of Stone
    928560,  //Doom Emperor Dragon
    1533268, //Itayin Herald
    1479932, //Painted Soulseaker
    1025602, //Sword Savior Salizar
    1579988, //Dark Cynet Virus Draco
    1264227, //Libradurgon
    1551912, //Sinbad the Legend
];

const Searchers = [
    1318582, //Withering Cocoon
    1318359, //Petit Cocoon
];

const Removal = [
    1644436, //Solar Flare

]

const DrawCards = [
    // 1573678, //Aurellia Conversion
    // 159726,  //Consistency Potion
];

const HandTraps = [
    1481211, //Amorel Rachel
    1661909, //Child of the Forlorn Clouds
    1473788, //Malformed Test Subject
    1343784, //Mermaidol Maiden
    1585405, //Scripture Golem
    1704232, //Sojourned Alchemist
    1494123, //Clever Forte & West's Viola
    1357705, //D.D. Crane
    1537498, //Ghost Wind & Bright Mist
    1565554, //Two Tuners' Lampoon
    1671524, //Aromaseraphy Ginkgo
    1349617, //Faergon, Watcher of the Forest
    1372900, //Kazu Geiko
    1372884, //Kufu Geiko
    1372872, //Mitori Geiko
    1473822, //Sunvine Maiden
];

const CardGroups = {
    cotw: {
        name: "Cards of the Week",
        data: CardsOfTheWeek,
    },
    otk: {
        name: "OTK Tools",
        data: OTKTools,
    },
    handtraps: {
        name: "Handtraps",
        data: HandTraps,
    },
};
for(let [key, value] of Object.entries(CardGroups)) {
    value.id = key;
}

const RetrainMap = {
    2487668: 10503,     //Simorgh, Bird of Miracles -> Simorgh, Bird of Sovereignty
    2014209: 5576,      //Cryotitan the Elemental Lord -> Moulinglacia the Elemental Lord
    1920888: 3724,      //Scrap Turbo -> Scrap Recycler
    1999194: 6534,      //El Shaddoll Winlao -> El Shaddoll Winda
    2231144: 10606,     //Cryptocode Talker -> Accesscode Talker
    2242028: 10606,     //Backcode Talker -> Accesscode Talker
    2218012: 9074,      //Noble Knight Lefay -> Isolde, Two Tales of the Noble Knights
    1976423: 9633,      //The Phantom Knights of Forgotten Brigade -> The Phantom Knights of Rusty Bardiche
    1566623: 1566623,   //EX-Saber Gottoms -> EX-Saber Gottoms
    1717113: 11170,     //Glimmering Drytronis -> Meteonis Drytron
    2092739: 11170,     //Radiant Drytronis -> Meteonis Drytron
    797597: 2382,       //Kaiser Arena -> Kaiser Colosseum
    2511764: 10698,     //Eldlixir of Golden Convergence -> Eldlixir of Scarlet Sanguine
    1961738: 8521,      //True King's Diagram -> Dragonic Diagram
    1985232: 2219,      //Blazing Aura -> Imperial Order
    1966485: 7817,      //Ledger of Demise -> Card of Demise
    2533677: 8825,      //Sengen Taisha -> Amano-Iwato
    2050037: 5788,      //Majestic Ivory Chaoserpent -> White Dragon Wyverburster
    1793538: 6697,      //Masked HERO Dusk Law -> Masked HERO Dark Law
    // 1731744: 10510,     //Artifact Ame-No-Nuboku -> Artifact Dagda
    1653369: 3057,      //Naturia Baihu -> Naturia Beast
    1638076: 5684,      //Horror of the Depths -> Abyss Dweller
    1319245: 5167,      //Lavalval Shadow -> Lavalval Chain
    2350096: 5570,      //Madolche Queen Crownnoli -> Madolche Queen Tiaramisu
    1708820: 10958,     //Numeron Extraction -> Numeron Calling
    2529570: 9192,      //Never Surrender! -> Red Reboot
    1318485: 3688,      //Ambush Lotus -> Samsara Lotus
    1619088: 1602,      //Fishborg Defender -> Fishborg Blaster
    1743438: 5844,      //Spellbook of Silencing -> Spellbook of Judgment
    1865422: 7489,      //Majespecter Dragon - Ryu -> Majespecter Unicorn - Kirin
    1318550: 2694,      //Reynard Chemist -> Magical Scientist
    1862633: 8514,      //True King of Dimension's End -> True King of All Calamities
    1768966: 9070,      //Hieratic Dragon of Khonsu -> Hieratic Seal of the Heavenly Spheres
    2021204: 8118,      //Cyber Angel Benzaiten -> Cyber Angel Benten
    1951635: 1951635,   //Penultimate Offering -> Penultimate Offering
    1319058: 589,       //Resurrected Blade of Elma -> Butterfly Dagger - Elma
    1638270: 1752,      //Shien's Will -> Gateway of the Six
    2078157: 8865,      //Imposing Attraction -> Metaverse
    2242234: 949,       //Aether Faisy -> Dandylion
    1318524: 3307,      //Phoenixian Cluster Hippeastrum -> Phoenixian Cluster Amaryllis
    2020789: 10500,     //Union Conductor -> Union Carrier
    1933842: 11089,     //Dreadful Arsenal ZZ-ARES - Abyssal Flames
    2543585: 9082,      //Crystron Vermeridhogg -> Crystron Halqifibrax
};

const LINK_ARROWS = {
    [0b10000000]: "\u2196\uFE0F",
    [0b01000000]: "\u2B06\uFE0F",
    [0b00100000]: "\u2197\uFE0F",
    [0b00010000]: "\u27A1\uFE0F",
    [0b00001000]: "\u2198\uFE0F",
    [0b00000100]: "\u2B07\uFE0F",
    [0b00000010]: "\u2199\uFE0F",
    [0b00000001]: "\u2B05\uFE0F",
};

// CardViewer.Database.banlist = Banlist;

CardViewer.Database.setInitial = function (db) {
    CardViewer.Database.cards = db;
};
CardViewer.Database.initialReadAll = async function (...names) {
    let promises = names
        .filter(name => name !== null)
        .map(name => fetch(name).then(response => response.json()));
    
    let dbs = await Promise.all(promises);
    
    let db = dbs.reduce((acc, next) => Object.assign(acc, next), {});
    CardViewer.Database.setInitial(db);
};

// helper function methods
const _F = {
    propda: (prop) => (obj) => obj[prop],
    id: x => x,
    sortBy: (list, ...fns) =>
        list.map(e => [e, fns.map(fn => fn(e))])
            .sort(([l, lcs], [r, rcs]) =>
                lcs.map((lc, i) => {
                    rc = rcs[i];
                    return (lc > rc) - (lc < rc);
                }).find(x => x) || 0
            )
            .map(([e, ec]) => e),
    // more accurate, but more expensive
    sortByLocale: (list, ...fns) =>
        list.map(e => [e, fns.map(fn => fn(e))])
            .sort(([l, lcs], [r, rcs]) =>
                lcs.map((lc, i) => {
                    rc = rcs[i];
                    if(typeof lc === "string" && typeof rc === "string") {
                        return lc.localeCompare(rc, undefined, { numeric: true, sensitivity: "base" });
                    }
                    else {
                        return (lc > rc) - (lc < rc);
                    }
                }).find(x => x) || 0
            )
            .map(([e, ec]) => e),
    compose: (...fns) =>
        (...args) =>
            fns.slice(0, -1).reduceRight((acc, f) => f(acc), fns[fns.length-1](...args)),
};

// CardViewer.Search
CardViewer.Search.processResults = function (val) {
    CardViewer.Search.pages = [];
    let res = val.slice();
    while(res.length) {
        let page = res.splice(0, CardViewer.Search.pageSize);
        CardViewer.Search.pages.push(page);
    }
    if(CardViewer.Elements.pageCount) {
        CardViewer.Elements.pageCount.text(CardViewer.Search.pages.length);
    }
};

CardViewer.Search.config = {
    sortByProperty: "name",
    reverseSearch: "ascending",
};

CardViewer.Search.showPage = function (id = CardViewer.Search.currentPage, config = CardViewer.Search.config) {
    let target = config.target || CardViewer.Elements.results;
    if(!config.append) {
        target.empty();
    }
    if(id < 0 || id >= CardViewer.Search.pages.length) {
        return;
    }
    
    let page = CardViewer.Search.pages[id];
    
    if(config.sort) {
        page = config.sort(page);
    }
    
    if(config.append || config.noTable) {
        page.forEach((result, i, arr) => {
            let composed = CardViewer.composeStrategy(result);
            if(config.transform) {
                composed = config.transform(composed, result);
            }
            target.append(composed);
        });
    }
    else {
        let table = $("<table class=pagetable>");
        let row = [];
        page.forEach((result, i, arr) => {
            let composed = CardViewer.composeStrategy(result);
            row.push(composed);
            if(row.length === CardViewer.Search.columnWidth || i + 1 === arr.length) {
                let tr = $("<tr>");
                for(let c of row) {
                    tr.append($("<td>").append(c));
                }
                table.append(tr);
                row = [];
            }
        });
        target.append(table);
    }
    
    // humans measure in 1-based indices
    if(CardViewer.Elements.currentPage) {
        CardViewer.Elements.currentPage.text(id + 1);
    }
};

CardViewer.Search.nextPage = function () {
    if(CardViewer.Search.currentPage + 1 === CardViewer.Search.pages.length) {
        return;
    }
    CardViewer.Search.currentPage++;
    CardViewer.Search.showPage();
};

CardViewer.Search.previousPage = function () {
    if(CardViewer.Search.currentPage === 0) {
        return;
    }
    CardViewer.Search.currentPage--;
    CardViewer.Search.showPage();
};

// CardViewer.Filters
CardViewer.Filters.isMonster = (card) =>
    card.card_type === "Monster";
CardViewer.Filters.isSpell = (card) =>
    card.card_type === "Spell";
CardViewer.Filters.isTrap = (card) =>
    card.card_type === "Trap";

CardViewer.Filters.monsterColorIs = (color) => (card) =>
    card.monster_color === color;

CardViewer.Filters.isLeveled = (card) =>
    CardViewer.Filters.isMonster(card) &&
    card.monster_color !== "Xyz" &&
    card.monster_color !== "Link";

let extraDeckColors = ["Fusion", "Synchro", "Xyz", "Link"];
CardViewer.Filters.isExtraDeck = (card) =>
    CardViewer.Filters.isMonster(card) &&
    extraDeckColors.some(color => card.monster_color === color);
CardViewer.Filters.isMainDeck = (card) =>
    CardViewer.Filters.isMonster(card) &&
    !CardViewer.Filters.isExtraDeck(card);



CardViewer.Filters.isNormal = CardViewer.Filters.monsterColorIs("Normal");
// CardViewer.Filters.isEffect = (card) => !CardViewer.Filters.isNonEffect(card);
CardViewer.Filters.isEffect = CardViewer.Filters.monsterColorIs("Effect");
CardViewer.Filters.isRitual = CardViewer.Filters.monsterColorIs("Ritual");
CardViewer.Filters.isFusion = CardViewer.Filters.monsterColorIs("Fusion");
CardViewer.Filters.isSynchro = CardViewer.Filters.monsterColorIs("Synchro");
CardViewer.Filters.isXyz = CardViewer.Filters.monsterColorIs("Xyz");
CardViewer.Filters.isLink = CardViewer.Filters.monsterColorIs("Link");

CardViewer.Filters.isNonEffect = (card) => {
    if(!CardViewer.Filters.isMonster(card)) {
        return card.cached_is_non_effect = false;
    }
    
    if(typeof card.cached_is_non_effect !== "undefined") {
        return card.cached_is_non_effect;
    }
    
    if(CardViewer.Filters.isNormal(card)) {
        return card.cached_is_non_effect = true;
    }
    
    if(CardViewer.Filters.isRitual(card)) {
        let sentences = card.effect
            .replace(/[“"”].+?[“"”]/g, "")
            .replace(/\.$/g, "")
            .split(".");
        
        return card.cached_is_non_effect = sentences.length === 1;
    }
    
    if(CardViewer.Filters.isExtraDeck(card)) {
        let parsed = card.effect
            .replace(/\(.+?\)/g, "")
            .replace(/[“"”].+?[“"”]/g, "")
        let paras = parsed.trim().split(/\r?\n|\r/g);
        let sentences = parsed.split(".");
        let isNonEffect = paras.length === 1 && sentences.length === 1;
        return card.cached_is_non_effect = isNonEffect;
    }
    
    return card.cached_is_non_effect = false;
}

CardViewer.initializeByName = () => {
    if(CardViewer.Database.byName) {
        return;
    }
    CardViewer.Database.byName = {};
    
    for(let card of Object.values(CardViewer.Database.cards)) {
        CardViewer.Database.byName[card.name] = card;
    }
};

CardViewer.listArchetypes = () => {
    CardViewer.initializeByName();
    
    let archetypes = new Set();
    
    for(let card of Object.values(CardViewer.Database.cards)) {
        if(card.tcg || card.ocg || CardViewer.Filters.isNormal(card)) {
            continue;
        }
        for(let [match, g1] of card.effect.matchAll(/"([^"]*?[^\s"])(?:\(s\))?"/g)) {
            // exclude card names
            g1 = g1.trim();
            if(!CardViewer.Database.byName[g1] && g1.indexOf("Token") === -1) {
                archetypes.add(g1);
            }
        }
    }
    
    return [...archetypes].sort();
};

CardViewer.listDeckSources = () =>
    [...new Set(
        CardViewer.Search
            .pages.flat()
            .map(e => e.submission_source)
    )];

CardViewer.formatDeckSources = () =>
    CardViewer.listDeckSources().map(
        sourceId => `${sourceId} - \n${
            CardViewer.Search
                .pages.flat()
                .filter(e => e.submission_source == sourceId)
                .map(e => "  " + JSON.stringify(e.name) + ` (${e.id})`)
                .join("\n")
            }`
    ).join("\n\n");


CardViewer.Filters.isFlipMonster = (card) =>
    card.effect.indexOf("FLIP:") !== -1;

CardViewer.Filters.isUnionMonster = (card) =>
    card.ability?.includes("Union");
CardViewer.Filters.isTunerMonster = (card) =>
    card.ability?.includes("Tuner");
CardViewer.Filters.isToonMonster = (card) =>
    card.ability?.includes("Toon");
CardViewer.Filters.isGeminiMonster = (card) =>
    card.ability?.includes("Gemini");
CardViewer.Filters.isSpiritMonster = (card) =>
    card.ability?.includes("Spirit");
    
CardViewer.Filters.isAtkOrDef = (atkDefVal) => (card) =>
    card.atk == atkDefVal || (!CardViewer.Filters.isLink && card.def == atkDefVal);

CardViewer.Filters.Dictionary = {
    monster:    CardViewer.Filters.isMonster,
    spell:      CardViewer.Filters.isSpell,
    trap:       CardViewer.Filters.isTrap,
    normal:     CardViewer.Filters.isNormal,
    effect:     CardViewer.Filters.isEffect,
    ritual:     CardViewer.Filters.isRitual,
    fusion:     CardViewer.Filters.isFusion,
    synchro:    CardViewer.Filters.isSynchro,
    xyz:        CardViewer.Filters.isXyz,
    pendulum:   _F.propda("pendulum"),
    link:       CardViewer.Filters.isLink,
    // link:       _F.propda("is_link"),
    leveled:    CardViewer.Filters.isLeveled,
    extradeck:  CardViewer.Filters.isExtraDeck,
    maindeck:   CardViewer.Filters.isMainDeck,
    noneffect:  CardViewer.Filters.isNonEffect,
    gemini:     CardViewer.Filters.isGeminiMonster,
    flip:       CardViewer.Filters.isFlipMonster,
    spirit:     CardViewer.Filters.isSpiritMonster,
    tuner:      CardViewer.Filters.isTunerMonster,
    toon:       CardViewer.Filters.isToonMonster,
    union:      CardViewer.Filters.isUnionMonster,
    qq:         CardViewer.Filters.isAtkOrDef("?"),
    any:        () => true,
};

CardViewer.Filters.getFilter = (key) =>
    CardViewer.Filters.Dictionary[key] || CardViewer.Filters.Dictionary.any;

CardViewer.showImported = false;

CardViewer.query = function () {
    let baseStats = {
        name:         CardViewer.Elements.cardName.val(),
        effect:       CardViewer.Elements.cardDescription.val(),
        type:         CardViewer.Elements.cardType.val(),
        limit:        CardViewer.Elements.cardLimit.val(),
        id:           CardViewer.Elements.cardId.val(),
        author:       CardViewer.Elements.cardAuthor.val(),
        category:     CardViewer.Elements.cardCategory.val(),
        visibility:   CardViewer.Elements.cardVisibility.val(),
        imported:     false,
        notImported:  false,
        alsoImported: CardViewer.showImported
    };
    let extraVisibility = [];
    if(CardViewer.format) {
        baseStats[CardViewer.format] = true;
    }
    if(CardViewer.Elements.searchSortBy) {
        baseStats.sortBy = CardViewer.Elements.searchSortBy.val();
    }
    if(CardViewer.Elements.searchSortOrder) {
        baseStats.sortOrder = CardViewer.Elements.searchSortOrder.val();
    }
    if(CardViewer.Elements.includeCustoms && CardViewer.Elements.includeYcg) {
        let useCustoms = CardViewer.Elements.includeCustoms.prop("checked")
        let useYcg = CardViewer.Elements.includeYcg.prop("checked")
        if(!useCustoms || !useYcg) {
            baseStats.visibility = [ baseStats.visibility ];
        }
        if(!useYcg) {
            baseStats.visibility.push(-6);
        }
        if(!useCustoms) {
            baseStats.visibility.push(-5);
        }
    }
    if(CardViewer.Elements.cardIsNotNormal) {
        baseStats.notNormal = CardViewer.Elements.cardIsNotNormal.is(":checked");
    }
    if(CardViewer.Elements.spellStats.is(":visible")) {
        baseStats.kind = CardViewer.Elements.cardSpellKind.val();
    }
    else if(CardViewer.Elements.trapStats.is(":visible")) {
        baseStats.kind = CardViewer.Elements.cardTrapKind.val();
    }
    else if(CardViewer.Elements.monsterStats.is(":visible")) {
        baseStats.monsterType = CardViewer.Elements.cardMonsterType.val();
        baseStats.monsterAttribute = CardViewer.Elements.cardMonsterAttribute.val();
        baseStats.monsterCategory = CardViewer.Elements.cardMonsterCategory.val();
        baseStats.monsterAbility = CardViewer.Elements.cardMonsterAbility.val();
        baseStats.level = CardViewer.Elements.cardLevel.val();
        baseStats.atk = CardViewer.Elements.cardATK.val();
        baseStats.def = CardViewer.Elements.cardDEF.val();
        baseStats.levelCompare = CardViewer.Elements.cardLevelCompare.val();
        baseStats.atkCompare = CardViewer.Elements.cardATKCompare.val();
        baseStats.defCompare = CardViewer.Elements.cardDEFCompare.val();
        baseStats.exactArrows = false;
        baseStats.arrowMask = null;
        
        // arrows
        if(baseStats.monsterCategory === "link") {
            let mask = 0;
            let i = 0;
            for(let el of $(".arrow-button")) {
                if(el.classList.contains("toggled")) {
                    if(el.id === "equals") {
                        baseStats.exactArrows = true;
                    }
                    else {
                        mask |= flatArrow[i];
                    }
                }
                i++;
            }
            mask = mask.toString(2).padStart(8, "0");
            baseStats.arrowMask = mask;
        }
    }
    return baseStats;
};

CardViewer.caseSensitive = false;
CardViewer.simplifyText = (text) =>
    text.toLowerCase();

CardViewer.textComparator = (needle, fn = _F.id) => {
    if(!needle) {
        return () => true;
    }
    let simplified = CardViewer.simplifyText(needle);
    return (card) => {
        let f = fn(card);
        if(f === null || f === undefined) {
            return false;
        }
        return CardViewer.caseSensitive
            ? f.toString().includes(needle)
            : CardViewer.simplifyText(f.toString()).includes(simplified);
    }
};
const escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractInlineRegexes = function * (str) {
    let build = "";
    let readingRegex = false;
    
    for(let i = 0; i < str.length; i++) {
        let ch = str[i];
        if(ch === "[") {
            readingRegex = true;
        }
        else if(ch === "]") {
            yield build + ch;
            build = "";
            readingRegex = false;
        }
        if(!readingRegex) continue;
        build += ch;
        if(ch === "\\") {
            build += str[++i];
        }
    }
};

CardViewer.regexComparator = (needle, fn = _F.id) => {
    if(!needle) {
        return () => true;
    }
    
    let accept = [];
    let reject = [];
    let caselessAccept = [];
    let caselessReject = [];
    
    for(let regStr of extractInlineRegexes(needle)) {
        let [whole, tag, regInner] = regStr.trim().match(/^\[(.+?\|)?(.+)\]$/);
        let flag = "i";
        // case sensitive
        if(/^[cs]/i.test(tag)) {
            flag = "";
        }
        let reg = new RegExp(regInner, flag);
        let caselessReg = new RegExp(regInner, flag.replace("i", ""));
        if(/^[ner]/i.test(tag)) {
            reject.push(reg);
            caselessReject.push(caselessReg);
        }
        else {
            accept.push(reg);
            caselessAccept.push(caselessReg);
        }
        needle = needle.replace(regStr, "");
    }
    
    needle = escapeRegExp(needle)
        .replace(/\\\^/g, "^\\s*")
        .replace(/\\\$/g, "\\s*$")
        .replace(/(?:\\\*){2}/g, "[^.]*?")
        .replace(/\\\*/g, ".*?");
    
    let reg = new RegExp(needle, "i");
    let caselessReg = new RegExp(needle, "");
    accept.push(reg);
    caselessAccept.push(caselessReg);
    
    return (card) =>
        CardViewer.caseSensitive
            ? caselessAccept.every(reg => reg.test(fn(card)))
              && !caselessReject.some(reg => reg.test(fn(card)))
              
            : accept.every(reg => reg.test(fn(card)))
              && !reject.some(reg => reg.test(fn(card)));
};
CardViewer.textAnyComparator = (needle, fn = _F.id) =>
    needle === "any" ? () => true : CardViewer.textComparator(needle, fn);

CardViewer.boolExclusiveComparator = (needle, fn = _F.id) =>
    (card) => needle ? fn(card) : true;

CardViewer.boolExactComparator = (needle, fn = _F.id) =>
    (card) => !!fn(card) == !!needle;

CardViewer.exactComparator = (needle, fn = _F.id) => {
    return (card) =>
        fn(card) === needle;
};
CardViewer.equalAnyComparator = (needle, fn = _F.id) => {
    return needle === "any" || !needle
        ? () => true
        : (card) => fn(card) == needle;
};

CardViewer.COMPARES = {
    equal:          (a, b) => a == b,
    unequal:        (a, b) => a != b,
    lessequal:      (a, b) => a <= b,
    less:           (a, b) => a <  b,
    greaterequal:   (a, b) => a >= b,
    greater:        (a, b) => a >  b,
    choice:         (a, bs) => bs.some(b => a == b),
}
CardViewer.comparingComparator = (needle, compareString, fn = _F.id) => {
    let cmp = CardViewer.COMPARES[compareString];
    // console.log(needle, compareString, cmp);
    if(compareString === "choice") {
        needle = needle.toString().split(/[,\s]\s*/)
            .map(e => parseInt(e, 10));
    }
    else if(typeof needle === "string") {
        needle = parseInt(needle, 10);
    }
    // let once = true;
    return (card) => {
        // if(once){
            // once=false;
            // console.log(fn(card), needle, cmp(fn(card), needle));
        // }
        return cmp(fn(card), needle);
    }
};

CardViewer.or = (...fns) => (...args) => fns.some(fn => fn(...args));

CardViewer.getLimitProperty = () => `${CardViewer.format}_limit`;

const checkVisibility = (card, visibility) =>
    Array.isArray(visibility)
        ? visibility.every(vis => checkVisibility(card, vis))
        : visibility === "any" || !visibility
            ? true
            : visibility < 0
                ? !checkVisibility(card, -visibility)
                : visibility == 1 || visibility == 2
                    ? card.custom == visibility
                    : visibility == 3
                        ? card.tcg && !card.ocg
                        : visibility == 4
                            ? card.ocg && !card.tcg
                            : visibility == 5
                                ? card.custom
                                : card.ocg || card.tcg;

CardViewer.createFilter = function (query, exclude = null) {
    if(exclude) {
        exclude = CardViewer.createFilter(exclude);
    }
    if(typeof query === "function") {
        if(exclude) {
            return (...args) => query(...args) && !exclude(args);
        }
        else {
            return query;
        }
    }
    // console.log(query);
    let limitProperty = CardViewer.getLimitProperty();
    let filters = [
        // type filter
        CardViewer.Filters.getFilter(query.type),
        // name filter
        CardViewer.or(
            CardViewer.regexComparator(query.name, _F.propda("name")),
            CardViewer.regexComparator(query.name, _F.propda("also_archetype")),
            CardViewer.exactComparator(query.name, _F.propda("serial_number")),
        ),
        // id filter
        CardViewer.textComparator(query.id, _F.propda("id")),
        // effect filter
        CardViewer.or(
            CardViewer.regexComparator(query.effect, _F.propda("effect")),
            CardViewer.regexComparator(query.effect, _F.propda("pendulum_effect")),
        ),
        // author filter
        CardViewer.textComparator(query.author, _F.propda("username")),
        // limit filter
        // CardViewer.textAnyComparator(query.limit, _F.propda(CardViewer.getLimitProperty())),
        // cards are at 3 unless otherwise specified
        CardViewer.equalAnyComparator(query.limit, card => card[limitProperty] ?? 3),
        // category filter
        (card) =>
            query.category === "any" || !query.category
                ? true
                : query.category == 1
                    ? card.exu_retrain
                    : query.category == 2
                        ? card.alt_art
                        : true,
        // // retrain filter
        // CardViewer.boolExclusiveComparator(query.retrain, _F.propda("exu_retrain")),
        // visibility filter
        // CardViewer.textAnyComparator(query.visibility, _F.propda("custom")),
        (card) => checkVisibility(card, query.visibility),
    ];
    /*
    // import filters
    // console.log(query, !query.alsoImported);
    if(!query.alsoImported) {
        filters.push(
            // import filter
            CardViewer.boolExactComparator(query.imported, _F.propda("exu_import")),
            // not imported filter
            CardViewer.boolExactComparator(query.notImported, _F.propda("exu_ban_import")),
        );
    }
    */
    
    if(query.main_effect) {
        filters.push(CardViewer.regexComparator(query.main_effect, _F.propda("effect")));
    }
    if(query.pend_effect) {
        filters.push(CardViewer.regexComparator(query.pend_effect, _F.propda("pendulum_effect")));
    }
    
    if(query.notNormal) {
        filters.push((card) => !CardViewer.Filters.isNormal(card));
    }
    if(query.sff) {
        filters.push((card) => card.sff_limit >= 0);
    }
    
    if(query.kind) {
        filters.push(CardViewer.exactComparator(query.kind, _F.propda("type")));
    }
    
    if(query.monsterType) {
        filters.push(CardViewer.exactComparator(query.monsterType, _F.propda("type")));
    }
    
    if(query.monsterAttribute) {
        filters.push(CardViewer.exactComparator(query.monsterAttribute, _F.propda("attribute")));
    }
    
    if(query.monsterCategory) {
        filters.push(CardViewer.Filters.getFilter(query.monsterCategory));
    }
    
    if(query.monsterAbility) {
        filters.push(CardViewer.Filters.getFilter(query.monsterAbility));
    }
    
    if(query.arrowMask) {
        let nArrowMask = parseInt(query.arrowMask, 2);
        filters.push(
            query.exactArrows
                ? CardViewer.exactComparator(query.arrowMask, _F.propda("arrows"))
                : (card) => (parseInt(card.arrows, 2) & nArrowMask) === nArrowMask
        );
        // console.log(query.arrowMask, query.exactArrows);
    }
    
    if(query.level) {
        let level = parseInt(query.level, 10);
        if(!Number.isNaN(level)) {
            filters.push(CardViewer.comparingComparator(
                level,
                query.levelCompare || "equal",
                _F.propda("level")
            ));
        }
    }
    
    if(query.attributeCount) {
        let attributeCount = parseInt(query.attributeCount, 10);
        if(!Number.isNaN(attributeCount)) {
            filters.push(CardViewer.comparingComparator(
                attributeCount,
                query.attributeCountCompare || "equal",
                _F.propda("attribute_count")
            ));
        }
    }
    
    if(query.typeCount) {
        let typeCount = parseInt(query.typeCount, 10);
        if(!Number.isNaN(typeCount)) {
            filters.push(CardViewer.comparingComparator(
                typeCount,
                query.typeCountCompare || "equal",
                _F.propda("type_count")
            ));
        }
    }
    
    if(query.atk) {
        filters.push(CardViewer.comparingComparator(
            query.atk,
            query.atkCompare || "equal",
            _F.propda("atk")
        ));
    }
    else if(query.atkCompare === "question") {
        filters.push(CardViewer.exactComparator("?", _F.propda("atk")));
    }
    
    if(query.def) {
        filters.push(CardViewer.comparingComparator(
            query.def,
            query.defCompare || "equal",
            _F.propda("def")
        ));
    }
    else if(query.defCompare === "question") {
        filters.push((card) =>
            card.def == "?" && !CardViewer.Filters.isLink(card)
        );
        // filters.push(CardViewer.exactComparator("?", _F.propda("def")));
    }
    // query restrictions
    if(query.sortBy === "def") {
        filters.push((card) => card.def != "?" && !CardViewer.Filters.isLink(card));
    }
    
    if(query.customExpression) {
        if(typeof Flowo !== "undefined" && Flowo) {
            // let variables = Object.assign({}, card);
            filters.push((card) => {
                if(!card.flowoCache) {
                    card.flowoCache = {
                        card_type: card.card_type,
                    };
                    if(card.card_type === "Monster") {
                        card.flowoCache.atk = parseInt(card.atk);
                        card.flowoCache.def = parseInt(card.def);
                        card.flowoCache.level = card.level;
                    }
                }
                let result = Flowo.exec(
                    query.customExpression,
                    { variables: card.flowoCache }
                )
                return result;
            });
        }
        else {
            console.error("Flowo is not enabled here");
        }
    }
    
    if(query.date) {
        let isSimpleYear = /^\d{4}/.test(query.date);
        let dateValue;
        if(!isSimpleYear) {
            let [ whole, month, day, year ] = query.date.match(/(\d+)\/(\d+)\/(\d+)/);
            dateValue = new Date(year, month, day);
        }
        const longDateRegex = /^(\d+)-(\d+)-(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        filters.push((card) => {
            if(!card.dateValue) {
                if(longDateRegex.test(card.date)) {
                    // console.log(card.date);
                    let [ whole, month, day, year, ...rest ] = card.date.match(longDateRegex);
                    card.dateValue = new Date(year, month, day);
                }
                else if(card.date || card.updated) {
                    let date = card.date || card.updated;
                    let [ whole, year, month, day ] = date.match(/(\d+)-(\d+)-(\d+)/);
                    card.dateValue = new Date(year, month, day);
                }
                else {
                    card.dateValue = null;
                }
            }
            if(!card.dateValue) {
                return false;
            }
            let cmp = CardViewer.COMPARES[query.dateCompare || "equal"];
            if(isSimpleYear) {
                return cmp(card.dateValue.getFullYear(), query.date);
            }
            else {
                return cmp(card.dateValue.getTime(), dateValue.getTime());
            }
        });
    }
    
    // console.log(filters);
    if(window.DEBUG) {
        return (card) => filters.map(f => [f, f(card)]);
    }
    let filter = (card) => filters.every(filter => filter(card));
    if(exclude) {
        return (card) => filter(card) && !exclude(card);
    }
    
    return filter;
};

const ONE_YEAR_FROM_NOW = Date.now() + 365 * 24 * 60 * 60 * 1000;
const SortByPropertyMap = {
    text: (card) => card.effect.length + (card.pendulum_effect || "").length,
    // add a year from today's date when comparing cards to shove null dated cards to the end
    date: (card) => new Date(card.date ?? ONE_YEAR_FROM_NOW),
};
//SortByIsNumber
const SortByFunction = {
    atk: parseInt,
    def: parseInt,
    level: parseInt,
    date: getComparableDate,
};
CardViewer.filter = function (query, exclude = null) {
    CardViewer.caseSensitive = query.caseSensitive;
    // console.log(query, query.caseSensitive, CardViewer.caseSensitive);
    let filter = CardViewer.createFilter(query, exclude);
    // console.log("query", CardViewer.caseSensitive, query.caseSensitive, filter.caseSensitive);
    let cards = [];
    for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        // if(id == 11086) {
            // console.log(id, card);
            // console.log(query, exclude);
        // }
        if(CardViewer.excludeTcg && (card.tcg || card.ocg)) {
            continue;
        }
        if(card.rush) {
            continue;
        }
        if(filter(card)) {
            cards.push(card);
        }
    }
    
    // console.log("AFTER:", CardViewer.caseSensitive);
    
    let sortByProperty = query.sortBy;
    if(typeof sortByProperty === "undefined") {
        sortByProperty = CardViewer.Search.config.sortByProperty;
    }
    
    let sortOrder = query.sortOrder;
    if(typeof sortOrder === "undefined") {
        sortOrder = CardViewer.Search.config.sortOrder;
    }
    
    if(sortByProperty in SortByPropertyMap) {
        sortByProperty = SortByPropertyMap[sortByProperty];
    }
    let sortFn;
    if(typeof sortByProperty === "function") {
        sortFn = sortByProperty;
    }
    else {
        sortFn = _F.propda(sortByProperty);
        if(SortByFunction[sortByProperty]) {
            sortFn = _F.compose(SortByFunction[sortByProperty], sortFn);
        }
    }
    
    cards = _F.sortBy(cards, sortFn);
    
    switch(sortOrder) {
        case "ascending":
            break;
        case "descending":
            cards.reverse();
            break;
    }
    
    
    return cards;
};

const getResource = (...path) =>
    `https://raw.githubusercontent.com/LimitlessSocks/EXU-Scrape/master/res/${path.join("/")}.png`;

const getAttribute = (attr) =>
    getResource("attribute", attr[0] + attr.slice(1).toLowerCase());

const getStar = (star) =>
    getResource("stars", star);

const getIcon = (icon) =>
    getResource("icon", icon);

const BANLIST_ICONS = {
    0: getIcon("banlist-banned"),
    1: getIcon("banlist-limited"),
    2: getIcon("banlist-semilimited"),
    
    imported: getIcon("banlist-import"),
    notImported: getIcon("banlist-no-import"),
    ocg: getIcon("ocg"),
    altArt: getIcon("alt-art"),
};

let arrowIterateOrder = [
    // top row
    [0b10000000, 0b01000000, 0b00100000],
    // middle row
    [0b00000001, 0b00000000, 0b00010000],
    // bottom row
    [0b00000010, 0b00000100, 0b00001000]
];
let flatArrow = arrowIterateOrder.flat();
const getLinkArrowText = (arrows) => {
    let integer = parseInt(arrows, 2);
    let result = "";
    for(let row of arrowIterateOrder) {
        for(let key of row) {
            if(integer & key) {
                result += LINK_ARROWS[key];
            }
            else {
                result += "\u2B1C";
            }
        }
        result += "\n";
    }
    return result;
};

const setMonsterAttributeIcons = (card, attribute) => {
    if(card.attribute_count > 1) {
        attribute = [ attribute ];
        while(attribute.length < card.attribute_count) {
            attribute.push(attribute[0].clone());
        }
        card.attribute.split("/").forEach((attr, i) => {
            attribute[i].attr("src", getAttribute(attr));
        });
    }
    else if(card.attribute_count === 0) {
        attribute = [];
    }
    else {
        attribute.attr("src", getAttribute(card.attribute));
    }
    
    return attribute;
};

// CardViewer.
CardViewer.composeResultSmall = function (card) {
    card.src = card.src || (
        "https://www.duelingbook.com/images/low-res/" + card.id + ".jpg"
    );
    let img = $("<img class=img-result>")
        .attr("src", card.src)
        .attr("title", card.id);
    let name = $("<h3 class=result-name>").text(card.name);
    let id = $("<h4 class=result-id>").text(card.id);
    let author = $("<h4 class=result-author>").text(card.username);
    
    let res = $("<div class=result>");
    res.attr("id", "card" + card.id);
    res.addClass("small");
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    if(card.exu_ban_import) {
        res.addClass("unimported");
        // console.log(card.name, res);
    }
    
    let isPrivate = card.custom && card.custom > 1;
    
    if(isPrivate) {
        res.addClass("private");
    }
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        res.addClass("pendulum");
    }
    
    // effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    effect = effect.replace(/\r|\r?\n/g, "\n");
    effect = [$("<p>").text(effect).addClass("effect-text")];
    
    let stats = $("<div>");
    
    let attribute = $("<img class=result-attribute>");
    let marking = $("<div class=markings>");
    
    let linkArrows;
    if(card.card_type === "Monster") {
        attribute = setMonsterAttributeIcons(card, attribute);
        let kind = [];
        
        let levelIndicator;
        let star;
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link-";
                break;
            case "Xyz":
                levelIndicator = "Rank ";
                star = "Xyz";
                break;
            default:
                levelIndicator = "Level ";
                star = "Normal";
                break;
        }
        
        if(star) {
            for(let i = 0; i < card.level; i++) {
                marking.append(
                    $("<img class=star>").attr("src", getStar(star))
                );
            }
        }
        else {
            marking.append(levelIndicator + card.level);
        }
        
        kind.push(levelIndicator + card.level);
        kind.push(card.attribute);
        kind.push(card.type);
        
        if(card.ability) {
            kind.push(card.ability);
        }
        
        kind.push(card.monster_color);
        
        if(card.pendulum) {
            kind.push("Pendulum");
        }
        
        kind.push("Monster");
        
        stats.append($("<p>").text(kind.join(" ")));
        
        if(card.monster_color === "Link") {
            stats.append($("<p>").text(`ATK/${card.atk}`));
            linkArrows = $(
                "<p class=link-arrows>" +
                getLinkArrowText(card.arrows).replace(/\n/g,"<br>") +
                "</p>"
            );
        }
        else {
            stats.append($("<p>").text(`ATK/${card.atk} DEF/${card.def}`));
        }
    }
    else {
        attribute.attr("src", getAttribute(card.card_type));
        marking.append($("<img class=cardicon>").attr("src", getIcon(card.type)));
    }
    
    let banMarker = $("<img class=banicon>");
    let importMarker = $("<img class=banicon>");
    if(card.exu_ban_import) {
        importMarker.attr("src", BANLIST_ICONS.notImported);
    }
    else if(card.exu_import) {
        importMarker.attr("src", BANLIST_ICONS.imported);
    }
    else if(!card.custom && !card.tcg && card.ocg) {
        importMarker.addClass("wide");
        importMarker.attr("src", BANLIST_ICONS.ocg);
    }
    else if(card.alt_art) {
        importMarker.attr("src", BANLIST_ICONS.altArt);
    }
    
    let limit = CardViewer.getLimitProperty();
    if(card[limit] !== 3) {
        banMarker.attr("src", BANLIST_ICONS[card[limit]]);
    }
    
    if(importMarker.attr("src")) {
        marking.append($("<div>").append(importMarker));
    }
    if(banMarker.attr("src")) {
        marking.append($("<div>").append(banMarker));
    }
    
    res.append($("<div class=result-inner>").append(name, /*linkArrows, author, stats,*/
        $("<div class=result-img-holder>").append(
            $("<div>").append(img),
            $("<div>").append(attribute, marking),
            // $("<div>").append()
        )
        // $("<table>").append(
            // $("<tr>").append(
                // $("<td class=result-img-holder>").append(img, attribute, marking),
                // $("<td class=result-effect>").append(effect)
            // )
        // )
    ));
    return res;
};

CardViewer.composeResult = function (card) {
    card.src = card.src || (
        "https://www.duelingbook.com/images/low-res/" + card.id + ".jpg"
    );
    let img = $("<img class=img-result>").attr("src", card.src);
    let name = $("<h3 class=result-name>").text(card.name);
    
    let idText = card.id;
    let altText = `(~${card.submission_source})`;
    let id = $("<h4 class=result-id>")
        .contextmenu((e) => {
            e.preventDefault();
            idText = idText === card.id ? altText : card.id;
            id.text(idText);
        })
        .text(idText);
    let author = $("<h4 class=result-author>").text(card.username);
    let dateAdded = $("<h4 class=result-date>");
    if(card.date) {
        let action = card.custom && card.custom > 0 ? "Integrated " : "Released ";
        dateAdded.text(action + formatDateAdded(card.date));
    }
    
    let res = $("<div class=result>");
    res.attr("id", "card" + card.id);
    res.addClass(card.card_type.toLowerCase());
    res.addClass(card.monster_color.toLowerCase());
    
    if(!card.custom) {
        res.addClass("tcg");
    }
    
    let isPrivate = card.custom && card.custom > 1;
    
    if(isPrivate) {
        res.addClass("private");
        name.append($("<i>").text(" (private)"));
    }
    
    let effect = card.effect;
    if(card.pendulum) {
        effect = "Scale = " + card.scale + "\n[Pendulum Effect]\n" + card.pendulum_effect + "\n-----------\n[Monster Effect]\n" + effect;
        res.addClass("pendulum");
    }
    
    let stats = $("<div>");
    
    let attribute = $("<img>");
    let marking = $("<div class=markings>");
    
    let linkArrows;
    if(card.card_type === "Monster") {
        attribute = setMonsterAttributeIcons(card, attribute);
        let kind = [];
        
        let levelIndicator;
        let star;
        switch(card.monster_color) {
            case "Link":
                levelIndicator = "Link-";
                break;
            case "Xyz":
                levelIndicator = "Rank ";
                star = "Xyz";
                break;
            default:
                levelIndicator = "Level ";
                star = "Normal";
                break;
        }
        
        if(star) {
            for(let i = 0; i < card.level; i++) {
                marking.append(
                    $("<img class=star>").attr("src", getStar(star))
                );
            }
        }
        
        kind.push(levelIndicator + card.level);
        kind.push(card.attribute);
        kind.push(card.type);
        
        if(card.ability) {
            kind.push(card.ability);
        }
        
        kind.push(card.monster_color);
        
        if(card.pendulum) {
            kind.push("Pendulum");
        }
        
        kind.push("Monster");
        
        stats.append($("<p>").text(kind.join(" ")));
        
        if(card.monster_color === "Link") {
            stats.append($("<p>").text(`ATK/${card.atk}`));
            linkArrows = $(
                "<p class=link-arrows>" +
                getLinkArrowText(card.arrows).replace(/\n/g,"<br>") +
                "</p>"
            );
        }
        else {
            stats.append($("<p>").text(`ATK/${card.atk} DEF/${card.def}`));
        }
    }
    else {
        attribute.attr("src", getAttribute(card.card_type));
        marking.append($("<img class=cardicon>").attr("src", getIcon(card.type)));
    }
    
    let banMarker = $("<img class=banicon>");
    let importMarker = $("<img class=importicon>");
    if(card.exu_ban_import) {
        importMarker.attr("src", BANLIST_ICONS.notImported);
    }
    else if(card.exu_import) {
        importMarker.attr("src", BANLIST_ICONS.imported);
    }
    else if(card.alt_art) {
        importMarker.attr("src", BANLIST_ICONS.altArt);
    }
    
    if(!card.custom && !card.tcg && card.ocg) {
        importMarker.addClass("wide");
        importMarker.attr("src", BANLIST_ICONS.ocg);
    }
    
    let limit = CardViewer.getLimitProperty();
    if(card[limit] !== 3) {
        banMarker.attr("src", BANLIST_ICONS[card[limit]]);
    }
    
    if(importMarker.attr("src")) {
        marking.append($("<div>").append(importMarker));
    }
    if(banMarker.attr("src")) {
        marking.append($("<div>").append(banMarker));
    }
    
    // effect = effect.split(/\r|\r?\n/).map(para => $("<p>").text(para));
    effect = effect.replace(/\r|\r?\n/g, "\n");
    effect = [$("<p>").text(effect).addClass("effect-text")];
    
    let retrain = RetrainMap[card.id];
    let retrainCard = CardViewer.Database.cards[retrain];
    if(retrain && retrainCard) {
        let retrainText = "Retrain of: " + retrainCard.name;
        // retrainText += " (Id #" + retrain + ")";
        let link = $("<a>").text(retrainText);
        if(CardViewer.linkRetrain) {
            link.attr("href", "#card" + retrain)
        }
        effect.push($("<p class=retrainText>").append($("<i>").append(
            link
        )));
    }
    
    res.append($("<div class=result-inner>").append(id, name, dateAdded, linkArrows, author, stats,
        $("<table>").append(
            $("<tr>").append(
                $("<td class=result-img-holder>").append(img, attribute, marking),
                $("<td class=result-effect>").append(effect)
            )
        )
    ));
    return res;
};

CardViewer.setUpTabSearchSwitching = function () {
    CardViewer.Elements.cardType.change(function () {
        let val = CardViewer.Elements.cardType.val();
        if(val === "spell") {
            CardViewer.Elements.ifMonster.toggle(false);
            CardViewer.Elements.ifTrap.toggle(false);
            CardViewer.Elements.ifSpell.toggle(true);
        }
        else if(val === "trap") {
            CardViewer.Elements.ifMonster.toggle(false);
            CardViewer.Elements.ifSpell.toggle(false);
            CardViewer.Elements.ifTrap.toggle(true);
        }
        else if(val === "monster") {
            CardViewer.Elements.ifTrap.toggle(false);
            CardViewer.Elements.ifSpell.toggle(false);
            CardViewer.Elements.ifMonster.toggle(true);
        }
        else {
            CardViewer.Elements.ifMonster.toggle(false);
            CardViewer.Elements.ifTrap.toggle(false);
            CardViewer.Elements.ifSpell.toggle(false);
        }
        if(CardViewer.Editor) {
            CardViewer.Editor.recalculateView();
        }
    });
    CardViewer.Elements.cardMonsterCategory.change(function () {
        let val = CardViewer.Elements.cardMonsterCategory.val();
        if(val === "link") {
            CardViewer.Elements.ifLink.toggle(true);
        }
        else {
            CardViewer.Elements.ifLink.toggle(false);
        }
    });
    CardViewer.Elements.cardMonsterCategory.change();
    CardViewer.Elements.cardType.change();
};

CardViewer.composeStrategy = CardViewer.composeResult;

CardViewer.demonstrate = function (query) {
    let results = CardViewer.filter(query);
    CardViewer.Search.processResults(results);
    CardViewer.Elements.resultCount.text(results.length);
    CardViewer.Search.currentPage = 0;
    CardViewer.Search.showPage();
};

CardViewer.setUpCompareCompares = function () {
    //TODO:
};

CardViewer.setUpFilterByToggle = function (filterByToggle, filterBy, inner) {
    inner.val("");
    filterByToggle.click(() => {
        filterByToggle.toggleClass("toggled");
        filterBy.find(".toggleable").toggle();
        
        if(filterByToggle.hasClass("toggled")) {
            filterBy.css("width", "70%");
        }
        else {
            filterBy.css("width", "auto");
        }
    });
};

CardViewer.setUpArrowToggle = function () {
    $(".arrow-button").click(function () {
        $(this).toggleClass("toggled");
    });
};

CardViewer.elementChanged = function () {
    if(CardViewer.autoSearch) {
        CardViewer.submit();
    }
};

CardViewer.setUpAllInputs = function () {
    let allInputs = CardViewer.Elements.searchParameters.find("select, input, #linkTable button");
    for(let el of allInputs) {
        $(el).change(CardViewer.elementChanged);
        $(el).keypress((event) => {
            if(event.originalEvent.code === "Enter") {
                CardViewer.submit();
            }
        });
        if(el.tagName === "BUTTON") {
            $(el).click(CardViewer.elementChanged);
        }
    }
    CardViewer.Elements.clearSearch.click(() => {
        for(let el of allInputs) {
            el = $(el);
            if(el.is("select")) {
                el.val(el.children().first().val());
            }
            else if(el.is("input[type=checkbox]")) {
                el.prop("checked", !!el.attr("checked"));
            }
            else {
                el.val("");
            }
        }
        CardViewer.elementChanged();
        CardViewer.Elements.cardType.change();
        CardViewer.Elements.cardMonsterCategory.change();
    });
    return allInputs;
};
CardViewer.firstTime = true;
CardViewer.submit = function () {
    let query;
    if (CardViewer.firstTime) {
        query = card => CardsOfTheWeek.indexOf(card.id) !== -1;
    }
    else {
        query = CardViewer.query();
    }
    // console.log(query);
    CardViewer.demonstrate(query);
    CardViewer.Elements.resultNote.text(CardViewer.firstTime ? "Note: You are currently viewing a curated selection of our cards. Please search again to see all available cards." : "");
    CardViewer.firstTime = false;
};

if(typeof module !== "undefined") {
    module.exports = CardViewer;
}
