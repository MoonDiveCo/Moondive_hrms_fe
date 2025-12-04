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

export const formatDate = (dateInput) => {
    let date;

    if (typeof dateInput === 'string' && dateInput.includes('/')) {
        const [day, month, year] = dateInput.split('/');
        date = new Date(`${year}-${month}-${day}`);
    } else {
        date = new Date(dateInput);
    }

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};