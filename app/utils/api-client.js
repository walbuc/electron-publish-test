const axios = require('axios').default
const apiURL = 'https://stage-fhir.insiteflow.com/api/v1'

async function client(
  endpoint,
  { data, token, headers: customHeaders, ...customConfig } = {},
) {
  const config = {
    url: `${apiURL}/${endpoint}`,
    method: data ? 'POST' : 'GET',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': data ? 'application/json' : '',
      ...customHeaders,
    },
    data: data,
    ...customConfig,
  }

  return axios.request(config).then(async response => {
    if (response.status === 401) {
      return Promise.reject({ message: 'Please re-authenticate.' })
    }
    if (response.statusText == 'OK') {
      return response.data
    } else {
      return Promise.reject(data)
    }
  })
}

module.exports = { client }
