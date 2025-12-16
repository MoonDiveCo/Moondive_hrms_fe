import { DASHBOARD_HEADERS } from "@/constants/NestedDashboard"

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

export const detectModuleKey = (parts) =>{
  return Object.keys(DASHBOARD_HEADERS).find(key =>
    parts.includes(key)
  );
}

export const matchPattern = (parts, pattern) => {
  if (parts.length < pattern.path.length) return false;

  for (let i = 0; i < pattern.path.length; i++) {
    if (parts[i + 1] !== pattern.path[i]) return false;
  }

  return true;
}

export const findMatchingPattern = (parts, moduleConfig) => {
  for (const pattern of moduleConfig.patterns) {
    if (matchPattern(parts, pattern)) return pattern;
  }
  return null;
}