// const CardViewer = require("./../../../exu-scrape/card-viewer.js");
const CardViewer = require("./extern/card-viewer.js");
const { condenseQuery, naturalInputToQuery } = require("./extern/tag-extract.js");

exports.initialize = (Database) => {
    CardViewer.Database = Database;
    CardViewer.excludeTcg = false;
};

exports.queryNaturalInput = (text) => {
    let query = naturalInputToQuery(text);
    if(query.length === 0) {
        return [];
    }
    query = condenseQuery(query, CardViewer.createFilter);
    return CardViewer.filter(query);
};
