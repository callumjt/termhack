const readline = require('readline');
const pyrand = require('pyrand');
const fs = require('node:fs');
const {colors, failChance, rateLimits, levelXp, commandHelp} = require('./exports.js');

var state = 'input';
try {
    var json = JSON.parse(fs.readFileSync('./save.json'))
} catch(err) {
    const temp = JSON.parse(fs.readFileSync('./default.json'));
    const filePath = 'save.json';

    fs.writeFile(filePath, JSON.stringify(temp), (err) => {
      if (err) throw err;
    });

    json = temp;
}

const lastHacked = {}
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
    "includes": {
        "servers": `json.servers.includes(shopPages[id][object].name) ? colors.green : ""`,
        "upgrades": `json.upgrades.find(x => x.name == shopPages[id][object].name).bought ? colors.green : ""`
    }
}

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
        "value": "30, 50"
    }
]

const saveJson = () => {
    fs.writeFileSync('./save.json', JSON.stringify(json));
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define your commands
const commands = {
  hack: async (args) => {
    const find = json.servers.find(x => x == args[0])

    if (find) {
        const server = servers.find(x => x.name == find)

        if (!server) {
            process.stdout.write('\x1Bc')
            console.log("Server does not exist or you have not unlocked it.")

            return;
        }

        const fail = pyrand.randint(1, 10)
        if (fail < failChance[json.upgrades.find(x => x.name == "lower fail chance").bought]) {
            process.stdout.write('\x1Bc')
            console.log("They caught you trying to hack them so you failed.")

            return;
        }

        // checks if you should be rate limited
        if (lastHacked.name == server.name && lastHacked.amount > rateLimits[json.upgrades.find(x => x.name == "higher rate limit").bought]) {
            state = "ratelimit"
            console.log("The server is rate limiting you, wait 5 seconds.")
            await new Promise(resolve => setTimeout(resolve, 5000));

            process.stdout.write('\x1Bc')
            lastHacked.amount = 0
            state = "input"
            promptForCommand()

            return;
        }

        // decides how much money you should get
        const money = pyrand.randint(parseInt(server.value.split(',')[0]), parseInt(server.value.split(',')[1]));

        // adds the money and updates the json
        json.money += Math.round(money * (json.upgrades[0].bought == true ? 1.5 : 1));
        json.xp += Math.round(money * 1.5)
        saveJson()

        checkLevel()

        // adds 1 to amount or sets name to server hacked
        if (lastHacked.name == server.name) {
            lastHacked.amount += 1
        } else {
            lastHacked.name = server.name;
            lastHacked.amount = 1;
        };

        // logs how much youve hacked
        console.log(`You hacked ${server.name} and got £${money}`)
    };
  },
  shop: async (args) => {
    state = "shopList"

    const printShopPages = () => {
        process.stdout.write('\x1Bc');
        const keys = Object.keys(shopPages);
        keys.forEach((name, index) => {
          if (index < keys.length - 1) {
            console.log('- ', name);
        }})
        console.log(`\n${toolTip("Type 'back' to go back")}\n`)

        askCate()
    }

    const printShop = (id) => {
        process.stdout.write('\x1Bc');
        Object.keys(shopPages[id]).forEach(object => console.log(eval(shopPages["includes"][id]), shopPages[id][object].name, '-', shopPages[id][object].cost, colors.reset));
        console.log(`\n${toolTip("Type 'back' to go back")}\n`)

        askBuy(id)
    }

    const askCate = () => {
        rl.question('Enter a category: ', (input) => {
            if (input == "back") {
                process.stdout.write('\x1Bc');
                state = "input"
                promptForCommand()
                return
            }

            if (shopPages.hasOwnProperty(input) && input !== "includes") {
                printShop(input)
            } else {
                process.stdout.write('\x1Bc');
                console.log("Unknown category")

                printShopPages()
            }
        })
    }

    const askBuy = (id) => {
        rl.question('What do you want to buy? ', (input) => {

            if (input == "back") {
                process.stdout.write('\x1Bc');
                printShopPages()
                return
            }

            const findName = shopPages[id].find(x => x.name == input)

            if (findName && json.servers.includes(findName)) {
                console.log("Already bought.")
                askBuy(id)
            }

            if (findName) {
                if (json.money >= findName.cost) {
                    eval(findName.exec)
                    json.money -= findName.cost

                    saveJson()

                    process.stdout.write('\x1Bc');
                    console.log(`Bought ${findName.name}.`)
                    state = "input"
                    promptForCommand()
                } else {
                    console.log("Not enough money.")

                    printShop(id)
                }
            } else {
                process.stdout.write('\x1Bc');
                console.log("Unknown item")

                printShop(id)
            }
        })
    }

    printShopPages()

  },
  servers: () => {
    Object.keys(servers).forEach(object => json.servers.find(x => x == servers[object].name) ? console.log(`${colors.green}${servers[object].name} - ${servers[object].description} ${colors.reset}`) : console.log(`${servers[object].name} - ${servers[object].description}`))
    console.log("")
  },
  stats: () => {
    console.log(`money: ${json.money}`)
    console.log(`xp: ${barGraph(json.xp, levelXp[json.level], [{text: ` Level ${json.level}`, color: colors.red}])}`)

    console.log("")
  },
  cf: (args) => {
    const choices = ["h", "t"]

    if (!args[0] || !args[1]) {
        console.log("Invalid arguments.")
        console.log("")

        return;
    }

    if (!choices.includes(args[0])) {
        console.log("not a valid option, choose h or t.")
        console.log("")

        return;
    }

    if (json.money < args[1]) {
        console.log("Not enough money")
        console.log("")

        return;
    }

    const random = pyrand.randint(0, 1)
    const computersChoice = choices[random]

    if (computersChoice == args[0]) {
        console.log(`${colors.green}You win, the betting money has been doubled${colors.reset}`)
        console.log("")

        json.money += parseInt(args[1])
        saveJson()
    } else {
        console.log(`${colors.red}You lose and you lose all the money you bet.${colors.reset}`)
        console.log("")

        json.money -= parseInt(args[1])
        saveJson()
    }
  },
  help: (args) => {
    if (!args[0]) {
        Object.keys(commands).forEach(cmd => console.log('- ', cmd));
        console.log(`\n${toolTip("You can also do help [command] to get info on a command.")}`)
        console.log(' ')
    } else {
        if (Object.keys(commands).find(x => x == args[0])) {
            console.log(args[0])
            console.log(commandHelp[args[0]])
            console.log("")
        } else {
            console.log("Unknown command")
            console.log("")
        }
    }
  }
};

function checkLevel() {
    if (json.xp >= levelXp[json.level]) {
        json.xp -= levelXp[json.level]
        json.level += 1;

        saveJson()
    }
}

function barGraph(value, max, additional) {
    "■#"

    var text = "[ "
    const bars = 20

    const p = max / bars
    const amount = Math.round(value / p)

    for (var x = 0; x < amount; x++) text += "█"
    for (var x = 0; x < bars - amount; x++) text+= " "
    text += " ]"

    const percentage = ` ${colors.blue}${(value / max) * 100}%${colors.reset}`
    const of = ` ${colors.yellow}${value}/${max}${colors.reset}`

    text += percentage + of

    if (additional) {
        for (const x of additional) {
            text += `${x.color}${x.text}${colors.reset}`
        }
    }

    return text;
}

function toolTip(message) {
    return `${colors.bgWhite} * ${colors.reset}${colors.bgBlue} ${message} ${colors.reset}`
}

// Function to continuously prompt for commands
function promptForCommand() {
    rl.question('Enter a command, enter help to get a list of commands: ', (input) => {
        const [command, ...args] = input.split(' ');
        if (commands.hasOwnProperty(command)) {
            process.stdout.write('\x1Bc');
            commands[command](args);
        } else {
            process.stdout.write('\x1Bc');
            console.log('Unknown command.');
        }
        if (state == 'input') promptForCommand();
    });
}

// Start prompting for commands
process.stdout.write('\x1Bc');
promptForCommand();