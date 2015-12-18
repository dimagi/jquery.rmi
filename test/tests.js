describe("jquery.rmi", function () {
    var assert = require("chai").assert,
        RMI = require("../jquery.rmi.js"),
        rmi = RMI("/", null, fakeAjax);

    it("should perform a remote method invocation", function (done) {
        var data = {key: "val"};
        rmi("ok", data).done(function (result) {
            assert.deepEqual(result, data);
            done();
        });
    });

    it("should fail on remote error", function (done) {
        var request = rmi("err", {key: "val"});
        request.fail(function (req, stat, err) {
            assert.deepEqual([req, stat, err], [request, "404", "not found"]);
            done();
        });
    });

    it("should not post without data", function () {
        assert.throws(function () {
            rmi("postIt", undefined, {method: "POST"});
        }, /Calling remote method postIt without data object/);
    });

    it("should set CSRF token header", function () {
        var rmi = RMI("/", "csrf-token", fakeAjax);
            request = rmi("ok", {});
        assert.deepEqual(request.headers, {"X-CSRFToken": "csrf-token"});
    });

    it("should not set CSRF token header on cross domain request", function () {
        var rmi = RMI("/", "csrf-token", fakeAjax);
            request = rmi("ok", {crossDomain: true});
        assert.deepEqual(request.headers, {});
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

function fakeAjax(options) {
    var url = options.url,
        dones = {
            "/ok/": function (callback) {
                setTimeout(function () {
                    callback(JSON.parse(options.data), "200", request);
                }, 0);
            },
        },
        fails = {
            "/err/": function (callback) {
                setTimeout(function () {
                    callback(request, "404", "not found");
                }, 0);
            },
        },
        request = {
            headers: {},
            done: function (callback) {
                if (dones.hasOwnProperty(url)) {
                    dones[url](callback);
                }
                return request;
            },
            fail: function (callback) {
                if (fails.hasOwnProperty(url)) {
                    fails[url](callback);
                }
                return request;
            }
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
    if (!dones.hasOwnProperty(url) && !fails.hasOwnProperty(url)) {
        throw new Error("unknown url: " + url);
    }
    return request;
}
