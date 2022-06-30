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
    "cn-help":
    {
        "schema": {
            "name": 'cn-help',
            "mandatory": [],
        },
        async logic(parsedData, api) {
            api.doOutput("===============================  Help 'cn' =============================================")
            api.doOutput("> Description: Used to simply create a node or series of nodes with different options")
            api.doOutput("> Options: ")
            api.doOutput("--- 'pos<Number2vs>'                 => vector of node positions")
            api.doOutput("--- 'rad<AbsNumber>'                 => radius of the node(s)")
            api.doOutput("--- 'color<String>'                  => color of the node(s)")
            api.doOutput("--- 'text<String>'                   => text inside the node(s)")
            api.doOutput("--- 'startConn<Boolean>'             => should node be start of automata")
            api.doOutput("--- 'startConnAngle<Number>'         => angle of automata start connection")
            api.doOutput("--- 'startConnLength<Number>'        => length of automata start connection")
            api.doOutput("--- 'selfConnect<Boolean>'           => connect node to itself")
            api.doOutput("--- 'selfArrow<Boolean>'             => add directional arrow to self connection")
            api.doOutput("--- 'selfText<Text>'                 => add text to self connection")
            api.doOutput("--- 'selfAngle<Number>'              => set angle self connection")
            api.doOutput("--- 'selfElevation<AbsNumber>'       => set elevation of self connection")
            api.doOutput("--- 'selfApertureAngle<Number>'      => set angle between self connection points")
            api.doOutput("--- 'selfTextElevation<Number>'      => set elevation of self connection text")
            api.doOutput("--- 'selfFixedTextRotation<Boolean>' => rotate self connection text by self angle")
            api.doOutput("===============================  End Help 'cn' ==========================================")
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
    2: {
        "schema": {
            "name": 'mknode',
            "mandatory": ["pos"],
            "pos": "AbsNumber2",
            "radius": "AbsNumber",
            "skip": "AbsNumber",
            "node_count": "AbsNumber"
        },
        async logic(parsedData, api) {
            const pts = radialPoints(parsedData.pos, parsedData.radius || 300, parsedData.node_count || 10)
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
    }
}
