describe("RMI-NG", function () {
    var assert = require("chai").assert,
        RMI = require("../rmi-ng.js"),
        rmi = RMI("/", null, fakeAjax);

    it("should perform a remote method invocation", function (done) {
        var data = {key: "val"};
        rmi("ok", data).done(function (result) {
            assert.deepEqual(result, data);
            done();
        });
    });

    it("should fail on remote error", function (done) {
        var promise = rmi("err", {key: "val"});
        promise.fail(function (result) {
            assert.deepEqual(result, {
                jqXHR: promise.request,
                textStatus: "404",
                errorThrown: "not found",
            });
            done();
        });
    });

    it("fail on return bad JSON", function (done) {
        var promise = rmi("bad-json", {key: "val"});
        promise.fail(function (result) {
            assert.equal(result.jqXHR, promise.request);
            assert.equal(result.textStatus, "200");
            assert.isDefined(result.errorThrown);
            assert.equal(result.data, '{"bad-json"}');
            done();
        });
    });

    it("should call done callback after request completes", function () {
        var data = {key: "val"},
            result;
        rmi("sync/ok", data).done(function (r) { result = r; });
        assert.deepEqual(result, data);
    });

    it("should call failed callback after request completes", function () {
        var promise = rmi("sync/err", {key: "val"}),
            result;
        promise.fail(function (r) { result = r; });
        assert.deepEqual(result, {
            jqXHR: promise.request,
            textStatus: "404",
            errorThrown: "not found",
        });
    });

    it("should set CSRF token header", function () {
        var rmi = RMI("/", "csrf-token", fakeAjax);
            promise = rmi("ok", {});
        assert.deepEqual(promise.request.headers, {"X-CSRFToken": "csrf-token"});
    });

    it("should not set CSRF token header on cross domain request", function () {
        var rmi = RMI("/", "csrf-token", fakeAjax);
            promise = rmi("ok", {crossDomain: true});
        assert.deepEqual(promise.request.headers, {});
    });

    describe("path concatenator", function () {
        it("should support base url without trailing slash", function (done) {
            var rmi = RMI("/ok", null, fakeAjax);
            rmi("", {}).done(function () { done(); });
        });

        it("should error on method with leading slash", function () {
            var rmi = RMI("/", null, fakeAjax);
            assert.throws(function () { rmi("/ok"); }, /: \/ok/);
        });

        it("should error on method with trailing slash", function () {
            var rmi = RMI("/", null, fakeAjax);
            assert.throws(function () { rmi("ok/"); }, /: ok\//);
        });
    });
});

function fakeAjax(url, options) {
    var dones = {
            "/ok/": function (callback) {
                setTimeout(function () {
                    callback(options.data, "200", request);
                }, 0);
            },
            "/sync/ok/": function (callback) {
                callback(options.data, "200", request);
            },
            "/bad-json/": function (callback) {
                setTimeout(function () {
                    callback('{"bad-json"}', "200", request);
                }, 0);
            }
        },
        fails = {
            "/err/": function (callback) {
                setTimeout(function () {
                    callback(request, "404", "not found");
                }, 0);
            },
            "/sync/err/": function (callback) {
                callback(request, "404", "not found");
            },
        },
        request = {
            done: function (callback) {
                if (dones.hasOwnProperty(url)) {
                    dones[url](callback);
                }
            },
            fail: function (callback) {
                if (fails.hasOwnProperty(url)) {
                    fails[url](callback);
                }
            },
            headers: {},
        };
    if (options.beforeSend) {
        var xhr = {
                crossDomain: JSON.parse(options.data).crossDomain,
                setRequestHeader: function (name, value) {
                    request.headers[name] = value;
                }
            };
        options.beforeSend.call(xhr, xhr);
    }
    if (options.method !== "POST") {
        throw new Error("bad method: " + options.method);
    }
    if (!dones.hasOwnProperty(url) && !fails.hasOwnProperty(url)) {
        throw new Error("unknown url: " + url);
    }
    return request;
}
