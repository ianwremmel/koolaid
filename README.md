# koolaid
[![Build Status](https://travis-ci.org/ianwremmel/koolaid.svg)](https://travis-ci.org/ianwremmel/koolaid)
[![Coverage Status](https://coveralls.io/repos/ianwremmel/koolaid/badge.svg?branch=master&service=github)](https://coveralls.io/github/ianwremmel/koolaid?branch=master)
[![Code Climate](https://codeclimate.com/github/ianwremmel/koolaid/badges/gpa.svg)](https://codeclimate.com/github/ianwremmel/koolaid)

[![Dependency Status](https://david-dm.org/ianwremmel/koolaid.svg)](https://david-dm.org/ianwremmel/koolaid)
[![devDependency Status](https://david-dm.org/ianwremmel/koolaid/dev-status.svg)](https://david-dm.org/ianwremmel/koolaid#info=devDependencies)
[![peerDependency Status](https://david-dm.org/ianwremmel/koolaid/peer-status.svg)](https://david-dm.org/ianwremmel/koolaid#info=peerDependencies)

> Restful model framework for [Express](http://expressjs.com/) based on [es7 decorators](https://github.com/wycats/javascript-decorators) that drank all the babel koolaid

Warning: I have no idea if this is a good idea.

## Motivation

Frameworks and examples built around [Express](http://expressjs.com/) tend to closely couple business logic to routes. This coupling often doesn't scale well (for access control) and makes it difficult for the business logic in one route to interact with the business logic on another route (unless you did a great job separating your models and controllers)

Also, decorators sounded cool.

## Usage

Instead of putting controllers in one folder tree and models in another a la rails, koolaid provides a light DSL (yes, I know I just referenced two things with ruby associations, bare with me) the lets you specify your controller logic in the same place as your model logic.

n.b. I'm speaking in MVC terms (well, MC, since the V is pretty much always assumed to be toJSON()), but koolaid is not an MVC framework. It simply helps you mount your models on routes without tightly coupling model interactions to HTTP.

At this time, koolaid serves two main purposes:
1. binding methods to routes
2. access control plumbing.
3. context (provided by [continuation-local-storage](https://github.com/othiym23/node-continuation-local-storage))

The following examples will be a bit naive, but should provide a basic overview of what koolaid can do. See the documentation for RestModel for a base class that will likely get you started.

(The next few sections explain how to use koolaid's decorators - skip to the end to see how to initialize the library).

### Route Binding

Let's say we have a metrics backend that has the concept of a counter and we can increment and decrement counters for different gauges. Finally, assume we have reasonable db implementation available to us.

```JavaScript
class Counter {
  constructor(data) {
    data = data || {};
    this.count = data.count || 0;
  }
  async increment() {
    this.count++;
    await db.write(this);
  },
  async decrement() {
    this.count--;
    await db.write(this);
  }
}
```

Now, let's expose that Counter over HTTP. We need to indicate the Counter is a @resource and specify routes for `POST /counter/:id/increment` and `POST /count/:id/decrement`.

```JavaScript
@resource({basePath: `/counter`})
class Counter {
  constructor(data) {
    data = data || {};
    this.count = data.count || 0;
  }

  @method({verb: `POST`, path: `/:id/increment`})
  async increment() {
    this.count++;
    await db.write(this);
  }

  @method({verb: `POST`, path: `/:id/decrement`})
  async decrement() {
    this.count--;
    await db.write(this);
  }
}
```

Since these methods don't return anything, they'll return a 204 success instead of a 200.

But wait, you say. This looks like it'll expose some things to HTTP, but how does it deal with that `:id` routeParam? Well, we need to add one more method: `findById()`

1. `findById()` will be needed for any class that has non-static methods.
2. `findById()` is really a special case of `find()`, so if your models inherit from RestModel, `findById()` is implemented for you, but you'll need to implement `find()`.

```JavaScript
@resource({basePath: `/counter`})
class Counter {
  constructor(data) {
    data = data || {};
    this.count = data.count || 0;
  }

  @method({verb: `POST`, path: `/:id/increment`})
  async increment() {
    this.count++;
    await db.write(this);
  }

  @method({verb: `POST`, path: `/:id/decrement`})
  async decrement() {
    this.count--;
    await db.write(this);
  }

  static async findById(id) {
    const data = await db.getById(id);
    return new Counter(data);
  }
}
```

### Access Control

Now, let's assume we want admins to be able to fetch a particular counter's value (e.g. GET /counter/rpm) or all counters values (e.g. GET /counter) but that regular users shouldn't be able to.

Note: it's up to you figure out who the user is and populate `req.user` before koolaid starts.

```JavaScript
@resource({basePath: `/counter`})
class Counter {
  constructor(data) {
    data = data || {};
    this.count = data.count || 0;
  }

  @method({verb: `POST`, path: `/:id/increment`})
  async increment() {
    this.count++;
    await db.write(this);
  }

  @method({verb: `POST`, path: `/:id/decrement`})
  async decrement() {
    this.count--;
    await db.write(this);
  }

  static async findById(id) {
    const data = await db.getById(id);
    return new Counter(data);
  }

  @method({verb: `GET`, path: `/`})
  @access((user) => {
    return user.isAdmin();
  })
  static async getAll() {
    const counters = await db.getAll();
    return counters;
  }

  @method({verb: `GET`, path: `/:id`})
  @access((user) => {
    return user.isAdmin();
  })
  getOne() {
    return this;
  }
}
```

Now, we've added both a static and a non-static GET method for retrieving counter data. Note that since the model gets loaded automatically for routes with the `:id` route parameter, the non-static GET doesn't need to do much of anything - all the work is done internally.

### Context

Context (for lack of a better term) is a way to pass arbitrary data throughout a resource's methods. Every method (static and non-static alike) of a class decorated with @resource gets an extra argument added to its parameter list, `ctx`. ctx is a continuation-local-storage namespace with several things bound to it already; more can be bound by passing a function to koolaid's initializer (described later).

The built-in properties are
- `req`: Express's HttpRequest
- `res`: Express's HttpResponse
- `user`: extraced from `req.user`
- `Model`: The constructor use for the current resource (useful when the method being invoked is defined in a parent class of the resource)
- `model`: The model auto-loaded via the `:id` route parameter (mostly used internally since your logic is probably in a non-static method where `this === ctx.get('model')`
- `logger`: By default, `ctx.get('logger')` is simply `console`, but you can override it with your own.

For this section, let's use a slightly more abstract example. In this case, when we call our create method, we'll proxy to a third party service. If the third-party service call fails, we want to log that error, but send back a 502.

```JavaScript
@resource({basePath: `/my-resource`})
class MyResource {
  static async create(ctx) {
    try {
      const data = await thirdParty.create()
      return new MyResource(data);
    }
    catch (e) {
      ctx.get(`logger`).error(e);
      throw new BadGateway(`It looks like we're having a problem with one of our vendors. Please try again later`);
    }
  }
}
```

Now, let's get fancy. If we initialize koolaid with a custom context function, we can provide a more robust logging implementation.

```JavaScript
function context(ctx) {
  const req = ctx.get(`req`);
  const user = ctx.get(`user`);

  const logger = Object.keys(console).reduce((logger, key) => {
    logger[key] = function(...args) {
      console[key]({
        user: user.id,
        requestId: req.headers[`x-request-id`]
      }, ...args);
    };
    return logger;
  }, {});
  ctx.set(`logger`, logger);
}
```

Now, we'll have some extra metadata for every log statement. Note that `context()` gets called pretty early in koolaid's request handling process, so only `req`, `res`, and `user` will be available. If you haven't already populated `req.user`, you could instead inject user directly into `ctx` here.

### Initialization

This is all well and good, you say, but, how do we turn it on? Well, it initializes like most any other Express middleware.

```JavaScript

import express from 'express';
import koolaid from 'koolaid';

const app = express();
app.use(koolaid({
  models: path.join(__dirname, `models`)
  context(ctx) {
    ctx.set(`logger`, myFancyLogger)
  }
}));
```

The only required property is `models` which is a path to a directory containing your model definitions. `path.join` is probably the easiest way to make sure the path resolves, but as longs as it's a path that can be found by [requireDir](https://www.npmjs.com/package/require-dir), it'll work.

Optionally, you can also pass in a `context()` function to add extra data to each invocation.

## Caveats

Koolaid is a collection of [es7 decorators](https://github.com/wycats/javascript-decorators), which means your app needs to support es7 decorators and decorators are still a very early spec. So early, in fact, that due to pending changes, they're only supported in Babel 5.x and not 6.x.

You must (a) enable the babel option "es7.decorators" and (b) make sure you're using babel 5.x.

So far, it looks like you *must* use the babel require hook as follows in order to ensure koolaid gets transpiled without impacting your other node modules. This assumes you have `src` and `test` directories.

```JavaScript
require('babel/register')({
  only: /(?:node_modules.*?koolaid\/src)|(?:src)|(?:test)/
});
```
