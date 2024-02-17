const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
};

const rateLimits = [
    5,
    7,
]

const failChance = [
    3, // 3 in 10 to fail
    2 // 2 in 10 to fail
]

const levelXp = [
    50,
    200,
    500
]

const commandHelp = {
    "hack": "hack a server.",
    "shop": "buy some servers to hack or buy equipment/upgrades.",
    "servers": "lists all the servers, highlights the owned ones in green.",
    "stats": "shows all your stats.",
    "cf": "coinflip [h/t] and see if you win, if you do the money you bet is doubled.",
    "help": "pretty self explanatory, no?",
    "workers": "workers are people who will hack for you, they only hack while you run workers by doing 'workers [server name]', make sure you own the worker in the shop.",
}

const shopPages = {
    "servers": [
        {
            "name": "indie",
            "cost": 50,
            "exec": "json.servers.push(input);",
        },
        {
            "name": "indie studio",
            "cost": 150,
            "exec": "json.servers.push(input);",
        },
    ],
    "upgrades": [
        {
            "name": "1.5x money",
            "cost": 900,
            "exec": "json.upgrades.find(x => x.name == input).bought = true;"
        },
        {
            "name": "higher rate limit",
            "cost": 100,
            "exec": "json.upgrades.find(x => x.name == input).bought = 1;"
        },
        {
            "name": "lower fail chance",
            "cost": 100,
            "exec": "json.upgrades.find(x => x.name == input).bought = 1;"
        }
    ],
    "workers": [
        {
            "name": "hobbyist",
            "cost": 100,
            "exec": "json.workers.find(x => x.name == input).bought = 1",
        }
    ],
    "includes": {
        "servers": `json.servers.includes(shopPages[id][object].name) ? colors.green : ""`,
        "upgrades": `json.upgrades.find(x => x.name == shopPages[id][object].name).bought ? colors.green : ""`,
        "workers": `json.workers.find(x => x.name == shopPages[id][object].name).bought ? colors.green : ""`,
    }
}

const lastHacked = {}


const servers = [
    {
        "name": "hobbyist",
        "description": "hack a hobbyist programmer.",
        "value": "0,10"
    },
    {
        "name": "indie",
        "description": "hack an indie game developer.",
        "value": "15,30"
    },
    {
        "name": "indie studio",
        "description": "hack an indie studio.",
        "value": "30,50"
    }
]

module.exports = {
    colors: colors,
    rateLimits: rateLimits,
    failChance: failChance,
    levelXp: levelXp,
    commandHelp: commandHelp,
    shopPages: shopPages,
    lastHacked: lastHacked,
    servers: servers,
}