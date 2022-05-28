root = {
    "schema": {
        "name": 'automata',
        "mandatory": ['pattern'],
        "pattern": "Stringvs",
        "text": "Stringvs"
    },
    async logic(parsedData, API) {
        let mapping = {}
        let newX = 400
        let i = 0
        for (const pattern of parsedData.pattern) {
            console.log(pattern);
            if (!mapping[pattern[0]]) {
                mapping[pattern[0]] = API.createNodeSync('Circle', { position: [newX, 400], text: pattern[0] })
                newX += 200
            }

            if (!mapping[pattern[1]]) {
                mapping[pattern[1]] = API.createNodeSync('Circle', { position: [newX, 400], text: pattern[1] })
                newX += 200
            }

            const text = parsedData.text[i] ? parsedData.text[i].join(',') : ''

            if (mapping[pattern[0]] === mapping[pattern[1]])
                API.updateNodeSync(mapping[pattern[0]], { selfConnect: true, selfArrow: true, selfText: text })
            else
                API.createConnectionSync(mapping[pattern[0]], mapping[pattern[1]], { directed: true, text: text })
            i++
        }
    }
}