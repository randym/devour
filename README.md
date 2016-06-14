# Devour JSON-API Client

– _"Don't just consume your [JSON-API](http://jsonapi.org/), Devour it"_

-------------------------------------------------

[![Build Status](https://travis-ci.org/twg/devour.svg?branch=master)](https://travis-ci.org/twg/devour)


The [JSON API specification](http://jsonapi.org/format/) has given us a sensible convention to build our API's against. It's flexible, well thought out, and comes fully loaded with clear answers to questions like pagination, filtering, sparse fields, and relationships.

While JSON API is amazing, it can be painful to work with if you don't have a good consumer library. It turns out that serializing and deserializing JSON API resources manually is quite painful. Enter Devour...

### Another Implementation?

While there are quite a few [JavaScript client implementations](http://jsonapi.org/implementations/#client-libraries-javascript), none of them appeared to offer the exact feature set we needed with the simplicity we required.

### Quick Start

```js
// npm install devour-client --save

// Import
import JsonApi from 'devour-client'

// Bootstrap
const jsonApi = new JsonApi({apiUrl:'http://your-api-here.com'})

// Define Model
jsonApi.define('post', {
  title: '',
  content: '',
  tags: []
})

// To find many...
jsonApi.findAll('post')

// To find many with filters...
jsonApi.findAll('post', {page: {number: 2}})

// To find one...
jsonApi.find('post', 5)

// To create...
jsonApi.create('post', {
  title: 'hello',
  content: 'some content',
  tags: ['one', 'two']
})

// To update...
jsonApi.update('post', {
  id: 5,
  title: 'new title',
  content: 'new content',
  tags: ['new tag']
})

// To destroy...
jsonApi.destroy('post', 5)

// To make arbitrary requests through the middleware stack
jsonApi.request('https://example.com', 'GET', { a_query_param: 3 }, { some_payload_item: 'blah' })
```

### Initializer

`const jsonApi = new JsonApi({apiUrl: 'http://your-api-here.com'})`

Devour takes an object as the initializer. The following options are available:

**apiUrl**: The HTTP API end point, for example: `http://your-api-here.com`

**middleware**: An array of middleware to use. See below

**logger**: A boolean to enable or disable the logger. (Default: true)

**resetBuilderOnCall**: A boolean to clear the builder stack after a `.get`, `.post`, `.patch`, `.destroy` call. (Default: true)

**auth**: An object with username and password, used to pass in HTTP Basic Authentication Headers, `new JsonApi({apiUrl: 'http://your-api-here.com', auth: {username: 'secret', password: 'cheesecake})`

### Relationships

Devour comes stock with an easy way of defining relationships which can be included when hitting your API.

```js
jsonApi.define('post', {
  title: '',
  content: '',
  comments: {
    jsonApi: 'hasMany',
    type: 'comments'
  }
})

jsonApi.define('comment', {
  comment: ''
})

let post = jsonApi.findAll('post', {include: 'comments'})
// => post.comment will be populated with any comments included by your API
```

### Flexibility

Devour uses a fully middleware based approach. This allows you to easily manipulate any part of the request and response cycle by injecting your own middleware. In fact, it's entirely possible to fully remove our default middleware and write your own. Moving forward we hope to see adapters for different server implementations. If you'd like to take a closer look at the middleware layer, please checkout:

* The [index.js file](https://github.com/twg/devour/blob/master/index.js#L8) where we construct our default middleware stack
* The middleware folder that contains all our default [JSON API middleware](https://github.com/twg/devour/tree/master/middleware/json-api)

### Your First Middleware

Adding your own middleware is easy. It's just a simple JavaScript object that has a `name`, `req`, and/or `res` property. The `req` or `res` property is a function that receives a `payload`, which houses all the details of the request cycle _(inspect it for yourself to learn more)_. For async operations, your `req` or `res` methods can return a promise, which will need to resolve before the middleware chain continues. Otherwise, you may just manipulate the `payload` as needed and return it immediately.

```js
let requestMiddleware = {
  name: 'add-cats-to-request',
  req: (payload)=> {
    if(payload.req.method === 'GET') {
      payload.req.cats = 'more-cats'
    }
    return payload
  }
}

let responseMiddleware = {
  name: 'only-cats-please',
  res: (payload) => {
    payload.res.data = ['Cats', 'Cats', 'Cats']
    return payload
  }
}

jsonApi.insertMiddlewareBefore('axios-request', requestMiddleware)
jsonApi.insertMiddlewareAfter('response', responseMiddleware)
```

### Options

When declaring a model you may pass in a few extra options. We will likely expand these options as we find new and interesting requirements.

```js
jsonApi.define('product', {
  title: '',
  description: ''
  price: ''
}, {
  readOnly: ['price'],
  collectionPath: 'awesome-products',
  serializer: (rawItem)=> {
    return {customStuff: true}
  },
  deserializer: (rawItem)=> {
    return {customStuff: true}
  }
})
```

There are also a few options we can set on the `jsonApi` instance directly. For example:

```js
// Append headers to every request
jsonApi.headers['my-auth-token'] = 'xxxxx-xxxxx'
// Replace the default middleware stack with your own
jsonApi.middleware = [{...}, {...}, {...}]
// Change the apiUrl
jsonApi.apiUrl = 'http://api.yoursite.com'
```

### URL Builder

JSON API Specs allows nested URLs to be used to define a resource. For example, `/authors/1/posts` may define posts from author with ID 1.

The builder pattern allows arbitrary nested URL construction by chaining `.one(model, id)` and `.all(model)` and append an action, one of: `.get`, `.post`, `.patch` and `.destroy`

For example:

```js
let jsonApi = new JsonApi({apiUrl: 'http://api.yoursite.com'})
jsonApi.define('author', {name: ''})
jsonApi.define('post', {title: ''})

jsonApi.one('author', 1).all('post').get() // GET http://api.yoursite.com/authors/1/posts
jsonApi.one('author', 1).all('post').post({title:'title'}) // POST http://api.yoursite.com/authors/1/posts
```
