export default function (jsonApi, res = {}) {
  jsonApi.middleware.unshift({
    name: 'mock-response',
    req: (payload) => {
      payload.req.adapter = function (request) {
        return new Promise(function (resolve, reject) {
          resolve(res)
        })
      }
      return payload
    }
  })
}
