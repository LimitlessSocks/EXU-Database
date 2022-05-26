const FuzzyDBSearcher = require("./fuzzy.js");

exports.search = async (interaction, Database) => {
    // TODO: assert Database is live
    FuzzyDBSearcher.update(Database);
    let term = interaction.options.getString("name");
    console.log("Performing search for:", term);
    let results = FuzzyDBSearcher.search(term);
    
    if(!results.length) {
        await interaction.reply({ content: "No results found matching " + term, ephemeral: true });
        return null;
    }
    else {
        return results;
    }
};
