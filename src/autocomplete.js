const MAX_LENGTH = 25;

// TODO: move more-searched items to the front?
// todo: fuzzy search

exports.autocomplete = async (interaction, Database, options = {}) => {
    let customOnly = options.customOnly ?? false;
    let suggestRestricted = options.suggestRestricted ?? false;
    let noId = options.noId ?? false;
    
    let autos = [];
    let term = interaction.options.getString("name").toLowerCase();
    let restrictedCount = 0;
    // let custom = interaction.options.getBoolean("custom");
    for(let [key, value] of Object.entries(Database.cards)) {
        if(customOnly) {
            if(!value.custom) continue;
        }
        let { lname, name, idString } = value;
        if(!lname) {
            console.error("LNAME MISSING:", value);
        }
        if(lname.includes(term)) {
            let dname = name;
            if(value.alt_art) {
                dname += " (Alternate Art)";
            }
            let obj = {
                name: dname,
                value: noId ? name : idString,
            };
            if(value.exu_limit !== 3 && suggestRestricted) {
                autos.unshift(obj);
                restrictedCount++;
            }
            else {
                autos.push(obj);
            }
        }
        if(suggestRestricted) {
            if(restrictedCount >= MAX_LENGTH) {
                break;
            }
        }
        else if(autos.length >= MAX_LENGTH) {
            break;
        }
    }
    interaction.respond(autos.slice(0, MAX_LENGTH-1));
};
