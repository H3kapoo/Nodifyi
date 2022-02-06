module.exports = {
    "cn":
    {
        "schema": {
            "name": 'cn',
            "mandatory": ["pos"],
            "pos": "AbsNumber2vs",
        },
        async logic(parsedData, api) {
            for (const pos of parsedData.pos)
                api.createNodeSync({ position: pos })
            api.doOutput('Created nodes!')
        }
    },
    "un":
    {
        "schema": {
            "name": 'un',
            "mandatory": ["id", "pos"],
            "id": "AbsNumberv",
            "pos": "AbsNumber2vs"
        },
        async logic(parsedData, api) {
            for (const [index, id] of parsedData.id.entries())
                if (index < parsedData.pos.length)
                    api.updateNodeSync(id, { position: parsedData.pos[index] })
            api.doOutput('Updated nodes!')

        }
    },
    "dn":
    {
        "schema": {
            "name": 'dn',
            "mandatory": ["id"],
            "id": "AbsNumberv",
        },
        async logic(parsedData, api) {
            for (const id of parsedData.id)
                api.deleteNodeSync(id)
            api.doOutput('Deleted nodes!')
        }
    },
    "cc":
    {
        "schema": {
            "name": 'cc',
            "mandatory": ["id"],
            "id": "AbsNumber2vs",
        },
        async logic(parsedData, api) {
            for (const id of parsedData.id)
                api.createConnectionSync(id[0], id[1], {})
            api.doOutput('Created connections!')
        }
    },
    "uc":
    {
        "schema": {
            "name": 'uc',
            "mandatory": ["id", "elev"],
            "id": "AbsNumber2vs",
            "elev": "AbsNumberv"
        },
        async logic(parsedData, api) {
            for (const [index, id] of parsedData.id.entries())
                if (index < parsedData.elev.length)
                    api.updateConnectionSync(id[0], id[1], { elevation: parsedData.elev[index] })
            api.doOutput('Updated connections!')
        }
    },
    "dc":
    {
        "schema": {
            "name": 'dc',
            "mandatory": ["id"],
            "id": "AbsNumber2vs",
        },
        async logic(parsedData, api) {
            for (const [index, id] of parsedData.id.entries())
                api.deleteConnectionSync(id[0], id[1])
            api.doOutput('Deleted connections!')
        }
    },
    1: {
        "schema": {
            "name": 'delnode',
            "mandatory": [],
            "id": "String",
            "ceva": "NotRequired"
        },
        async logic(parsedData, api) {
            const poss = [
                [100, 300],
                [250, 300],
                [400, 300],
                [550, 300],
                [700, 300],
            ]
            let ids = []
            for (const pos of poss) {
                const id = await api.createNode({
                    position: pos,
                    color: '#00000000',
                    animation: {
                        color: '#000000ff',
                        duration: 100
                    }
                })
                ids.push(id)
            }

            //TO FIX: trying to create conns on startPos === endPos
            for (let i = 0; i < ids.length - 1; i++) {
                api.createConnection(ids[i], ids[i + 1], {
                    elevation: 0,
                    animation: {
                        elevation: ids[i] % 2 ? 50 : -50,
                        duration: 200
                    }
                })
            }

            async function createConn(n1, n2) {
                await api.createConnection(n1, n2, {
                    elevation: 0,
                    animation: {
                        elevation: n1 % 2 ? 50 : -50,
                        duration: 200
                    }
                })
            }
        }
    },
    4: {
        "schema": {
            "name": 'test',
            "mandatory": [],
            "ids": "AbsNumber2"
        },
        async logic(parsedData, api) {
            //TODO: In validity checking, add 'ff' if alpha not specified
            //                            add x2 + alpha is only format: #XXX
            const n1 = await api.createNode({
                position: [300, 300],
                color: '#ff111100',
                animation: {
                    color: "#ff0000ff",
                    duration: 500
                }
            })
            const n2 = await api.createNode({
                position: [600, 600]
            })

            await api.createConnection(n1, n2, {
                color: '#ffffff00',
                animation: {
                    color: '#ffeebbff',
                    duration: 1000
                }
            })
        }
    },
    2: {
        "schema": {
            "name": 'mknode',
            "mandatory": ["pos"],
            "pos": "AbsNumber2",
            "radius": "AbsNumber",
            "skip": "AbsNumber"
        },
        async logic(parsedData, api) {
            const pts = radialPoints(parsedData.pos, parsedData.radius || 300, 20)
            const nodeIds = []
            for (const pt of pts) {
                const id = api.createNodeSync({
                    position: pt,
                    color: '#00000000',
                    animation: {
                        color: '#000000ff',
                        duration: 1000
                    }
                })
                nodeIds.push(id)
            }

            const skip = parsedData.skip || 1

            for (let i = 0; i < nodeIds.length; i += skip) {
                for (let j = i; j < nodeIds.length; j += skip) {
                    if (i != j) {
                        api.createConnectionSync(nodeIds[i], nodeIds[j], {
                            elevation: 200,
                            color: '#00000000',
                            animation: {
                                elevation: 0,
                                color: '#000000ff',
                                duration: 1000
                            }
                        })
                    }
                }
            }

            function radialPoints(pos, radius, count) {
                const step = 360 / count
                let points = []
                for (let a = 0; a < 360; a += step) {
                    const x = Math.cos(a * (Math.PI / 180)) * radius
                    const y = Math.sin(a * (Math.PI / 180)) * radius
                    points.push([x + pos[0], y + pos[1]])
                }
                return points
            }
        }
    },
    3: {
        "schema": {
            "name": 'createNode',
            "mandatory": ["id"],
            "id": "Number",
        },
        async logic(parsedData, api) {
            await api.createNode(parsedData.id, {})
        }
    },
    4: {
        "schema": {
            "name": 'cns',
            "mandatory": ["pos"],
            "pos": "AbsNumber2vs",
        },
        async logic(parsedData, api) {
            for (const pos of parsedData.pos) {
                const id = api.createNodeSync({
                    position: pos,
                    animation: {
                        position: [500, 600],
                        duration: 500
                    }
                })
            }

        }
    }
}
