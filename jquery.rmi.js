/**
 * Remote Method Invocation object
 *
 * Usage:
 *
 *  var rmi = RMI("/some/url", "optional-csrf-token");
 *  rmi("remote_method_name", {arbitrary: "object"})
 *      .done(function (data) {
 *          // handle success
 *          // data: deserialized JSON object returned by the remote method
 *      })
 *      .fail(function (jqXHR, textStatus, errorThrown) {
 *          // handle error
 *      });
 *
 *
 * Alternate usage with django-angular template tags:
 *
 *  var rmi = RMI({% djng_current_rmi %}, "optional-csrf-token");
 *  rmi.remote_method_name({arbitrary: "object"})
 *      .done(function (result) { ... })
 *      .fail(function (jqXHR, textStatus, errorThrown) { ... });
 *
 *  var rmi = RMI({% djng_all_rmi %}, "optional-csrf-token");
 *  rmi.viewname.remote_method_name({arbitrary: "object"})
 *      .done(function (result) { ... })
 *      .fail(function (jqXHR, textStatus, errorThrown) { ... });
 */
function RMI(baseUrl, csrfToken, ajax) {

    function rmi(func, data, options) {
        var config = {
            processData: false,
            contentType: 'application/json',
        };
        if (options) {
            if (options && options.method === "POST" && data === undefined) {
                throw new Error(
                    "Calling remote method " + func + " without data object");
            }
            each(options, function (val, name) { config[name] = val; });
        }
        if (config.method === "auto" || config.method === undefined) {
            config.method = data === undefined ? "GET" : "POST";
        }
        config.data = JSON.stringify(data);
        config.url = baseUrl;
        config.beforeSend = function (xhr) {
            if (csrfToken && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrfToken);
            }
            xhr.setRequestHeader("DjNg-Remote-Method", func);
        };
        return ajax(config);
    }

    function makeMethod(name, method, byUrl) {
        var rmi;
        if (byUrl.hasOwnProperty(method.url)) {
            rmi = byUrl[method.url];
        } else {
            rmi = byUrl[method.url] = RMI(method.url, csrfToken, ajax);
        }
        return function (data) {
            if (method.method === "POST" && data === undefined) {
                throw new Error(
                    "Calling remote method " + name + " without data object");
            }
            return rmi("", data, method);
        };
    }

    function configureMethods(rmi, obj, byUrl) {
        each(obj, function (val, name) {
            if (val.hasOwnProperty("url")) {
                rmi[name] = makeMethod(name, val, byUrl);
            } else {
                // recursive config
                rmi[name] = {};
                configureMethods(rmi[name], val, byUrl);
            }
        });
    }

    function each(obj, func) {
        var name;
        for (name in obj) {
            if (obj.hasOwnProperty(name)) {
                func(obj[name], name);
            }
        }
    }

    function join(base, rel) {
        if (base.slice(-1) === "/") {
            base = base.slice(0, -1);
        }
        if (rel[0] === "/" || rel.slice(-1) === "/") {
            throw new Error("invalid method name: " + rel);
        }
        return [base, "/", rel, (rel ? "/" : "")].join("");
    }

    if (ajax === undefined) {
        if (typeof jQuery !== "undefined") {
            ajax = jQuery.ajax;
        } else {
            ajax = require("jquery").ajax;
        }
    }
    if (typeof baseUrl !== "string") {
        configureMethods(rmi, baseUrl, {});
        //baseUrl = window.location;
    }
    return rmi;
}

if (typeof module !== "undefined") {
    module.exports = RMI;
}
