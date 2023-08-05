const fs = require("fs");

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
    uuid: null,
    stderrHandle: null,
    stdoutHandle: null,
    writeQueue: Promise.resolve(),
    
    getPrefix() {
        return `[Database ${this.formatter.format(new Date())}]`;
    },
    log(...args) {
        let prefix = this.getPrefix();
        console.log(prefix, ...args);
        this.appendToFile(this.stdoutHandle,
            `${prefix} ${args.map(arg => String(arg)).join(" ")}`
        );
    },
    error(...args) {
        let prefix = this.getPrefix();
        console.error(prefix, ...args);
        this.appendToFile(this.stderrHandle,
            `${prefix} ${args.map(arg => String(arg)).join(" ")}`
        );
    },
    
    async appendToFile(filename, data) {
        this.writeQueue = this.writeQueue
            .then(() =>
                new Promise((resolve, reject) => {
                    fs.appendFile(filename, `${data}\n`, err => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                })
            )
            .catch(err => {
                // for obvious reasons, this cannot use the timed console call
                console.error(`[${this.getPrefix()}] Unlogged error appending to ${filename}: ${err}`);
            });

        await this.writeQueue;
    },
    initialize() {
        const LOGS_FOLDER = "./logs";
        
        if(!fs.existsSync(LOGS_FOLDER)) {
            fs.mkdirSync(LOGS_FOLDER);
        }
        
        this.uuid = this.formatter.format(new Date()).replace(/[^0-9]+/g, "-");
        this.stdoutHandle = `${LOGS_FOLDER}/${this.uuid}.stdout.log`;
        this.stderrHandle = `${LOGS_FOLDER}/${this.uuid}.stderr.log`;

        this.log("== Start of output log ==");
        this.error("== Start of error log ==");
    }
};

TimedConsole.initialize();

module.exports = TimedConsole;
