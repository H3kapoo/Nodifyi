/*

POSSIBLE TEST CASES FOR POSSIBLE BASIC BUILT IN COMMANDS:
- create nodes
    make.node -pos x,y|x2,y2|.. -radius 30 -color ff00ffff
    make.node -pos x,y|x2,y2|.. -apos x,y|x2,y2|.. -radius 30 -aradius 30 -color ff00ffff -acolor ff00ffff -ease easeIn -duration 2000

- update nodes
    update.node -id x,y,z,.. -radius 3 -others..
    update.node -id x,y,z,.. -aradius 3 -aothers.. -duration 2000 -ease easeIn

- delete nodes
    update.delete -id x,y,z,..
    //no anim

- create conns
    make.conn -id x,y|x2,y2 -text t1,t2
- update conns
- delete conns

*/
module.exports = {
    "clear":
    {
        "schema": {
            "name": 'clear',
            "mandatory": [],
        },
        async logic(_, api) {
            api.clear()
        }
    },
    "list":
    {
        "schema": {
            "name": 'list',
            "mandatory": [],
        },
        async logic(_, api) {
            api.listCommands()
        }
    },
    "cn":
    {
        "schema": {
            "name": 'cn',
            "mandatory": ["pos"],
            "pos": "Number2vs",
            "radius": "AbsNumber",
            "color": "String",
            "text": "String",
            "startConn": "Boolean",
            "startConnAngle": "Number",
            "startConnLength": "AbsNumber",
            "selfConnect": "Boolean",
            "selfArrow": "Boolean",
            "selfText": "String",
            "selfAngle": "Number",
            "selfElevation": "AbsNumber",
            "selfApertureAngle": "Number",
            "selfTextElevation": "Number",
            "selfFixedTextRotation": "Boolean"
        },
        async logic(parsedData, api) {
            for (const pos of parsedData.pos) {
                api.createNodeSync('Circle', {
                    position: pos,
                    radius: parsedData.radius,
                    color: parsedData.color,
                    text: parsedData.text,
                    startConn: parsedData.startConn,
                    startConnAngle: parsedData.startConnAngle,
                    startConnLength: parsedData.startConnLength,
                    selfConnect: parsedData.selfConnect,
                    selfArrow: parsedData.selfArrow,
                    selfText: parsedData.selfText,
                    selfAngle: parsedData.selfAngle,
                    selfElevation: parsedData.selfElevation,
                    selfApertureAngle: parsedData.selfApertureAngle,
                    selfTextElevation: parsedData.selfTextElevation,
                    selfFixedTextRotation: parsedData.selfFixedTextRotation
                })
                api.doOutput(`Created node at position ${pos}!`)
            }
        }
    },
    "un":
    {
        "schema": {
            "name": 'un',
            "mandatory": ["id"],
            "id": "AbsNumberv",
            "pos": "AbsNumber2vs",
            "radius": "Number",
            "color": "String",
            "text": "String",
            "startConn": "Boolean",
            "startConnAngle": "Number",
            "startConnLength": "AbsNumber",
            "selfConnect": "Boolean",
            "selfArrow": "Boolean",
            "selfText": "String",
            "selfAngle": "Number",
            "selfElevation": "AbsNumber",
            "selfApertureAngle": "Number",
            "selfTextElevation": "Number",
            "selfFixedTextRotation": "Boolean"
        },
        async logic(parsedData, api) {
            for (let index = 0; index < parsedData.id.length; index++) {
                api.updateNodeSync(parsedData.id[index], {
                    position: parsedData.pos ? parsedData.pos[index] : undefined,
                    radius: parsedData.radius,
                    color: parsedData.color,
                    text: parsedData.text,
                    startConn: parsedData.startConn,
                    startConnAngle: parsedData.startConnAngle,
                    startConnLength: parsedData.startConnLength,
                    selfConnect: parsedData.selfConnect,
                    selfArrow: parsedData.selfArrow,
                    selfText: parsedData.selfText,
                    selfAngle: parsedData.selfAngle,
                    selfElevation: parsedData.selfElevation,
                    selfApertureAngle: parsedData.selfApertureAngle,
                    selfTextElevation: parsedData.selfTextElevation,
                    selfFixedTextRotation: parsedData.selfFixedTextRotation
                })
            }
            api.doOutput(`Updated nodes!`)
        }
    },
    "dn":
    {
        "schema": {
            "name": 'dn',
            "mandatory": ["id"],
            "id": "AbsNumberv",
        },
        logic(parsedData, api) {
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
            "elevation": "AbsNumber",
            "color": "String",
            "directed": "Boolean",
            "text": "String",
            "fixedTextRotation": "Boolean",
            "textColor": "String",
            "textElevation": "Number",
            "id": "AbsNumber2vs",
        },
        async logic(parsedData, api) {
            for (const id of parsedData.id)
                api.createConnectionSync(id[0], id[1], {
                    elevation: parsedData.elevation,
                    color: parsedData.color,
                    directed: parsedData.directed,
                    text: parsedData.text,
                    fixedTextRotation: parsedData.fixedTextRotation,
                    textColor: parsedData.textColor,
                    textElevation: parsedData.textElevation,
                })
            api.doOutput('Created connections!')
            // cn pos 400,500|800,600 && cc id 1,2 directed true
        }
    },
    "uc":
    {
        "schema": {
            "name": 'uc',
            "mandatory": ["id"],
            "elevation": "AbsNumber",
            "color": "String",
            "directed": "Boolean",
            "text": "String",
            "fixedTextRotation": "Boolean",
            "textColor": "String",
            "textElevation": "Number",
            "id": "AbsNumber2vs",
        },
        async logic(parsedData, api) {
            for (const id of parsedData.id)
                api.updateConnectionSync(id[0], id[1], {
                    elevation: parsedData.elevation,
                    color: parsedData.color,
                    directed: parsedData.directed,
                    text: parsedData.text,
                    fixedTextRotation: parsedData.fixedTextRotation,
                    textColor: parsedData.textColor,
                    textElevation: parsedData.textElevation,
                })
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
    "move":
    {
        "schema": {
            "name": 'move',
            "mandatory": ["id"],
            "id": "AbsNumber",
            "pos": "Number2",
        },
        async logic(parsedData, api) {
            const nodesId = api.getAllNodesConnectedTo(parsedData.id)
            console.log(nodesId);
            for (const nodeId of nodesId) {
                console.log(api.getNodeProps(nodeId).position + parsedData.pos);
                api.updateNodeSync(nodeId, {
                    position: [api.getNodeProps(nodeId).position[0] + parsedData.pos[0],
                    api.getNodeProps(nodeId).position[1] + parsedData.pos[1]]
                })
            }
        }
    },
    "gd":
    {
        "schema": {
            "name": 'gd',
            "mandatory": ["id"],
            "id": "AbsNumber",
        },
        async logic(parsedData, api) {
            const nodesId = api.getAllNodesConnectedTo(parsedData.id)
            console.log(nodesId);
            for (const nodeId of nodesId) {
                api.deleteNodeSync(nodeId)
            }
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
                const id =
                    api.createNodeSync('Circle', {
                        position: pos,
                        color: '#00000000'
                    })
                ids.push(id)
            }

            for (let i = 0; i < ids.length - 1; i++) {
                await api.createConnection(ids[i], ids[i + 1], {
                    elevation: 0,
                    animation: {
                        elevation: ids[i] % 2 ? 50 : -50,
                        duration: 400
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
            const n1 = await api.createNode({
                position: [300, 300],
                color: '#ff111100',
                animation: {
                    color: "#ff0000ff",
                    duration: 500
                }
            })
            const n2 = await api.createNode('Circle', {
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
            const pts = radialPoints(parsedData.pos, parsedData.radius || 300, 10)
            const nodeIds = []
            for (const pt of pts) {
                const id = await api.createNode('Circle', {
                    position: pt,
                    color: '#000000ff',
                })
                nodeIds.push(id)
            }

            const skip = parsedData.skip || 1

            for (let i = 0; i < nodeIds.length; i += skip) {
                for (let j = i; j < nodeIds.length; j += skip) {
                    if (i != j) {
                        api.createConnection(nodeIds[i], nodeIds[j], {
                            elevation: 200,
                            color: '#000000ff',
                            animation: {
                                elevation: 0,
                                easing: 'easeOutElastic',
                                duration: 2000
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
