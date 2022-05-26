const FuzzySearch = require("fuzzy-search");

module.exports = {
    lastUpdated: null,
    fuzzy: null,
    Database: null,
    update(Database) {
        if(this.lastUpdated != Database.lastUpdated) {
            this.lastUpdated = Database.lastUpdated;
            this.Database = Database;
            this.fuzzy = new FuzzySearch(Object.values(Database.cards), ["name", "idString"], {
                caseSensitive: false,
                sort: true
            });
        }
    },
    search(name) {
        if(this.Database.cards[name]) {
            return [ this.Database.cards[name] ];
        }
        else {
            return this.fuzzy.search(name);
        }
    },
};
