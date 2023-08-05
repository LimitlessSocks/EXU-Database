const TimedConsole = {
    formatter: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        fractionalSecondDigits: 3,
        format: "MM/dd/yyyy HH:mm:ss.SSS",
    }),
    getPrefix() {
        return `[Database ${this.formatter.format(new Date())}]`;
    },
    log(...args) {
        console.log(this.getPrefix(), ...args);
    },
    error(...args) {
        console.error(this.getPrefix(), ...args);
    },
};

module.exports = TimedConsole;
