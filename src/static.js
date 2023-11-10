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
const arrowIterateOrder = [
    // top row
    [0b10000000, 0b01000000, 0b00100000],
    // middle row
    [0b00000001, 0b00000000, 0b00010000],
    // bottom row
    [0b00000010, 0b00000100, 0b00001000]
];

const BLS = ":black_large_square:";

const getLinkArrowText = (arrows) => {
    let integer = parseInt(arrows, 2);
    let result = "";
    for(let row of arrowIterateOrder) {
        let rowString = "";
        for(let key of row) {
            if(integer & key) {
                rowString += LINK_ARROWS[key];
            }
            else {
                rowString += BLS;
            }
        }
        if(rowString !== BLS.repeat(3)) {
            result += rowString + "\n";
        }
    }
    if(result === "") {
        result = BLS;
    }
    return result;
};

const COLORS = {
    Link: "#0761a2",
    Synchro: "#d9dcd8",
    Fusion: "#7b5395",
    Xyz: "#202225",
    Effect: "#9b644d",
    Normal: "#c18f43",
    Ritual: "#1e6ea7",
    Spell: "#26aba4",
    Trap: "#9b037d",
};

const EMOJI = {
    Effect: "<:EffectMonster:1172428974975111219>",
    Ritual: "<:RitualMonster:891100890361118730>",
    Fusion: "<:FusionMonster:891100718986051614>",
    Link: "<:LinkMonster:891100812816810014>",
    Xyz: "<:XyzMonster:891101219093901383>",
    Synchro: "<:SynchroMonster:891100978554757141>",
    Normal: "<:NormalMonster:891100853132480542>",
    Spell: "<:SpellCard:891100946560598027>",
    Trap: "<:TrapCard:891101018564210768>",

    PendulumMonster: "<:PendulumMonster:979163887377186878>",
    NormalPendulumMonster: "<:NormalPendulumMonster:979229742068809798>",
    XyzPendulumMonster: "<:XyzPendulumMonster:979229742014275604>",
    SynchroPendulumMonster: "<:SynchroPendulumMonster:979230346887458857>",
    FusionPendulumMonster: "<:FusionPendulumMonster:979230146999492609>",
    RitualPendulumMonster: "<:RitualPendulumMonster:979229742299492373>",
    
    NormalBackrow: "<:Normal:979212255021379614>",
    ContinuousBackrow: "<:Continuous:979212365595820132>",
    RitualBackrow: "<:Ritual:979212309627023400>",
    FieldBackrow: "<:Field:979212351700103198>",
    QuickPlayBackrow: "<:QuickPlay:979212292589752330>",
    EquipBackrow: "<:Equip:979212336218906704>",
    CounterBackrow: "<:CounterTrap:979346949746618438>",
    
    Rank: "<:Rank:979212378463932437>",
    Level: "<:Level:914343922690584657>",
    
    WATER: "<:Water:979223666283909130>",
    EARTH: "<:Earth:979223666262958100>",
    FIRE: "<:Fire:979223666241974272>",
    WIND: "<:Wind:979223666170687528>",
    LIGHT: "<:Light:979223666183258113>",
    DARK: "<:Dark:979223666153914448>",
    DIVINE: "<:Divine:979223666271350824>",
    
    ScaleLeft: "<:ScaleLeft:979227359163068427>",
    ScaleRight: "<:ScaleRight:979227394156154930>",
    
    Aqua: "<:Aqua:979223666262953984>",
    Beast: "<:Beast:979223665709293580>",
    BeastWarrior: "<:BeastWarrior:979223666132922399>",
    CelestialWarrior: "<:CelestialWarrior:1172430929365565491>",
    CreatorGod: "<:CreatorGod:979223666380382238>",
    Cyberse: "<:Cyberse:979223666300686386>",
    Cyborg: "<:Cyborg:1172430903025336321>",
    Dinosaur: "<:Dinosaur:979223666103558185>",
    DivineBeast: "<:DivineBeast:979223666040635402>",
    Dragon: "<:Dragon:979223665977729065>",
    Fairy: "<:Fairy:979223666107748393>",
    Fiend: "<:Fiend:979223666032271468>",
    Fish: "<:Fish:979223666233598022>",
    Galaxy: "<:Galaxy:1172430683495481354>",
    HighDragon: "<:HighDragon:1172439550547734528>",
    Insect: "<:Insect:979223666049044501>",
    Illusion: "<:Illusion:1172439693942603867>",
    Machine: "<:Machine:979223666229403648>",
    MagicalKnight: "<:MagicalKnight:1172430875691073577>",
    OmegaPsychic: "<:OmegaPsychic:1172439539655127070>",
    Plant: "<:Plant:979223666246164540>",
    Psychic: "<:Psychic:979223666032259082>",
    Pyro: "<:Pyro:979223665931583498>",
    Reptile: "<:Reptile:979223665696714753>",
    Rock: "<:Rock:979223665881264148>",
    SeaSerpent: "<:SeaSerpent:979223666007085107>",
    Spellcaster: "<:Spellcaster:979223666166480916>",
    Thunder: "<:Thunder:979223665612849192>",
    Warrior: "<:Warrior:979223665700921344>",
    WingedBeast: "<:WingedBeast:979223665856094228>",
    Wyrm: "<:Wyrm:979223665872879636>",
    Yokai: "<:Yokai:979223665818341406>",
    Zombie: "<:Zombie:979223665893863485>",
};

module.exports = {
    EMOJI, COLORS,
    getLinkArrowText, BLS
};