describe("RMI-NG", function () {
    var assert = chai.assert,
        csrftoken = jQuery.cookie('csrftoken');

    it("should invoke current tags method", function (done) {
        var rmi = RMI(currentTags, csrftoken),
            data = {key: "val"};
        rmi.process_data(data)
            .done(function (result) {
                assert.deepEqual(result.foo, "bar");
                assert.deepEqual(result.input, data);
                assert.deepEqual(result.success, true);
                done();
            })
            .fail(function (req, status, error) { throw error; });
    });

    it("should invoke all tags method", function (done) {
        var rmi = RMI(allTags, csrftoken),
            data = {key: "val"};
        rmi.rmiview.process_data(data)
            .done(function (result) {
                assert.deepEqual(result.foo, "bar");
                assert.deepEqual(result.input, data);
                assert.deepEqual(result.success, true);
                done();
            })
            .fail(function (req, status, error) { throw error; });
    });
});
