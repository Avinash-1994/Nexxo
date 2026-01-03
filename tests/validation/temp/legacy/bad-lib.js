
        var internal = "secret";
        module.exports = function() { return internal; };
        module.exports.foo = "bar";
        Object.defineProperty(exports, "live", { get: () => Date.now() });
    