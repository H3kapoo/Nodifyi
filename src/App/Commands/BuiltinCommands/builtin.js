module.exports = {
    1: {
        "schema": {
            "name": 'delnode',
            "mandatory": ["id"],
            "id": "String",
            "ceva": "NotRequired"
        },
        async logic(parsedData, api) {
            const n1 = api.createNode({ position: [300, 300] })
            const n2 = api.createNode({ position: [600, 600] })
            api.createConnection(n1, n2, {})
            api.deleteNode(n1)
        }
    },
    2: {
        "schema": {
            "name": 'anim',
            "mandatory": [],
            "id": "Number2",
        },
        async logic(parsedData, api) {
            const n1 = api.createNode({
                position: [600, 600],
                animation: {
                    position: parsedData.id,
                    duration: 2000
                }
            })
            const n2 = await api.createNode({
                position: [100, 300],
                animation: {
                    position: [400, 300],
                    duration: 2000
                }
            })
        }
    },
}
