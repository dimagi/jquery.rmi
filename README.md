# rmi-ng

[![Build Status](https://travis-ci.org/dimagi/rmi-ng.svg?branch=master)](https://travis-ci.org/dimagi/rmi-ng)

*rmi-ng* is a light-weight RPC library inspired by
[django-angular RMI](http://django-angular.readthedocs.org/en/latest/remote-method-invocation.html).
and [AngularJS](https://angularjs.org/). With it you can use django-angular view
method decorators and template tags, and then call those methods from javascript
with jQuery instead of AngularJS.


## Installation

    npm install dimagi/rmi-ng


## Usage

Stand-alone RMI against any JSON/REST server:

```js
var rmi = RMI("/some/url", "optional-csrf-token");
rmi("remote_method_name", {arbitrary: "object"})
    .done(function (data) {
        // handle success
        // data: deserialized JSON object returned by the remote method
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        // handle error
    });
```

With django-angular template tags:

`djng_current_rmi` tag:
```js
var rmi = RMI({% djng_current_rmi %}, "optional-csrf-token");
rmi.remote_method_name({arbitrary: "object"})
    .done(function (result) { /* ... */ })
    .fail(function (jqXHR, textStatus, errorThrown) { /* ... */ });
```

`djng_all_rmi` tag (requires named views):
```js
var rmi = RMI({% djng_all_rmi %}, "optional-csrf-token");
rmi.viewname.remote_method_name({arbitrary: "object"})
    .done(function (data) { /* ... */ })
    .fail(function (jqXHR, textStatus, errorThrown) { /* ... */ });
```

*rmi-ng* is a simple wrapper around `jQuery.ajax()`. It automatically converts
the argument (when provided) to JSON (*rmi-ng* feature), and automatically
deserializes the returned response as JSON if the server responds with a
content type of `application/json` (`jQuery.ajax()` feture).


## Running tests

Run any of the following:

    mocha

    mocha --watch

    npm test # also runs jshint

django-angular tests must be run in a browser after starting the django server:

    cd django-site
    # mkvirtualenv rmi-ng
    pip install -r requirements.txt
    ./manage.py runserver
    # open http://localhost:8000
