const fs = require('node:fs')

var json = JSON.parse(fs.readFileSync('./save.json'))
var defaultJson = JSON.parse(fs.readFileSync('./default.json'))

for (const x in defaultJson) {
    if (Array.isArray(defaultJson[x]) && json[x]) {
        for (const y of defaultJson[x]) {
            if (!json[x].find(x => x.name == y.name)) {
                json[x].push(y)
            }
        }
    }

    if (!json[x]) {
        json[x] = defaultJson[x]
    }
}

fs.writeFileSync('./save.json', JSON.stringify(json));
