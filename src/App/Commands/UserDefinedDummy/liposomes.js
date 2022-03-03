root = {
    "schema": {
        "name": 'lipos',
        "mandatory": [],
        "count": "AbsNumber",
        "pos": "AbsNumber2",
        "rmin": "AbsNumber",
        "rmax": "AbsNumber",
    },
    async logic(parsedData, api) {
        let rminIds = []
        let rmaxIds = []
        parsedData.pos = [400, 500]
        for (const pos of radialPoints(parsedData.pos, 200, 3))
            rminIds.push(await api.createNodeSync({
                position: parsedData.pos,
                animation: {
                    position: pos,
                    duration: 4000
                }
            }))

        for (const pos of radialPoints(parsedData.pos, 300, 3))
            rmaxIds.push(await api.createNodeSync({
                position: parsedData.pos,
                animation: {
                    position: pos,
                    duration: 4000
                }
            }))

        for (let i = 0; i < rminIds.length; i++)
            await api.createConnectionSync(rminIds[i], rmaxIds[i], {
                elevation: 0,
                animation: {
                    elevation: 50,
                    duration: 1000
                }
            })

        function radialPoints(pos, radius, count = 10) {
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