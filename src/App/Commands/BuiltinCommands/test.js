root = {
    "schema": {
        "name": 'delnode',
        "mandatory": ["id"],
        "id": "Numberv",
    },
    async logic(parsedData, api) {

        parsedData.id.forEach(async (id) => {
            await api.deleteNode(id)
        })
    }
}
