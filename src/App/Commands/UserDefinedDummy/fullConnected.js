root = {
    "schema": {
        "name": 'fc',
        "mandatory": ["pos"], // central position
        "pos": "AbsNumber2", // positive number pair
        "radius": "AbsNumber", // radius of fully connected graph
        "nodeCount": "AbsNumber" // how many nodes
    },
    logic(parsedData, API) {

        // 1
        const radius = parsedData.radius || 200
        const nodeCount = parsedData.nodeCount || 5

        // 2
        let nodeIds = []
        for (const pos of generatePositions(parsedData.pos, radius, nodeCount))
            nodeIds.push(API.createNodeSync('Circle', { position: pos }))

        // 3
        for (let i = 0; i < nodeIds.length; i++)
            for (let j = i; j < nodeIds.length; j++)
                if (i != j)
                    API.createConnectionSync(nodeIds[i], nodeIds[j], { color: '#ff0000ff', elevation: 0 })

        // 4
        API.doOutput(`Radially created and fully connected ${nodeCount} nodes!`)

        // 5
        function generatePositions(pos, radius, count) {
            let currentAngle = 0
            let angleInc = 360 / count // spreading the nodes at 'angle' angles
            return Array.from(Array(count)).map(_ => {
                const x = pos[0] + Math.cos(currentAngle * (Math.PI / 180)) * radius
                const y = pos[1] + Math.sin(currentAngle * (Math.PI / 180)) * radius
                currentAngle += angleInc
                return [x, y]
            })
        }
    }
}
