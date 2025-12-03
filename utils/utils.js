export const makeApiRequest = async (apiType, apiPath, data) => {
    try {
        let response
        switch (apiType.toLowerCase()) {
            case 'get':
                response = await axios.get(apiPath, data)
                break
            case 'post':
                response = await axios.post(apiPath, data)
                break
            case 'put':
                response = await axios.put(apiPath, data)
                break
            case 'delete':
                response = await axios.delete(apiPath)
                break
            default:
                throw console.log(`Unsupported API type: ${apiType}`)
        }
        return response
    } catch (error) {
        console.log(error)
    }
}