/**
 * Remote Method Invocation object
 *
 * Usage:
 *
 *  var rmi = RMI("/some/url", "optional-csrf-token");
 *  rmi("remote_method_name", {arbitrary: "json data"})
 *      .done(function (data) {
 *          // handle success
 *          // data is deserialized JSON object returned by remote method
 *      })
 *      .fail(function (data) {
 *          // handle error
 *          // data: {
 *          //     jqXHR: jqXHR,
 *          //     textStatus: textStatus,
 *          //     errorThrown: errorThrown,
 *          // }
 *          // This callback will be invoked on remote error
 *          // or if the returned data was not valid JSON.
 *      });
 */
function RMI(baseUrl, csrfToken, ajax) {
    if (ajax === undefined) {
        ajax = require("jquery").ajax;
    }

    function rmi(method, data) {
        var url = join(baseUrl, method);
            options = {
                method: "POST",
                data: JSON.stringify(data),
                beforeSend: function (xhr) {
                    if (csrfToken && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", csrfToken);
                    }
                }
            };
        return promise(ajax(url, options));
    }

    function promise(request) {
        var success = [],
            error = [],
            pending = {},
            result = pending;
        request.done(function (data, textStatus, jqXHR) {
            try {
                result = {success: true, obj: JSON.parse(data)};
            } catch (errorThrown) {
                result = {error: true, obj: {
                    jqXHR: jqXHR,
                    textStatus: textStatus,
                    errorThrown: errorThrown,
                    data: data,
                }};
            }
            callEach(result.success ? success : error, result.obj);
        });
        request.fail(function (jqXHR, textStatus, errorThrown) {
            result = {error: true, obj: {
                jqXHR: jqXHR,
                textStatus: textStatus,
                errorThrown: errorThrown,
            }};
            callEach(error, result.obj);
        });
        return {
            request: request,
            /**
             * Register success callback
             *
             * Callback will be called immediately if the result is available.
             */
            done: function (callback) {
                if (result === pending) {
                    success.push(callback);
                } else if (result.success) {
                    callback(result.obj);
                }
            },
            /**
             * Register error callback
             *
             * Callback will be called immediately if the remote method
             * has responded with an error.
             */
            fail: function (callback) {
                if (result === pending) {
                    error.push(callback);
                } else if (result.error) {
                    callback(result.obj);
                }
            }
        };
    }

    function callEach(callbacks, arg) {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](arg);
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

    return rmi;
}

module.exports = RMI;
