module.exports = (text) =>
    text.replace(/\*|__|:|~~|`/g, "\\$&");
