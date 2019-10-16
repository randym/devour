module.exports = {
  name: 'errors',
  error: function (payload) {
    if (!payload.data) {
      console.log('Unidentified error')
    }
    return payload
  }
}
