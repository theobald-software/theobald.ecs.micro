(function() {
        var moduleName = 'theobald.ecs.micro',
            t = window.theobald || (window.theobald = {});
            
        t.moduleName = moduleName;

/*! Theobald Async Support (Deferred) Javascript Component | (c) Theobald Software GmbH | theobald-software.com
 */
/* Max Grass
 *
 * Date created:     01.02.2016
 *
 * Commercial licenses may be obtained at http://theobald-software.com
 * (sales@theobald-software.com, support@theobald-software.com)
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
// Original Deferred.js licensed under an MIT licence. Copyright 2012 © Nicolas Ramz
/*jshint browser:true*/
/*global define*/
//
// EXECUTED INLINE - NOT A MODULE, MUST BE EMBEDDED.
(function() {
    var t = window.theobald || (window.theobald = {}),
        empty = '';

    // deferred/promise
    var assignDeferredConstructorToObject = function(global) {
        function isArray(arr) {
            return Object.prototype.toString.call(arr) === '[object Array]';
        }

        function foreach(arr, handler) {
            if (isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    handler(arr[i]);
                }
            } else
                handler(arr);
        }

        function D(fn) {
            var status = 'pending',
                doneFuncs = [],
                failFuncs = [],
                progressFuncs = [],
                resultArgs = null,

                promise = {
                    done: function() {
                        for (var i = 0; i < arguments.length; i++) {
                            // skip any undefined or null arguments
                            if (!arguments[i]) {
                                continue;
                            }

                            if (isArray(arguments[i])) {
                                var arr = arguments[i];
                                for (var j = 0; j < arr.length; j++) {
                                    // immediately call the function if the deferred has been resolved
                                    if (status === 'resolved') {
                                        arr[j].apply(this, resultArgs);
                                    }

                                    doneFuncs.push(arr[j]);
                                }
                            } else {
                                // immediately call the function if the deferred has been resolved
                                if (status === 'resolved') {
                                    arguments[i].apply(this, resultArgs);
                                }

                                doneFuncs.push(arguments[i]);
                            }
                        }

                        return this;
                    },

                    fail: function() {
                        for (var i = 0; i < arguments.length; i++) {
                            // skip any undefined or null arguments
                            if (!arguments[i]) {
                                continue;
                            }

                            if (isArray(arguments[i])) {
                                var arr = arguments[i];
                                for (var j = 0; j < arr.length; j++) {
                                    // immediately call the function if the deferred has been resolved
                                    if (status === 'rejected') {
                                        arr[j].apply(this, resultArgs);
                                    }

                                    failFuncs.push(arr[j]);
                                }
                            } else {
                                // immediately call the function if the deferred has been resolved
                                if (status === 'rejected') {
                                    arguments[i].apply(this, resultArgs);
                                }

                                failFuncs.push(arguments[i]);
                            }
                        }

                        return this;
                    },

                    always: function() {
                        return this.done.apply(this, arguments).fail.apply(this, arguments);
                    },

                    progress: function() {
                        for (var i = 0; i < arguments.length; i++) {
                            // skip any undefined or null arguments
                            if (!arguments[i]) {
                                continue;
                            }

                            if (isArray(arguments[i])) {
                                var arr = arguments[i];
                                for (var j = 0; j < arr.length; j++) {
                                    // immediately call the function if the deferred has been resolved
                                    if (status === 'pending') {
                                        progressFuncs.push(arr[j]);
                                    }
                                }
                            } else {
                                // immediately call the function if the deferred has been resolved
                                if (status === 'pending') {
                                    progressFuncs.push(arguments[i]);
                                }
                            }
                        }

                        return this;
                    },

                    then: function() {
                        // fail callbacks
                        if (arguments.length > 1 && arguments[1]) {
                            this.fail(arguments[1]);
                        }

                        // done callbacks
                        if (arguments.length > 0 && arguments[0]) {
                            this.done(arguments[0]);
                        }

                        // notify callbacks
                        if (arguments.length > 2 && arguments[2]) {
                            this.progress(arguments[2]);
                        }
                    },

                    promise: function(obj) {
                        if (obj == null) {
                            return promise;
                        } else {
                            for (var i in promise) {
                                obj[i] = promise[i];
                            }
                            return obj;
                        }
                    },

                    state: function() {
                        return status;
                    },

                    debug: function() {
                        console.log('[debug]', doneFuncs, failFuncs, status);
                    },

                    isRejected: function() {
                        return status === 'rejected';
                    },

                    isResolved: function() {
                        return status === 'resolved';
                    },

                    pipe: function(done, fail, progress) {
                        return D(function(def) {
                            foreach(done, function(func) {
                                // filter function
                                if (typeof func === 'function') {
                                    deferred.done(function() {
                                        var returnval = func.apply(this, arguments);
                                        // if a new deferred/promise is returned, its state is passed to the current deferred/promise
                                        if (returnval && typeof returnval === 'function') {
                                            returnval.promise().then(def.resolve, def.reject, def.notify);
                                        } else { // if new return val is passed, it is passed to the piped done
                                            def.resolve(returnval);
                                        }
                                    });
                                } else {
                                    deferred.done(def.resolve);
                                }
                            });

                            foreach(fail, function(func) {
                                if (typeof func === 'function') {
                                    deferred.fail(function() {
                                        var returnval = func.apply(this, arguments);

                                        if (returnval && typeof returnval === 'function') {
                                            returnval.promise().then(def.resolve, def.reject, def.notify);
                                        } else {
                                            def.reject(returnval);
                                        }
                                    });
                                } else {
                                    deferred.fail(def.reject);
                                }
                            });
                        }).promise();
                    }
                },

                deferred = {
                    resolveWith: function(context) {
                        if (status === 'pending') {
                            status = 'resolved';
                            var args = resultArgs = (arguments.length > 1) ? arguments[1] : [];
                            for (var i = 0; i < doneFuncs.length; i++) {
                                doneFuncs[i].apply(context, args);
                            }
                        }
                        return this;
                    },

                    rejectWith: function(context) {
                        if (status === 'pending') {
                            status = 'rejected';
                            var args = resultArgs = (arguments.length > 1) ? arguments[1] : [];
                            for (var i = 0; i < failFuncs.length; i++) {
                                failFuncs[i].apply(context, args);
                            }
                        }
                        return this;
                    },

                    notifyWith: function(context) {
                        if (status === 'pending') {
                            var args = resultArgs = (arguments.length > 1) ? arguments[1] : [];
                            for (var i = 0; i < progressFuncs.length; i++) {
                                progressFuncs[i].apply(context, args);
                            }
                        }
                        return this;
                    },

                    resolve: function() {
                        return this.resolveWith(this, arguments);
                    },

                    reject: function() {
                        return this.rejectWith(this, arguments);
                    },

                    notify: function() {
                        return this.notifyWith(this, arguments);
                    }
                }

            var obj = promise.promise(deferred);

            if (fn) {
                fn.apply(obj, [obj]);
            }

            return obj;
        }

        D.when = function() {
            if (arguments.length < 2) {
                var obj = arguments.length ? arguments[0] : undefined;
                if (obj && (typeof obj.isResolved === 'function' && typeof obj.isRejected === 'function')) {
                    return obj.promise();
                } else {
                    return D().resolve(obj).promise();
                }
            } else {
                return (function(args) {
                    var df = D(),
                        size = args.length,
                        done = 0,
                        rp = new Array(size); // resolve params: params of each resolve, we need to track down them to be able to pass them in the correct order if the master needs to be resolved

                    for (var i = 0; i < args.length; i++) {
                        (function(j) {
                            var obj = null;

                            if (args[j].done) {
                                args[j].done(function() {
                                        rp[j] = (arguments.length < 2) ? arguments[0] : arguments;
                                        if (++done == size) {
                                            df.resolve.apply(df, rp);
                                        }
                                    })
                                    .fail(function() {
                                        df.reject(arguments);
                                    });
                            } else {
                                obj = args[j];
                                args[j] = new Deferred();

                                args[j].done(function() {
                                        rp[j] = (arguments.length < 2) ? arguments[0] : arguments;
                                        if (++done == size) {
                                            df.resolve.apply(df, rp);
                                        }
                                    })
                                    .fail(function() {
                                        df.reject(arguments);
                                    }).resolve(obj);
                            }
                        })(i);
                    }

                    return df.promise();
                })(arguments);
            }
        }

        global.Deferred = D;
    };

    assignDeferredConstructorToObject(t);

    // Deferred extension

    t.newDeferred = function() {
        return new t.Deferred();
    };

    var deferreds = t.deferreds || (t.deferreds = {});

    t.getDeferred = function(name) {
        return deferreds[name] || (deferreds[name] = t.newDeferred());
    };

    var ecsDeferred = t.getDeferred('Ecs');
    t.ready = ecsDeferred.promise();

    // Main enter point for external functions

    t.ready = t.ecsMicroReady = function(f) {
        return ecsDeferred.done(f);
    };

    //return t;
})();
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../lib/almond/almond.js", function(){});

// ajax
define('theobald.ajax',[],function() {
    var t = window.theobald || (window.theobald = {});

    var type = function(x) {
        return typeof(x);
    };

    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/

    var ajax = function(options) {
        var settings = extend({}, options || {})
        for (key in ajax.settings)
            if (settings[key] === undefined) settings[key] = ajax.settings[key]

        ajaxStart(settings)

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
            RegExp.$2 != window.location.host

        var dataType = settings.dataType,
            hasPlaceholder = /=\?/.test(settings.url)
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
            return ajax.JSONP(settings)
        }

        if (!settings.url) settings.url = window.location.toString()
        serializeData(settings)

        var mime = settings.accepts[dataType],
            baseHeaders = {},
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = ajax.settings.xhr(),
            abortTimeout

        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
        if (mime) {
            baseHeaders['Accept'] = mime
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
            baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
        settings.headers = extend(baseHeaders, settings.headers || {})

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                clearTimeout(abortTimeout)
                var result, error = false
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
                    result = xhr.responseText

                    try {
                        if (dataType == 'script')(1, eval)(result)
                        else if (dataType == 'xml') result = xhr.responseXML
                        else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
                    } catch (e) {
                        error = e
                    }

                    if (error) ajaxError(error, 'parsererror', xhr, settings)
                    else ajaxSuccess(result, xhr, settings)
                } else {
                    ajaxError(null, 'error', xhr, settings)
                }
            }
        }

        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async)

        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort()
            return false
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function() {
            xhr.onreadystatechange = empty
            xhr.abort()
            ajaxError(null, 'timeout', xhr, settings)
        }, settings.timeout)

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr
    }


    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        //todo: Fire off some events
        //var event = $.Event(eventName)
        //$(context).trigger(event, data)
        return true; //!event.defaultPrevented
    }

    // trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    // Number of active Ajax requests
    ajax.active = 0

    function ajaxStart(settings) {
        if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }

    function ajaxStop(settings) {
        if (settings.global && !(--ajax.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
            return false

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess(data, xhr, settings) {
        var context = settings.context,
            status = 'success'
        settings.success.call(context, data, status, xhr)
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
        ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        ajaxStop(settings)
    }

    // Empty function, used as default callback
    function empty() {}

    ajax.JSONP = function(options) {
        if (!('type' in options)) return ajax(options)

        var callbackName = 'jsonp' + (++jsonpID),
            script = document.createElement('script'),
            abort = function() {
                //todo: remove script
                //$(script).remove()
                if (callbackName in window) window[callbackName] = empty
                ajaxComplete('abort', xhr, options)
            },
            xhr = {
                abort: abort
            },
            abortTimeout,
            head = document.getElementsByTagName("head")[0] || document.documentElement

        if (options.error) script.onerror = function() {
            xhr.abort()
            options.error()
        }

        window[callbackName] = function(data) {
            clearTimeout(abortTimeout)
                //todo: remove script
                //$(script).remove()
            delete window[callbackName]
            ajaxSuccess(data, xhr, options)
        }

        serializeData(options)
        script.src = options.url.replace(/=\?/, '=' + callbackName)

        // Use insertBefore instead of appendChild to circumvent an IE6 bug.
        // This arises when a base node is used (see jQuery bugs #2709 and #4378).
        head.insertBefore(script, head.firstChild);

        if (options.timeout > 0) abortTimeout = setTimeout(function() {
            xhr.abort()
            ajaxComplete('timeout', xhr, options)
        }, options.timeout)

        return xhr
    }

    ajax.settings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function() {
            return new window.XMLHttpRequest()
        },
        // MIME types mapping
        accepts: {
            script: 'text/javascript, application/javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0
    }

    function mimeToDataType(mime) {
        return mime && (mime == htmlType ? 'html' :
            mime == jsonType ? 'json' :
            scriptTypeRE.test(mime) ? 'script' :
            xmlTypeRE.test(mime) && 'xml') || 'text'
    }

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (type(options.data) === 'object') options.data = param(options.data)
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
            options.url = appendQuery(options.url, options.data)
    }

    ajax.get = function(url, success) {
        return ajax({
            url: url,
            success: success
        })
    }

    ajax.post = function(url, data, success, dataType) {
        if (type(data) === 'function') dataType = dataType || success, success = data, data = null
        return ajax({
            type: 'POST',
            url: url,
            data: data,
            success: success,
            dataType: dataType
        });
    }

    ajax.getJSON = function(url, success) {
        return ajax({
            url: url,
            success: success,
            dataType: 'json'
        })
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
        var array = type(obj) === 'array';
        for (var key in obj) {
            var value = obj[key];

            if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
                // handle data in serializeArray() format
            if (!scope && array) params.add(value.name, value.value)
                // recurse into nested objects
            else if (traditional ? (type(value) === 'array') : (type(value) === 'object'))
                serialize(params, value, traditional, key)
            else params.add(key, value)
        }
    }

    function param(obj, traditional) {
        var params = []
        params.add = function(k, v) {
            this.push(escape(k) + '=' + escape(v))
        }
        serialize(params, obj, traditional)
        return params.join('&').replace('%20', '+')
    }

    function extend(target) {
        var slice = Array.prototype.slice;
        slice.call(arguments, 1).forEach(function(source) {
            for (key in source)
                if (source[key] !== undefined)
                    target[key] = source[key];
        })
        return target;
    }

    t.ajax = ajax;
    return ajax;
});

/*! Theobald Utils Javascript Component | (c) Theobald Software GmbH | theobald-software.com
 */
/* Max Grass
 *
 * Date created:     01.02.2016
 *
 * Commercial licenses may be obtained at http://theobald-software.com
 * (sales@theobald-software.com, support@theobald-software.com)
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
// Original Deferred.js licensed under an MIT licence. Copyright 2012 © Nicolas Ramz
/*jshint browser:true*/
/*global define*/
define('theobald.util',[],function() {
    var t = window.theobald || (window.theobald = {}),
        util = t.util || (t.util = {});
    //
    // lodash assign embedded
    util._extendInternal = function(object, source, guard) {
        var objectTypes = {
            'boolean': false,
            'function': true,
            'object': true,
            'number': false,
            'string': false,
            'undefined': false
        };

        var index, iterable = object,
            result = iterable;
        if (!iterable) {
            return result;
        }
        var args = arguments,
            argsIndex = 0,
            argsLength = typeof guard == 'number' ? 2 : args.length,
            callback;
        if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
            callback = args[--argsLength];
        }
        while (++argsIndex < argsLength) {
            iterable = args[argsIndex];
            if (iterable && objectTypes[typeof iterable]) {
                var ownIndex = -1,
                    ownProps = objectTypes[typeof iterable] && Object.keys(iterable),
                    length = ownProps ? ownProps.length : 0;

                while (++ownIndex < length) {
                    var callbackResult;
                    index = ownProps[ownIndex];
                    if (callback) {
                        callbackResult = callback(result[index], iterable[index], index, result, iterable);
                        if (callbackResult !== undefined) {
                            result[index] = callbackResult;
                        }
                    } else {
                        result[index] = iterable[index];
                    }
                }
            }
        }

        return result;
    };

    util._extend = util._deepExtend = function() {
        var args = [].slice.call(arguments);
        args.push(util._extendFilterDeep);

        return util._extendInternal.apply(this, args);
    };

    util._extendSkipEmptyStrings = function() {
        var args = [].slice.call(arguments);
        args.push(util._extendFilterDeepSkipEmptyStrings);

        return util._extendInternal.apply(this, args);
    };

    // http://stackoverflow.com/questions/12317003
    // todo test special constructors as "Date"
    // todo port to core
    // "obj" will be mutated, so use ({}, objecttocopy,...)
    util._merge = function() {
        //var self = this;
        Array.prototype.slice.call(arguments, 1).forEach(function(source) {
            if (source) {
                for (var prop in source) {
                    if (source[prop] !== null && (source[prop].constructor === Object)) {
                        if (!obj[prop] || obj[prop].constructor === Object) {
                            obj[prop] = obj[prop] || {};
                            util._merge(obj[prop], source[prop]);
                        } else {
                            obj[prop] = source[prop];
                        }
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
        });
        return obj;
    };

    // replace only if new parameter is valid aka not empty or undefined
    util._extendFilterDeep = function(receiver, mergee) { //, index, outerObj, outerSrc
        // deep extend
        if (typeof receiver === 'object' && typeof mergee === 'object') {
            return util._extendInternal(receiver, mergee, util._extendFilterDeep);
        }
        // types differ, override
        if (mergee !== undefined) {
            return mergee;
        }
        if (receiver !== undefined) {
            return receiver;
        }
        // skip setting property, which is undefined in mergee and doesn't exist in receiver
        return undefined;
    };

    util._extendFilterDeepSkipEmptyStrings = function(receiver, mergee) {
        // deep extend
        if (typeof receiver === 'object' && typeof mergee === 'object') {
            return util._extendInternal(receiver, mergee, util._extendFilterDeepSkipEmptyStrings);
        }
        // types differ, override
        if (mergee !== undefined) {
            // mergee === 0, receiver === 1 >> will be replaced,
            // mergee === true, receiver === false >> will be replaced
            // mergee === "", receiver === "x" >> will NOT be replaced
            if (mergee === '' && (receiver !== undefined || receiver !== null)) {
                return receiver;
            }

            return mergee;
        }

        return receiver;

        // skip setting property, which is undefined in mergee and doesn't exist in receiver
        //return undefined;
    };

    // I. first parameter - format string
    // next parameters - actual parameters to be put into the format string
    // format('my first parameter: {0}; my second parameter: {1}', firstParameter, secondParameter)
    //
    // II. first parameter - format string with named parameters
    // second parameter object of named parameters {parameter1: 'x', parameter2: 'y'}
    // format('my {which} parameter', {which: 'awesome'})
    //http://stackoverflow.com/questions/1038746
    util.format = function(str, col) {
        col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

        return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function(m, n) {
            if (m == '{{') {
                return '{';
            }
            if (m == '}}') {
                return '}';
            }
            return col[n];
        });
    };

    //
    //#endregion utils
    //

    return util;
});

/*! Theobald Ecs Javascript Component | (c) Theobald Software GmbH | theobald-software.com
 */
/* Max Grass
 *
 * Date created:     24.06.2013
 *
 * Commercial licenses may be obtained at http://theobald-software.com
 * (sales@theobald-software.com, support@theobald-software.com)
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
/*jshint browser:true*/
/*global define*/
define('theobald.ecs',['theobald.ajax', 'theobald.util'], function(_ajax, _util) {
    var t = window.theobald || (window.theobald = {}),
        deferreds = t.deferreds || (t.deferreds = {}),
        ns = 'Ecs',
        objectName = ns.toLowerCase(),
        constants = {
            colonSpace: ': ',
            empty: '',
            htmlLineBreak: '<br/>',
            literalLineBreak: '\n',
            literalNewLineReturn: '\r\n',
            slash: '/',
            space: ' ',
            charZero: '0'
        },
        empty = constants.empty,
        session = {
            sponline: false
        },
        actions,
        ajax = _ajax,
        util = _util,
        newDeferred = t.newDeferred;

    if (t[objectName]) {
        return t[objectName];
    }

    // Constructor
    t[ns] = function() {};
    var p = t[ns].fn = t[ns].prototype;

    //#region Standard Declarations

    p.className = ns;

    p.version = '5.1.0';
    p.timeStamp = 'Fri Feb 05 2016 19:43:25 GMT+0100 (W. Europe Standard Time)';
    p.copyright = 'Theobald Software GmbH.';

    p.defaultConfig = {
        behavior: {
            requestTimeout: 60000
                //noSapErrors: constants.empty
        },
        connection: {
            ecs: {
                authenticate: empty,
                core: empty,
                // direct apikey
                coreApiKey: empty,
                // synonym for serviceApplication
                instance: empty,
                // will be added as SPRAS = {0}
                queryLanguage: 'EN',
                serviceApplication: empty,
                // should be set prior to use
                useSharepointSettings: empty,
                url: '/_vti_bin/ERPConnectServiceRest.svc/'
            }
        },

        configVersion: 20
    };

    p.session = {};

    p.localizableStrings = {
        en: {
            ecsError: "There might be a problem with ECS", //, Service unavailable
            errors: {
                abort: "Request aborted.",
                //ecsErrorCreateFunction: "Function's metadata could not be read, please check CreateFunction Query",
                ecsErrorExecuteFunction: "ECS tried to execute function but failed, please check connection integrity",
                ecsConnectionTestFailed: "Service connection test FAILED.",
                ecsSapConnectionTestFail: "SAP Connection FAILED.",
                genericSap: "Unknown SAP problem.",
                // dupe
                genericErrorTitle: "Something went wrong.",
                parametersName: "Function name not specified",
                parsererror: "Requested JSON parse failed.",
                sapErrorExecuteFunction: "Function execution failed with errors, please check ExecuteFunction Query",
                sapErrorCreateFunction: "Function's metadata could not be read, please check CreateFunction Query",
                sharepointApiKey: "Api-Key could not be read (SharePoint)",
                timeout: "Operation could not be completed. Slow connection or internal error.",
                urlNotProvided: "For ECSCore queries within SPOnline Url must be specified",
                unknownError: "Other error",
                wrongEcsLibrary: "If you intented to use tEcs with Sharepoint, please switch to theobald.ecs: https://static.theobald-software.com/theobald.ecs"
            },
            info: {
                ecsConnectionTested: "Service successfully tested.",
                ecscoreMode: "SPOnline detected, entering ECSCore mode.",
                ecsSapConnectionTested: "Connection with SAP system successfully tested.",
                aborted: "Process Aborted",
                credentialAdded: "User credentials added.",
                credentialDeleted: "User credentials removed.",
                credentialChecked: "User credentials are correct.",
                credentialCheckedFail: "User credentials are incorrect.",
                credentialFail: "Credentials could not be processed."
            },
            warnings: {
                scopeWithoutID: 'tecs.scope: no scope ID',
                scopeNotDefined: 'tecs.scope: closing scope without ID',
                xqlNotString: 'tecs.executexql: query not a string.',
                chainNoQueue: 'tecs.chain: no function queue.'
            },
            sapError: "SAP Error",
            sapInfo: "SAP Information",
            sapValidation: "SAP Validation:\n{0}",
            sapWarning: "SAP Warning",
            unexpectedParameterFormat: "Possibly not supported data-type: '{0}' of structure at index {1}"
        },
        de: {
            ecsError: "Ein Problem mit ECS ist aufgetreten",
            errors: {
                abort: "Anfrage abgebrochen.",
                connectionOrRequest: "Verbindungsproblem oder inkorrekte Anfrage",
                ecsErrorExecuteFunction: "Die Funktion konnte von ECS nicht gesteuert werden, überprüfen Sie bitte die Signaturen aller Parameter (ExecuteFunction Query)",
                ecsConnectionTestFailed: "Der Verbindung zum Dienst ist fehlgeschlagen.",
                ecsSapConnectionTestFail: "Die SAP-Verbindung ist fehlgeschlagen.",
                genericSap: "Unbekannter SAP-Fehler.",
                genericErrorTitle: "Fehler",
                parametersName: "Bitte überprüfen Sie den Funktionsnamen",
                parsererror: "JSON-Parser Fehler.",
                sapErrorExecuteFunction: "Die SAP-Funktion wurde nicht ordnungsmäßig ausgeführt (ExecuteFunction Query)",
                sapErrorCreateFunction: "Die Metadaten der SAP-Funktion konnten nicht gelesen werden (CreateFunction Query)",
                sharepointApiKey: "Der Api-Key konnte nicht gelesen werden (SharePoint)",
                timeout: "Die Operation meldete sich nicht zurück. Langsame Verbindung oder ein interner Fehler.",
                urlNotProvided: "Geben Sie bitte ECSCore Endpoint ein (Url)",
                unknownError: "Unbekannter Fehler",
                wrongEcsLibrary: "Die erweiterte tEcs Version für SharePoint befindet sich unter: https://static.theobald-software.com/theobald.ecs"
            },
            info: {
                ecsConnectionTested: "Der Dienst wurde erfolgreich getestet.",
                ecscoreMode: "SPOnline: wechsele in den ECSCore-Modus.",
                ecsSapConnectionTested: "Die Verbindung zum SAP-System ist OK.",
                aborted: "Prozess wurde unterbrochen.",
                credentialAdded: "Benutzer wurde hinzugefügt.",
                credentialDeleted: "Benutzer wurde hinzugefügt.",
                credentialChecked: "Benutzerdaten wurden überprüft.",
                credentialCheckedFail: "Benutzerdaten sind falsch.",
                credentialFail: "SecureStore Fehler."
            },
            sapValidation: "SAP Validierung:\n{0}",
            sapWarning: "SAP Warnung",
            sapInfo: "SAP Information",
            sapError: "SAP Fehler",
            unexpectedParameterFormat: "Der Typ von '{0}' auf Index {1} in der Struktur möglicherweise nicht unterstützt",
        }
    };

    p.constants = {
        actions: {
            // BASIC ECS ACTIONS
            BeginConnectionScope: 'BeginConnectionScope',
            CreateFunction: 'CreateFunction',
            EndConnectionScope: 'EndConnectionScope',
            ExecuteFunction: 'ExecuteFunction',
            ExecuteXQL: 'ExecuteXQL',
            // EXTENDED ECS ACTIONS
            TestConnection: 'Test',
            TestSAPConnection: 'TestSAPConnection',
            // ECSCORE ONLY
            // SecureStore Actions
            AddCredentialToSecureStore: 'AddCredentialToSecureStore',
            DeleteCredentialFromSecureStore: 'DeleteCredentialFromSecureStore',
            CheckCredentialInSecureStore: 'CheckCredentialInSecureStore',
            // not implemented
            GetServiceApplicationInfoList: 'GetServiceApplicationInfoList',
            //
            // EXTENDED JSF ACTIONS (JSF, not ECS), custom sequence
            CreateExecuteFunction: 'CreateExecuteFunction',
            ExecuteInScope: 'ExecuteInScope'
        },
        http: {
            contentTypeJson: 'application/json; charset=utf-8'
        },
        messages: {
            tecsDone: 'tecs.{0}.done',
            tecsFail: 'ecs.{0}.fail',
            ecsDone: 'ecs.{0}.done',
            ecsFail: 'ecs.{0}.fail',
            sapDone: 'sap.{0}.done',
            sapFail: 'sap.{0}.fail',
            xhrDone: 'xhr.{0}.done',
            xhrFail: 'xhr.{0}.fail'
        },
        parameterDirection: {
            EXPORT: 'export',
            IMPORT: 'import',
            TABLES: 'tables',
            CHANGINGS: 'changings'
        },
        responses: {
            EndConnectionScopeOk: 'OK'
        },
        sap: {
            functions: {
                BapiTransactionCommit: 'BAPI_TRANSACTION_COMMIT',
                CrystalGetLogonLanguage: '/CRYSTAL/GET_LOGON_LANGUAGE'
            },
            errorCode: 'E',
            warningCode: 'W',
            dateFormat: 'yyyyMMdd'
        },
        xql: {
            parameters: {
                language: 'SPRAS = {0} ',
                languageDefault: 'EN'
            },
            SELECT: 'SELECT {0} ',
            select: function(op) {
                return 'SELECT ' + op + ' ';
            },
            from: function(op) {
                return 'FROM ' + op + ' ';
            },
            where: function(op) {
                return 'WHERE ' + op + ' ';
            },
            and: function(op) {
                return 'AND ' + op + ' ';
            },
            or: function(op) {
                return 'OR ' + op + ' ';
            },
            top10: 'TOP 10 ',
            FROM: 'FROM {0} ',
            WHERE: 'WHERE {0} ',
            LIKE: 'LIKE {0}',
            like1parameter: "{0} LIKE '{{{0}}}% '",
            like2parameters: "({0} LIKE '{{{0}}}%' OR {1} LIKE '{{{0}}}%') ",
            OR: 'OR {0} ',
            AND: 'AND {0} ',
            nextParameter: '{0}, ',
            lastParameter: '{0} '
        }
    };

    actions = p.constants.actions;

    //#endregion Standard Declarations

    //#region Formatters

    // copy of t.core.stringify
    p.stringify = function(text, html) {
        var str;

        // skip DOM elements
        if (text.documentElement) {
            return empty;
        }

        // could contain loops
        try {
            str = JSON.stringify(text, undefined, html ? constants.htmlLineBreak : 2);
        } catch (er) {
            str = empty;
        }

        return str;
    };

    p.ajax = ajax;
    p._extendInternal = util._extendInternal;
    p._extend = p._deepExtend = util._extend;
    p._extendSkipEmptyStrings = util._extendSkipEmptyStrings;
    p._merge = util._merge;
    p._extendFilterDeep = util._extendFilterDeep;
    p._extendFilterDeepSkipEmptyStrings = util._extendFilterDeepSkipEmptyStrings;

    p.format = util.format;

    p.insureSlash = function(str) {
        return str + (str.slice(-1) === constants.slash ? constants.empty : constants.slash);
    };

    p.getUrlWithProtocol = function(url) {
        var correctedUrl = url,
            httpsPrefix = 'https://';

        // no prefix
        if (url.indexOf('http') !== 0) {
            if (url[0] === '/') {
                if (url[1] === '/') {
                    this.warn('connection.ecs.url starts with two slashes');
                    correctedUrl = correctedUrl.substr(1);
                }
                correctedUrl = correctedUrl.substr(1);
            }

            correctedUrl = httpsPrefix + correctedUrl;
        }

        return correctedUrl;
    };

    p.getTimeout = function(timeout) {
        var requestTimeout =
            // inline timeout
            parseInt(timeout) && timeout ||
            // or default/custom timeout from config
            parseInt(t.ecs.config.behavior.requestTimeout) && t.ecs.config.behavior.requestTimeout ||
            // simplified version for a minute-long timeout, when config value set to true
            t.ecs.config.behavior.requestTimeout === true && 60000;

        return requestTimeout;
    };

    // sets right line breaks and colon for a message with title, e.g. "<br />Connection:<br />"
    p.getWrapString = function(str, options) {
        if (!options) {
            options = {};
        }

        var separator = options.html ? constants.htmlLineBreak : constants.literalLineBreak,
            wrapString = this.format('{0}:{1}', str, separator);

        return wrapString;
    };

    //#endregion Formatters

    //#region Connection Routines

    p.getEcsAuthorization = function(parameters) {
        if (!parameters) {
            this.error('apikey not specified');
            return constants.empty;
        }

        var token,
            apiKeyPrefix = 'APIKEY ';

        if (typeof parameters === 'string') {
            token = apiKeyPrefix + btoa(parameters);
        } else {
            //var ecsApiKey = parameters;
        }

        return token;
    };

    // sets ajax properties, determines filal url to call
    // WORKFLOW: executeEcsCommand > executeRequest > executeAjaxRequest
    // priority: ajax.url, parameteres.url, parameters.connection.url
    // done and fail handlers must be ready / set in parameters
    p.executeAjaxRequest = function(parameters) {
        if (!parameters) {
            this.enull('parameters');
        }

        var sessionEcsConfig = {};
        try {
            sessionEcsConfig = this.session.connection.ecs;
        } catch (err) {}

        var self = this,
            deferred = newDeferred(),
            empty = constants.empty,
            connection = this._extendSkipEmptyStrings({}, this.config.connection.ecs, sessionEcsConfig, parameters.connection && parameters.connection.ecs),
            //parameters = {url: X, action: Y} has precedence over connectionUrl
            // parameters.connection = {url: X}, action default ExecuteXQL
            url = (parameters.url || connection.url || empty),
            // some constants
            dataType = 'json',
            requestType = 'POST',
            contentType = this.constants.http.contentTypeJson,
            asbPrefix = 'servicebus.windows.net',
            // immutables
            authenticateFlag = parameters.authenticate || connection.authenticate,
            coreApiKey = parameters.coreApiKey || connection.coreApiKey,
            // e.g. for test connection
            urlParameters = parameters.urlParameters,
            useSharepointSettings = parameters.useSharepointSettings || connection.useSharepointSettings,
            data = parameters.data,
            timeout = t.ecs.getTimeout(),
            ajaxParameters,
            done = function() {
                return deferred.resolve.apply(deferred, arguments);
            },
            fail = function(error) {
                clearTimeout(timeoutTimer);
                deferred.reject.apply(deferred, arguments);
                // or return def.
                return error;
            };

        function runAjax() {
            var finalizedParameters = finalizeParameters(),
                // wrapped ajax xhr
                _ajaxDeferred = newDeferred();

            if (finalizedParameters.error) {
                return deferred.fail(fail).reject(finalizedParameters.error);
            }

            finalizedParameters.error = function() {
                return _ajaxDeferred.reject.apply(_ajaxDeferred, arguments);
            };
            finalizedParameters.success = function() {
                return _ajaxDeferred.resolve.apply(_ajaxDeferred, arguments);
            };
            _ajaxDeferred.abort = function(reason) {
                deferred.__xhr.abort(reason);
            };

            deferred.__xhr = self.ajax(finalizedParameters);
            deferred._deferred = _ajaxDeferred;

            deferred.deferred = deferred._deferred.promise();

            deferred._deferred.then(done, fail);

            return deferred;
        }

        function setAuthorization(_ajaxParameters, _authorization) {
            _ajaxParameters.beforeSend = function(xhr) {
                xhr.setRequestHeader(
                    'Authorization',
                    _authorization
                );
            };

            //for native query w/o jquery
            _ajaxParameters.authToken = _authorization;

            return _authorization;
        }

        //ecscore mode
        if (connection && connection.core) {
            // PREFLIGHT REQUEST
            this._extend(ajaxParameters, {
                async: true
            });
        }

        // e.g. when waiting for sharepoint parameters asynchronously
        function finalizeParameters() {
            // for errors
            var returnObject = {};

            // review this, why not use ajax.url instead
            url = self.insureSlash(url) +
                // check if action specified
                (parameters.action || t.ecs.constants.actions.ExecuteXQL);

            // protocol check
            // if no trailing slash at start -- maybe relative
            // if trailing slash at start -- may be the host
            // if http(s) -- remote host
            if (url.indexOf(asbPrefix) > -1) {
                url = self.getUrlWithProtocol(url);
            }

            // check if no default ecs sppremise url specified,
            // splist settings should be loaded to this point
            // TODO
            if (session.sponline && url.indexOf(t.ecs.defaultConfig.connection.ecs.url) > -1) {
                returnObject.error = t.ecs.strings.errors.urlNotProvided;
                return returnObject;
            }

            // only support url without parameters for now
            if (urlParameters) {
                var parameterString = '?';
                //hasParameters = url.indexOf('?') > -1;

                for (var urlParameterIndex in urlParameters) {
                    var urlParameter = urlParameters[urlParameterIndex];
                    if (urlParameter) {
                        parameterString += encodeURIComponent(urlParameterIndex) + '=' + encodeURIComponent(urlParameter) + '&';
                    }
                }

                if (parameterString.slice(-1) === '&') {
                    parameterString = parameterString.slice(0, -1);
                }

                url += parameterString;
            }

            ajaxParameters = {
                url: url,
                type: requestType,
                // data will be packed here
                data: parameters.rawData || self.stringify(data),
                dataType: dataType,
                contentType: contentType
            };

            // arbitrary service, use for testing (sensitive data)
            if (authenticateFlag) {
                var basicAuthToken;
                if (authenticateFlag === true || authenticateFlag === 'true') {
                    if (parameters.authorization) {
                        basicAuthToken = parameters.authorization;
                    } else {
                        if (!parameters.username || !parameters.password) {
                            returnObject.error = 'Basic Authorization requires username and password';
                            return returnObject;
                        }
                        basicAuthToken = btoa(parameters.username + ':' + parameters.password);
                    }
                }

                if (basicAuthToken) {
                    // the token is parameter itself
                    // CORS must be allowed for the website, hosting html
                    setAuthorization(ajaxParameters, basicAuthToken);
                }
            } else if (coreApiKey) {
                var apiAuthToken = self.getEcsAuthorization(coreApiKey);
                setAuthorization(ajaxParameters, apiAuthToken);

                // todo, will this work w/o jq
                ajaxParameters.authToken = apiAuthToken;
            }

            if (timeout) {
                ajaxParameters.timeout = timeout;
            }

            // everything except authorization can be overridden
            if (parameters.ajax) {
                self._extend(ajaxParameters, parameters.ajax);
            }

            return ajaxParameters;
        }

        // TODO should we cache them?
        // TODO is window.SP always there, should/can it be explicitly loaded?
        if (useSharepointSettings && t.sp && window.SP) {
            var timeoutTimer;

            // incapsulates the queue
            deferred._deferred = t.sp.getEcsProperties();

            deferred._deferred.then(function(spSettings) {
                    if (spSettings.apikey) {
                        coreApiKey = spSettings.apikey;
                    }
                    if (spSettings.url) {
                        url = spSettings.url;
                    }
                    if (spSettings.instance) {
                        if (!urlParameters || !urlParameters.applicationName) {
                            // can data be empty?
                            if (spSettings.instance) {
                                data.applicationName = spSettings.instance;
                            }
                        } else {
                            urlParameters.applicationName = spSettings.instance;
                        }
                    }

                    return runAjax();
                },
                fail
            );

            deferred.deferred = deferred._deferred.promise();
        } else {
            return runAjax();
        }

        // we don't set any post handlers here.
        return deferred;
        //deferCompositePromise.done(parameters.rawDone || parameters.done).fail(parameters.rawFail || parameters.fail);
    };

    // manage xhr errors and preprocess result
    p.executeRequest = function(parameters) {
        var self = this,
            deferred = newDeferred(),
            updatedParameters = this._extend({}, parameters),
            done = function(result) {
                self.trace(self.format(self.constants.messages.xhrDone, parameters.action || 'generic'));
                // result.message for ecscore signalizes about possibly Thrown Exception
                var error = self.getEcsError(result);
                if (error) {
                    // ECS ERROR LEVEL 2
                    if (parameters.silent) {
                        // executeRequest invoked directly
                        self.error(self.format(self.constants.messages.ecsFail + '.silent %o', parameters.action || 'generic'), result);
                    }

                    deferred.reject(error, result);

                    return error;
                }

                var unwrappedResult = t.ecs.unwrapResult(result);

                deferred.resolve(unwrappedResult, result);

                return unwrappedResult;
            },
            // XHR ERROR LEVEL 1
            // should know what to do the the wrapped error.
            fail = function(xhr, textStatus, errorThrown) {
                // fail('oops, error');
                var errorObj;

                if (typeof xhr === 'string') {
                    errorObj = xhr;
                } else {
                    errorObj = {
                        xhr: xhr,
                        textStatus: textStatus,
                        errorThrown: errorThrown,
                    };

                    if (textStatus === "notmodified") {
                        self.warn(textStatus);
                    }

                    errorObj.message = t.ecs.getShortErrorMessage(errorObj);
                }

                self.error('xhr.%s.fail: %o', parameters.action || 'generic', errorObj);

                deferred.reject(errorObj);

                return errorObj;
            };

        deferred._deferred = this.executeAjaxRequest(updatedParameters);
        deferred._deferred.then(done, fail);

        deferred.deferred = deferred._deferred.promise();

        return deferred;
    };

    //#endregion Connection Routines

    //#region ECS Actions Wrappers

    // errors xhr OR function should be abstracted
    // XHR ERROR LEVEL 1 - TRANSPORT
    // ECS ERROR LEVEL 2 - ECS LOGIC
    // SAP ERROR LEVEL 3 - SAP EXCEPTION/ERROR /self handled by user
    p.executeEcsCommand = function(parameters, action) {
        var self = this,
            updatedParameters = this._extend({}, parameters, {
                // build other data from data, wrap
                data: {}
            }),
            activeAction = action || parameters.action,
            actions = this.constants.actions,
            deferred = newDeferred(),
            done = function(doneParameters) {
                self.trace(self.format('ecs.{0}.done', activeAction));
                // already unwrapped
                var finalResult;
                if (updatedParameters.withMetadata) {
                    finalResult = doneParameters;
                } else {
                    finalResult = doneParameters && doneParameters.rows || doneParameters;
                }

                // execute data specific convertion
                finalResult = self.preprocessResult(parameters.preprocessResult, finalResult);

                // could pass original parameters as next parameters, after the first
                deferred.resolve(finalResult, doneParameters);

                if (parameters && (parameters.done || parameters.success)) {
                    deferred.done(parameters.done || parameters.success);
                }

                return finalResult;
            },
            _done = done,
            fail = function(failParameters) {
                self.error(self.format('ecs.{0}.fail: %o', activeAction), failParameters);

                self.lastError = failParameters;

                deferred.reject(failParameters);

                if (parameters && (parameters.fail || parameters.error)) {
                    deferred.fail(parameters.fail || parameters.error);
                }

                return failParameters;
            },
            _fail = fail;

        // set action if not set and passed as function parameter
        if (!parameters.action) {
            (updatedParameters.action = action);
        }

        if (!parameters.syncObject) {
            parameters.syncObject = {};
        }

        var addCustomInstanseToParameters = function(asUrlParameter) {
                // TODO check whether connection.core exists and the programmer forgot to add ecs field >> connection.ecs.core
                // direct parameters
                var tryGetInstanseFromParameterObject = function(path) {
                        var value;

                        try {
                            value = path.connection.ecs.serviceApplication || path.connection.ecs.instance;
                        } catch (err) {}

                        return value;
                    },
                    customInstanse =
                    tryGetInstanseFromParameterObject(parameters) ||
                    tryGetInstanseFromParameterObject(self.session) ||
                    tryGetInstanseFromParameterObject(self.config);

                // if not empty, add a PARAMTER applicationName, otherwise NO PARAMETER
                if (customInstanse) {
                    updatedParameters.data.applicationName = customInstanse;

                    if (asUrlParameter) {
                        if (!updatedParameters.urlParameters) {
                            updatedParameters.urlParameters = {};
                        }

                        updatedParameters.urlParameters.applicationName = customInstanse;
                    }
                }

                return updatedParameters;
            },
            // checks if we're in a scope, put it into the right parameter for ECS
            addScopeToParameters = function() {
                // if it already set in data.connectionScope, do nothing
                var scope = (parameters.syncObject && parameters.syncObject.scope) || parameters.scope;

                if (scope) {
                    updatedParameters.data.connectionScope = scope;
                }

                return updatedParameters;
            },
            // adds scope and instanse to parameters, when needed
            addParsedParameters = function(asUrlParameters) {
                addCustomInstanseToParameters(asUrlParameters);
                return addScopeToParameters();
            },
            addSecureStoreParameters = function() {
                if (parameters.data) {
                    // pass through
                    updatedParameters.data = parameters.data;
                } else {
                    // request.SecureStoreName, request.UserOrGroup, request.Username, request.Password
                    self._extend(updatedParameters.data, {
                        SecureStoreName: parameters.SecureStoreName,
                        UserOrGroup: parameters.UserOrGroup,
                        Username: parameters.Username,
                        Password: parameters.Password
                    });
                }
            },
            // for management commands
            // same as other commands
            addDefaultDoneFailWithPopups = function(textSuccess, textFail) {
                done = function(data) {
                    _done(data);

                    self.trace(textSuccess + constants.space + '%o', data);

                    return data;
                };
                fail = function(data) {
                    _fail(data);

                    self.warn(textFail + constants.space + '%o', data);

                    return data;
                };
            };

        switch (activeAction) {
            case actions.BeginConnectionScope:
                done = function(data) {
                    // ecs success, ecs error will be already checked to this point and unwrapped
                    // log
                    _done(data);

                    if (!data.id) {
                        var warning = self.strings.warnings.scopeWithoutID;
                        self.warn(warning);

                        return _fail(warning);
                    }

                    // assign scope to syncObject, so it could be shared between function in the queue
                    parameters.syncObject.scope = data;

                    return data;
                };

                // must we add APPLICATIONNAME to the "data" object, when there is another parameter in "data" object already? And otherwise use URL
                addCustomInstanseToParameters(true);

                //no data needs be set, scope id will be returned onSuccess
                if (Object.keys(updatedParameters.data).length === 0) {
                    //todo: scope for specific SAP-Connection?
                    // no scope, no instanse
                    updatedParameters.data = constants.empty;
                }
                break;
            case actions.CreateFunction:
                if (!updatedParameters.data.name) {
                    var name = parameters.name ||
                        // legacy
                        parameters.func;

                    if (!name) {
                        self.warn(self.strings.errors.parametersName);

                        return deferred.reject(self.strings.errors.parametersName);
                    }

                    updatedParameters.data.name = name;
                }

                addParsedParameters();
                break;
            case actions.EndConnectionScope:
                addParsedParameters();

                if (!updatedParameters.data.connectionScope) {
                    var warning = self.strings.warnings.scopeNotDefined;
                    self.warn(warning);
                    return deferred.reject(warning);
                }

                done = function(data) {
                    if (data === self.constants.responses.EndConnectionScopeOk) {
                        _done(data);
                    } else {
                        // not OK, expired or corrupted
                        deferred.reject(data);
                    }

                    return data;
                };

                break;
            case actions.ExecuteFunction:
                // if we use exec function as a standalone function, then "data" is SFO (parameter/values)
                // then we must check that name field in data exists, then it should be a prepared sap function
                // when create and execute called in a bundle, data holds shallow parameters from UI and logic for SFO, so it must be wrapped/prepared
                if (parameters.data && parameters.data.function && parameters.data.function.name) {
                    // pass through
                    updatedParameters.data = parameters.data;
                } else {
                    // data, processed from createSapFunction or from custom assigner
                    updatedParameters.data = {
                        function: parameters.sapFunctionObject || parameters.data
                    };
                    //updatedParameters.data.function = ;
                }
                addParsedParameters();
                break;
            case actions.ExecuteXQL:
                // no preprocessing, query field exists as a shortcut, because xql is "query" and could be easier to remember
                // should be ready to this point
                var query =
                    // no extra fields
                    parameters.data && parameters.data.query ||
                    // data itself is a query
                    typeof parameters.data === 'string' && parameters.data ||
                    // query is a query
                    typeof parameters.query === 'string' && parameters.query;

                if (typeof query != "string") {
                    self.warn(self.strings.warnings.xqlNotString);
                    return deferred.reject(self.strings.warnings.xqlNotString);
                }

                updatedParameters.data.query = query;

                addParsedParameters();

                break;
                // EXTENDED ECS
            case actions.TestConnection:
                addDefaultDoneFailWithPopups(
                    self.strings.info.ecsConnectionTested,
                    self.strings.errors.ecsConnectionTestFailed
                );
                addCustomInstanseToParameters(true);
                break;
            case actions.TestSAPConnection:
                addDefaultDoneFailWithPopups(
                    self.strings.info.ecsSapConnectionTested,
                    self.strings.errors.ecsSapConnectionTestFail
                );
                addCustomInstanseToParameters(true);
                break;
                // SECURE STORE
            case actions.AddCredentialToSecureStore:
                addSecureStoreParameters();

                addDefaultDoneFailWithPopups(
                    self.strings.info.credentialAdded,
                    self.strings.info.credentialFail
                );
                break;
            case actions.DeleteCredentialFromSecureStore:
                addSecureStoreParameters();

                addDefaultDoneFailWithPopups(
                    self.strings.info.credentialDeleted,
                    self.strings.info.credentialFail
                );
                break;
            case actions.CheckCredentialInSecureStore:
                // todo done should parse response!
                addSecureStoreParameters();

                addDefaultDoneFailWithPopups(
                    self.strings.info.credentialChecked,
                    self.strings.info.credentialFail
                );

                done = function(data) {
                    _done(textCredentialChecked);

                    var userOk = data === 'TRUE',
                        textCredentialChecked;

                    if (userOk) {
                        textCredentialChecked = self.strings.info.credentialChecked;
                    } else if (!userOk && data === 'FALSE') {
                        textCredentialChecked = self.strings.info.credentialCheckedFail;
                    } else {
                        textCredentialChecked = 'UNKNOWN';
                    }

                    self.trace(textCredentialChecked + constants.space + data);

                    return data;
                };

                break;
                // TRUE or FALSE
            case actions.Version:
            case actions.Notifications:
            case actions.Services:
            case actions.ClearCaches:
            case actions.ServiceBusConnectIfAutoRegisterIsEnabled:
            case actions.ServiceBusDisconnect:
                var warningNotImplemented = 'ecs command not implemented.';
                this.warn(warningNotImplemented);
                return deferred.reject(warningNotImplemented);
            default:
                var warningNotDefined = 'ecs command not defined.';
                this.warn(warningNotDefined);
                return deferred.reject(warningNotDefined);
        }

        deferred._deferred = t.ecs.executeRequest(updatedParameters);
        deferred.deferred = deferred._deferred.promise();

        // ecs log, busuness logic check
        deferred._deferred.then(done, fail);

        return deferred;
    };

    // add functions respective to actions
    var getFunctionForAction = function(action) {
            return function(parameters) {
                return this.executeEcsCommand(parameters, action);
            };
        },
        actionFunctions = {
            executeXql: actions.ExecuteXQL,
            createSapFunction: actions.CreateFunction,
            executeSapFunction: actions.ExecuteFunction,
            beginConnectionScope: actions.BeginConnectionScope,
            endConnectionScope: actions.EndConnectionScope,
            testConnection: actions.TestConnection,
            testSapConnection: actions.TestSAPConnection,
            AddCredentialToSecureStore: actions.AddCredentialToSecureStore,
            DeleteCredentialFromSecureStore: actions.DeleteCredentialFromSecureStore,
            CheckCredentialInSecureStore: actions.CheckCredentialInSecureStore
        };
    for (var functionName in actionFunctions) {
        p[functionName] = getFunctionForAction(actionFunctions[functionName]);
    }

    // parameters:
    // func - sap function to execute
    // data - sap function object values
    // done/fail - handlers to trigger on execution complete
    // connection - local connection from scenario
    p.executeFunction = p.createAndExecuteSapFunction = function(parameters) {
        var self = this,
            request = this._extend({}, parameters),
            deferred = newDeferred(),
            fail = function() {
                return deferred.reject.apply(this, arguments);
            },
            // executed if no errors xhr/ecs/sap
            // param:data is sapFunctionObject (SFO)
            done = function(data) {
                // old name: assignParametersFunction
                var sapParameters = parameters.data,
                    // can be function, which takes SapFunctionMetadata Object and fills it "data=function(sfmo){}"
                    isDataFunction = sapParameters instanceof Function,
                    preparedFunction = isDataFunction ?
                    // flag to tell closure from assigner (closure has zero parameters, assigner at least one - sfo
                    sapParameters.length === 0 ?
                    // retrieve mutable data via closure and assign fields to sfo
                    t.ecs.assignFunctionParameters(sapParameters(), data)
                    // manual SFO assignment
                    : sapParameters(data)
                    // not a function, so just run through assigner
                    : t.ecs.assignFunctionParameters(sapParameters, data),
                    // connection, done/fail
                    createdFunctionParameters = self._extend({}, request);

                // replace data with sfo with filled values
                createdFunctionParameters.data = preparedFunction;

                deferred._deferred = self.executeSapFunction(createdFunctionParameters);
                deferred.deferred = deferred._deferred.promise();

                deferred._deferred.then(function() {
                    return deferred.resolve.apply(this, arguments);
                }, fail);

                return deferred;
            };

        if (!request.name) {
            this.warn('sap function name not supplied (or legacy "func" usage).');
        }

        // support for abort
        deferred._deferred = this.createSapFunction(request);
        // support for internal chaining
        deferred.deferred = deferred._deferred.promise();

        deferred._deferred.then(done, fail);

        // oldschool support
        deferred.then(function(data) {
            if (parameters.done) {
                parameters.done(data);
            }
            return data;
        }, function(data) {
            if (parameters.fail) {
                parameters.fail(data);
            }
            return data;
        });
        deferred.always(function(data) {
            if (parameters.always) {
                parameters.always(data);
            }
            return data;
        });

        // support for inline parameters
        return deferred;
    };

    // e.g. BAPI_1, BAPI_2
    // if parameters.commit === true, then commit at the end after the last function
    p.executeChain = function(parameters) {
        if (parameters.inScope) {
            // remove the mark
            delete parameters.inScope;
            // go to scope wrapper
            return this.executeInScope(parameters);
        }

        var self = this,
            counter = 0,
            // not exposed objects as internalSyncObject = {}?
            syncObject = parameters.syncObject || (parameters.syncObject = {}),
            updatedParameters = this._extend({}, parameters),
            deferred = newDeferred(),
            // original/global done/fail, executed after the whole queue
            done = function(data) {
                self.trace(self.format(self.constants.messages.tecsDone, self.constants.actions.ExecuteInScope));
                if (parameters.done) {
                    parameters.done(data);
                }
            },
            fail = function(data) {
                self.trace(self.format(self.constants.messages.tecsFail, self.constants.actions.ExecuteInScope));
                if (parameters.fail) {
                    parameters.fail(data);
                }
            },
            functions = updatedParameters.functions,
            //
            // as "finally"-block, execute in any case at the end, do housekeeping, e.g. endScope on error, done or abort.
            // the need of introducing "always" was asynchroneous+external syncObject modifications, which can influence the workflow;
            // e.g. syncObject.abort means that even though "done" handler was executed, some custom information processed by on-function-basis handler signalizes, that execution should be aborted, so both done and fail handler won't get executed;
            // it would be both ambiguious for the result type and for the parameters needed to be passed.
            always = function(data) {
                // release cache
                if (parameters.always) {
                    parameters.always(data);
                }

                delete syncObject.cache;

                return data;
            },
            // replace done to run next function in the chain, until fail or user-abort
            doneCycleHandler = function(data) {
                // user of API knows what he's doing, not call handlers
                // obsolete, use deferred._deferred.reject('user_aborted')
                if (syncObject.abort) {
                    // calling fail makes no sense, as it won't have the relevant data-parameter
                    always(data);

                    return data;
                }

                // do not crash, leaving scope opened
                // formally 'all' functions in the null-'queue' are executed
                if (!functions) {

                    self.warn(self.strings.warnings.chainNoQueue);

                    if (done) {
                        done(data);
                    }

                    deferred.resolve(self.strings.warnings.chainNoQueue);

                    always(data);

                    return data;
                }

                // use next function in the queue
                var funcObj = functions.shift();

                // check if last function was executed
                if (!funcObj) {
                    if (done) {
                        done(data);
                    }

                    deferred.resolve(data);

                    always(data);

                    return data;
                }

                // update funcObj to use proper connection
                // "step" could be createAndExecute function or executeXql
                var localStepParameters = t.ecs._extend({
                        // use scenario connection, in specific cases directly specified/overrided in funcObj connection
                        connection: t.ecs._extend({}, parameters.connection, funcObj.connection)
                    }, funcObj, {
                        // custom doneHandler is being potentionally/optionally replaced,
                        // so call original done, if exists
                        scope: syncObject.scope
                    }),
                    doneLocal = function(dataDone) {
                        // could be used to save parameters between functions e.g. in syncObject,
                        // e.g. messages to be shown only when full queue is completed.
                        if (funcObj.done) {
                            funcObj.done(dataDone);
                        }

                        if (funcObj.deferred) {
                            funcObj.deferred.resolve(dataDone);
                        }

                        // so we have have access to results of all functions
                        // except unnamed XQL
                        if (funcObj.name) {
                            var name = funcObj.name || funcObj.func,
                                cache = syncObject.cache,
                                index = counter++;

                            cache[index] = dataDone;
                            cache[index]._name = name;
                        }
                        //
                        //syncObject.results should contain only relevant to GUI values and discarded manually
                        //
                        // returns xhr
                        return doneCycleHandler(dataDone);
                    },
                    failLocal = function(data) {
                        // break execution after current function
                        //abort = true;
                        //syncObject.abort = true;

                        // function specific fail, like for extra logging, preparing syncObject
                        if (funcObj.fail) {
                            funcObj.fail(data);
                        }

                        if (funcObj.deferred) {
                            funcObj.deferred.reject(data);
                        }

                        // global fail (e.g. gui, can use syncObj with saved data from the function above - funcObj.fail)
                        if (fail) {
                            fail(data);
                        }

                        // chain has ended
                        always(data);

                        return data;
                    };

                // short info to console
                self.trace(funcObj);

                // TODO TEST
                if (funcObj.query) {
                    if (!funcObj.data) {
                        funcObj.data = funcObj.query;
                    }
                    deferred._deferred = self.executeXql(localStepParameters);
                } else {
                    deferred._deferred = self.createAndExecuteSapFunction(localStepParameters);
                }

                deferred.deferred = deferred._deferred.promise();

                deferred._deferred.then(doneLocal, failLocal);

                return deferred;
            };

        // insure, SO passed by reference
        updatedParameters.syncObject = syncObject;

        // stored result "data" from Nth function under function name? execution step number?
        syncObject.cache = {};

        if (parameters.commit) {
            var lastAction = functions.slice(-1)[0].action;
            // if in scope, add commit before endScope
            if (lastAction === self.constants.actions.EndConnectionScope) {
                functions.splice(functions.length - 1, 0, this.getCommitFunction());
            } else {
                // without scope, add commit as the last function
                functions.push(this.getCommitFunction());
            }
        }

        //deferred._deferred =
        doneCycleHandler();
        // deferred._deferred.fail(function(dataF) {
        //     return deferred.reject(dataF);
        // });
        return deferred;
    };

    // parameters:
    // could be same funciton multiple times
    // [{name:, data:, done:, fail:}], done, fail, scope, connection, commit
    // for later: use allready created scope,
    // TODO next function should be able to get access to previous result
    p.executeInScope = function(parameters) {
        // option to create a new scope, if one already created!
        // if scope is already provided/created just to exeucte chain, i.e. same parameters with added "always" endScope
        if (parameters.syncObject && parameters.syncObject.scope && !parameters.newScope) {
            return this.executeChain(parameters);
        }

        var self = this,
            // effective deferred
            deferred = newDeferred(),
            // todo -- syncObject.abort = true -- obsolete, just invoke deferred._deferred.reject('by_user');
            // scope is exposed as well, but not being currently used from outside.
            // not exposed objects
            syncObject = parameters.syncObject || (parameters.syncObject = {}),
            updatedParameters = this._extend({}, parameters),
            scopeParameters = {
                connection: updatedParameters.connection,
                syncObject: syncObject
            },
            fail = function(data) {
                deferred.reject(data);
                return data;
            };

        // singleton available across funcitons
        updatedParameters.syncObject = syncObject;

        deferred._deferred = this.beginConnectionScope(scopeParameters);
        deferred.deferred = deferred._deferred.promise();

        deferred._deferred.then(function(data) {
            // external abort invoke should use top level deferred and access deferred._deferred in real time.
            deferred._deferred = self.executeChain(updatedParameters);
            // try close scope no matter "done" or "fail"
            deferred._deferred.always(function() {
                // not in the externally exposed queue
                return self.endConnectionScope(scopeParameters);
            });

            deferred.deferred = deferred._deferred.promise();

            deferred._deferred.then(function(dataChain) {
                deferred.resolve(dataChain);

                return dataChain;
            }, fail);
        }, fail);

        return deferred;
    };

    //#endregion ECS Actions Wrappers

    //#region Converter/Parser Helpers

    // returns an object with done/fail to be executed for default commit without custom done/fail
    // note: chain could have multiple commits
    p.getCommitFunction = function(parameters) {
        // FAIL/DONE ONLY for current COMMIT!
        var self = this,
            sapAction = 'commit',
            updatedParameters = parameters || {},
            commitDeferred = newDeferred(),
            effectiveParams = {
                name: this.constants.sap.functions.BapiTransactionCommit,
                _deferred: commitDeferred
            };

        effectiveParams.deferred = commitDeferred.promise();

        commitDeferred.then(function(doneCommit) {
            self.trace(self.format(self.constants.messages.ecsDone, sapAction));
            // done after commit succeeds
            // if (updatedParameters.done) {
            //     updatedParameters.done(doneCommit);
            // }

            return doneCommit;
        }, function(failCommit) {
            // todo ecs+sap logic
            self.error(self.format(self.constants.messages.sapFail, sapAction));
            // chain will be automatically terminated (xhr/ecs)

            // commit-specific fail
            // if (updatedParameters.fail) {
            //     updatedParameters.fail(failCommit);
            // }

            return failCommit;
        });

        return effectiveParams;
    };

    p.preprocessResult = function(preprocessor, data) {
        var result = data;

        if (!!preprocessor) {
            if (preprocessor instanceof Function) {
                result = preprocessor(result);
            } else {
                for (var i in preprocessor) {
                    result = preprocessor[i](result);
                }
            }
        }

        return result;
    };

    // work in progress
    // @metaPayload parameters with values
    // @sapFunctionObject effective function metadata to insure consistency with SAP parameters (returned i.e. from createSapFunction
    p.assignFunctionParameters = function(metaPayload, sapFunctionObject) {
        var self = this;

        if (!sapFunctionObject) {
            this.enull('metadata:sapFunctionObject');
        }

        // function without any parameters need to be set
        if (!metaPayload) {
            return sapFunctionObject;
        }

        var metaExports = metaPayload.exports,
            metaTables = metaPayload.tables,
            metaImports = metaPayload.imports,
            metaChangings = metaPayload.changings,
            sfoExports = sapFunctionObject.exports,
            sfoTables = sapFunctionObject.tables,
            sfoImports = sapFunctionObject.imports,
            sfoChangings = sapFunctionObject.changings;

        var metaStructures = [metaExports, metaImports, metaChangings],
            sfoStructures = [sfoExports, sfoImports, sfoChangings];

        function filterFields(refStructure, sourceStructure) {
            for (var refIndex in refStructure) {
                var sourceValue = sourceStructure[refIndex],
                    refValue = refStructure[refIndex];
                if (sourceValue) {
                    refStructure[refIndex] = typeof sourceValue === "object" ? filterFields(refValue, sourceValue) : sourceValue;
                }
            }
            return refStructure;
        }

        for (var k in metaStructures) {
            var metastructure = metaStructures[k],
                sfostructure = sfoStructures[k];
            for (var i in metastructure) {
                var metaStructureElement = metastructure[i],
                    sfoStructureElement = sfostructure[i];
                // e.g. parameter SOMEID1 doesn't exist in SAP and someone tries to assign in, to prevent corruption we skip this parameter
                if (!sfoStructureElement) {
                    self.warn('Invalid parameter will be skipped: ' + i);
                    return;
                }
                var refValues = sfoStructureElement.paramValue.values;
                if (!refValues) {
                    sfoStructureElement.paramValue = metaStructureElement;
                } else {
                    filterFields(refValues, metaStructureElement);
                }
            }
        }

        for (var j in metaTables) {
            Array.prototype.push.apply(sfoTables[j].rows, metaTables[j]);
        }

        return sapFunctionObject;
    };

    // check for common result fields, e.g. {r|R}esult, {s|S}uccess
    p.unwrapResult = function(obj) {
        var expectedResult = obj.result || obj.Result || obj.success || obj.Success; // ||obj

        return expectedResult;
    };

    p.getConnection = function(connection) {
        return this._extend({}, t.ecs.config.connection, connection);
    };

    //#endregion Converter/Parser Helpers

    //#region ECS Helpers

    // ajax error code and description, when applies
    p.getXhrError = function(parameters, options) {
        if (!parameters) {
            return constants.empty;
        }

        if (!options) {
            options = {};
        }

        var self = this,
            separator = options.html ? constants.htmlLineBreak : String.fromCharCode(13),
            regExp = new RegExp(String.fromCharCode(13), 'g'),
            unpackedError = parameters.error || parameters,
            xhr = unpackedError && unpackedError.xhr,
            textStatus = unpackedError && unpackedError.textStatus,
            knownMessage = self.strings.errors[textStatus],
            message = constants.empty;

        // if not xhr, just return empty string, do not fail
        if (xhr) {
            //{"readyState":4,"responseText":"404 NOT FOUND","status":404,"statusText":"NOT FOUND"}
            // as in chrome console
            if (knownMessage) {
                message = knownMessage;
            } else if (options.long) {
                var errorThrown = unpackedError.errorThrown;
                message = 'XHR status: ' + xhr.status + separator +
                    'textStatus: ' + unpackedError.textStatus;

                if (errorThrown && typeof errorThrown === 'string') {
                    message += separator + 'errorThrown: ' + options.html ? errorThrown.replace(regExp, constants.htmlLineBreak) : errorThrown + separator;
                }
                //message = self.format('{0} ({1})', xhr.status, xhr.statusText); //error.xhr.responseText;
            }

            if (options && options.wrap) {
                message = self.getWrapString(self.strings.errors.connectionOrRequest, options) + message;
            }
        }

        return message;
    };

    // Parsers
    // recognize error object by typical fields
    // returns boolean
    // detects ecs error, not xhr, not sap
    p.getEcsError = function(parameters, options) {
        if (!parameters) {
            return constants.empty;
        }

        if (!options) {
            options = {};
        }

        var //separator = options.html ? constants.htmlLineBreak : constants.literalLineBreak,
            regExp = new RegExp(
                this.format('{0}|{1}|{2}|{3}',
                    String.fromCharCode(13),
                    constants.literalNewLineReturn,
                    constants.literalLineBreak,
                    '\\\\r\\\\n'
                ),
                'g'
            ),

            unpackedError = parameters.error || parameters.Error || parameters,
            // default short error field
            message =
            // e.g. Credentials not valid
            unpackedError.message || unpackedError.Message ||
            // no error or not ecs error
            constants.empty;
        // extension, currently not used,
        //        || obj.exeption || obj.Exeption
        //        || obj.exceptionType || obj.exceptionMessage
        //        || obj.stacktrace || obj.stackTrace;

        //            if (message.message && message.stackTrace && message.type) {
        //                message = message.message;
        //            }
        if (options.long && unpackedError.stackTrace) {
            // theoretically can lack of message/error field
            //"type": "System.ArgumentNullException",
            //"message": "Value cannot be null.\r\nParameter name: query",
            //"stackTrace": ""
            //
            //                message += 'ECS (Processing): ' + separator +
            //                    'type: ' + unpackedError.type + separator +
            //                    'message: ' + unpackedError.message + separator +
            //                    'stackTrace: ' + options.html ? unpackedError.stackTrace.replace(regExp, constants.htmlLineBreak) : unpackedError.stackTrace + separator;

            // experimental
            message = this.stringify(unpackedError);
            //message += parameters.message + separator + parameters.type + separator + parameters.stackTrace
        }

        if (message && options.html) {
            message = message.replace(regExp, constants.htmlLineBreak);
        }

        if (message && options.wrap) {
            message = this.getWrapString(this.strings.ecsError, options) + message;
        }

        return message;
    };

    //#endregion ECS Helpers

    //#region Message Helpers

    // recognize type of an error by the specific fields
    // {ERR} << {FIELD} in errorObject
    // xhr << xhr -- communication
    // ecs << stackTrace -- processing
    // sap << func -- sap business logic
    p.getShortErrorMessage = function(
        parameters,
        // message with html tags
        options) {
        if (typeof parameters === 'string') {
            return parameters;
        }

        var //separator = options && options.html ? constants.htmlLineBreak : constants.literalLineBreak,
        //empty = constants.empty,
        //                    options = this._extend({}, {
        //                        // extract specific error and wrap it with title, e.g. "Connection:"
        //                        short: true,
        //                        wrap: true
        //                    }, options),
        // {title: x, error: xx}
            unpackedError = parameters && parameters.error || parameters,
            // prefix which type of error? connection/processing/sap
            message = typeof unpackedError === 'string' ? unpackedError : this.getEcsError(unpackedError, options) || this.getXhrError(unpackedError, options) || unpackedError && unpackedError.title ||
            // default/generic
            this.strings.errors.genericErrorTitle;

        return message;
    };

    // log/recognize all relevant error fields and print full unknown errors
    p.getLongErrorMessage = function(errorIn, html) {
        if (!errorIn) {
            return constants.empty;
        }

        var unpackedError = errorIn.error || errorIn,
            // todo full collapsed SFO for SAP errors
            separator = html ? constants.htmlLineBreak : String.fromCharCode(13),
            message = constants.empty,
            //regExp = new RegExp(String.fromCharCode(13), 'g'),
            formatOptions = {
                html: html,
                long: true,
                wrap: true
            },
            ecsError = this.getEcsError(unpackedError, formatOptions),
            xhrError = this.getXhrError(unpackedError, formatOptions),
            messageMask = '{0}{1}';

        message = this.format(
            messageMask,
            ecsError ? ecsError + separator : constants.empty,
            xhrError
        );

        //            if (!message) {
        //                message = this.strings.errors.unknownError + this.stringify(unpackedError, html) + separator;
        //            }

        return message;
    };

    // concatenate short and long messages
    p.getFullMessage = function(error, html) {
        return t.ecs.getLongErrorMessage(error, html); //t.ecs.getShortErrorMessage(error) +
    };

    p.getLastError = function() {
        return this.lastError;
    };

    //#endregion Message Helpers

    //#region Helpers

    p.popup = function() {
        if (t.core && t.core.popup) {
            return t.core.popup.apply(t.core, arguments);
        } else {
            alert(
                // if single string
                (typeof arguments[0] === 'string' && !arguments[1]) ? arguments[0] : this.stringify(arguments)
            );
        }
    };

    p.isAborted = function(error) {
        return error.textStatus === 'abort' ? true : false;
    };

    p.dateToString = function(date) {
        if (!date.getFullYear) {
            this.warn('not a date %o', date);
            return date;
        }
        return empty + date.getFullYear() +
            (constants.charZero + (date.getMonth() + 1)).slice(-2) +
            (constants.charZero + date.getDate()).slice(-2);
    };

    p.stringToDate = p.parseSapDate = function(date) {
        if (typeof date !== 'string') {
            return date;
        }
        return new Date(date.substr(0, 4), parseInt(date.substr(4, 2)) - 1, date.substr(6, 2));
    };

    //#endregion Helpers

    //#region Environment Helpers

    //#region Sharepoint Helpers

    p.isSharepointOnline = function() {
        return window.location.host.indexOf('sharepoint.com') > -1;
    };

    // if presave set to true, this setting will be cached on the local machine (so needs to be called once)
    // confirmApiKey for admin part, calling it shows a default html input field, so admin sets ApiKey and it gets saved into Sharepoint
    p.useSharepointSettings = function(presave) {
        // should be loaded at this point
        //var self = this;

        this.config.connection.ecs.useSharepointSettings = true;

        if (presave) {
            this.saveConfig(false, true);
        }

        return this.config.connection.ecs.useSharepointSettings;
    };

    p.askSettingsAndSaveToSharepoint = function(callback, callbackError) {
        if (t.sp) {
            return t.sp.askSettingsAndSaveToSharepoint(callback, callbackError);
        } else {
            return this.warn('tEcs not supported, use theobald.ecs.js');
        }
    };

    p.setSharepointSettings = function() {
        if (!t.sp) {
            return this.warn('please use full theobald.ecs library!');
        }
        return t.sp.setSharepointSettings.apply(t.sp, arguments);
    };

    //#endregion Sharepoint Helpers

    //#region Soap / WebServiceDesigner companion

    // queries WSD services, currently inside SP.
    // input parameters - currentyly scalar
    // test with httpRequest
    p.wsdSoapQuery = function(options) {
        if (!options) {
            this.enull('options');
        }
        var self = this,
            wsdNamespace = (options.namespace && this.insureSlash(options.namespace)) || 'http://www.theobald-software.com/ERPConnectServices/WebServices/',
            // for sharepoint
            url = options.url || this.format('/_vti_bin/{0}.svc', options.serviceName),
            interfaceName = options.interfaceName || ('I' + options.serviceName),
            actionName = options.actionName || options.action || 'GetServiceInfo',
            soapEnvelopeTemplate = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://www.theobald-software.com/ERPConnectServices/WebServices"><soapenv:Header/><soapenv:Body><web:{0}>{1}</web:{0}></soapenv:Body></soapenv:Envelope>',
            buildSoapParameters = function(params) {
                if (!params) {
                    return '';
                }

                var paramTemplate = '<web:{0}>{1}</web:{0}>',
                    paramString = constants.empty;
                for (var paramIndex in params) {
                    var param = params[paramIndex],
                        typeOfParam = typeof param;

                    if (param.indexOf("'") > -1) {
                        self.warn('Soap Parameter has quote-sign.');
                    }

                    if (typeOfParam === 'object') {
                        paramString += self.format(paramTemplate, paramIndex, buildSoapParameters(param));
                    } else if (typeOfParam === 'array') {
                        for (var arrayIndex in param) {
                            //TODO
                            paramString += self.format(paramTemplate, paramIndex, param[arrayIndex]);
                        }
                    } else {
                        paramString += self.format(paramTemplate, paramIndex, param);
                    }
                }

                return paramString;
            },
            ajaxOptions = {
                contentType: 'text/xml; charset=utf-8',
                headers: {
                    SOAPAction: wsdNamespace + this.insureSlash(interfaceName) + actionName
                },
                type: 'POST',
                url: url
            },
            doneHandler = function(data, xhr) {
                self.log('Service OK');

                if (options.done) {
                    options.done(data, xhr);
                }
            },
            failHandler = function(jqXhr, textStatus, errorThrown) {
                self.error('Service ERROR: %s, %o', textStatus, errorThrown);

                if (options.fail) {
                    options.fail(jqXhr, textStatus, errorThrown);
                }
            };

        ajaxOptions.data = this.format(soapEnvelopeTemplate, actionName, buildSoapParameters(options.data));

        // overrides
        this._extend(ajaxOptions, options.ajax);

        var d = self.ajax(ajaxOptions).done(doneHandler).fail(failHandler);

        if (options.always) {
            d.always(options.always);
        }

        return d;
    };

    //#endregion Soap / WebServiceDesigner companion

    //#region Metadata

    p.getSapLogonLanguage = function(options) {
        // todo parse LANGU parameter
        return this.executeFunction(this._extend({
            name: this.constants.sap.functions.CrystalGetLogonLanguage
        }, options));
    };

    //#endregion Metadata

    //#endregion Environment Helpers

    t.ecs = new t[ns]();

    if (p.isSharepointOnline()) {
        session.sponline = true;
    }

    p.initialize = function() {
        //#region STUBS (are replaced, when full version loaded)

        // no logic, config/defaults
        t.ecs.config = t.ecs.defaultConfig;
        t.ecs.strings = t.ecs.localizableStrings.en;

        // stab for loggin override
        var log = function() {
            var firstParameter = arguments[0],
                prefix = t.ecs.className + constants.colonSpace;

            // static, could be used for UI clues in pure version
            // call?
            if (t.ecs.extendedLogger) {
                t.ecs.extendedLogger(arguments);
            }

            if (typeof firstParameter === 'string') {
                firstParameter = prefix + firstParameter;
            }

            console.log.apply(console, arguments);
        };

        // function dummies
        // could they be passed as parameters?
        t.ecs._extend(t.ecs, {
            trace: log,
            debug: log,
            info: log,
            warn: log,
            error: log,
            enull: function(parameters) {
                log('undefinedParameter: ' + parameters);
            }
        });

        deferreds.Ecs.resolve();
        //#endregion STUBS
    };

    // expose global object
    window.tEcs = t.ecs;

    if (t.moduleName === 'theobald.ecs.micro') {
        // micro lib
        p.initialize();
    } else {
        // full lib
        if (!deferreds.Core) {
            deferreds.Core = t.newDeferred();
        }

        deferreds.Core.done(function() {
            t.core.initModule(t[objectName], function() {
                // logic to detect ecscore is sharepoint online and set ecscore
                if (session.sponline && !t.ecs.config.connection.ecs.core) {
                    t.ecs.config.connection.ecs.core = true;
                    // check if this reflects in the settings grid
                    t.ecs.saveConfig(false, true);

                    t.core.getDeferred('Log').done(function() {
                        t.ecs.info(t.ecs.strings.info.ecscoreMode);
                    });
                }
            });
        });
    }

    return t[objectName];
});


define("theobald.ecs.micro.js", function(){});

require(["theobald.ecs"]);
})()
