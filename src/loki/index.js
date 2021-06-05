/* eslint-disable */
/**
 * A Loki JavaScript utility providing various functions for loki data and services
 * available at urn:com:loki:js:app:pages:lokiJs!loki.js and urn:com:loki:jquery:app:pages:lokiJQuery!lokiJQuery.js
 */

// Assign freemarker variables that allow freemarker tags not to mess up js syntax
// <#assign start = "*"+"/">
// <#assign end = "/"+"*">
//


import axios from "axios";
import {isArray} from "lodash-es";
const loki = {};

/**
 * @namespace loki.web
 * @memberOf module:lokiJs
 */
loki.web = {
    urlPrefixes: {
        api:
      "${loki.web.serviceUrlPrefix(\"urn:com:loki:meta:model:types:webService\")}",
        pages:
      "${loki.web.serviceUrlPrefix(\"urn:com:loki:meta:model:types:webPage\")}",
    },

    /**
   *
   * @return {String}
   */
    getApiServicePrefix () {
        return loki.web.urlPrefixes.api;
    },

    /**
   *
   * @return {String}
   */
    getPagesPrefix () {
        return loki.web.urlPrefixes.pages;
    },

    /**
   *
   * @param {type} urn
   * @return {unresolved}
   */
    urnToUrlPath (urn) {
        if (urn) {
            const exLoc = urn.lastIndexOf("!");
            const hashLoc = urn.lastIndexOf("#");
            const cLoc = urn.lastIndexOf(":");
            const pLoc = urn.lastIndexOf(".");

            urn = urn.replace(/#/g, "%23");
            urn = urn.replace(/:/g, "/");

            if (hashLoc != -1) {
                // contained entities are unambiguous so no work is needed here
            } else if (exLoc == -1 && pLoc > cLoc) {
                // urn is an entity urn with a "." in the last segment
                // explicity add back a ":" to make sure loki doesn't think this is a resource.
                urn = `${urn.substring(0, cLoc)}:${urn.substring(cLoc + 1)}`;
            } else if (exLoc != -1 && pLoc < exLoc) {
                // urn is an resource urn with no "." in the last segment
                // explicity add back a "!" to make sure loki doesn't think this is an entity.
                urn = `${urn.substring(0, cLoc)}:${urn.substring(cLoc + 1)}`;
            }

            return urn;
        }

        return null;
    },

    /**
   *
   * @param {type} urn
   * @return {unresolved}
   */
    urnToUrlParams (urn) {
        if (urn !== null) {
            return urn.replace(/#/g, "%23");
        }

        return null;
    },

    // Constructs a url for the resource.
    // This url will point to a web service that returns the resource's data (GET) or allows the resource to be modified (POST,DELETE).
    //
    // @param {string} resourceUrn the urn of the resource
    // @param {object} options the options for construction the resource url
    // @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
    // @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
    // @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
    // @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
    // @param {boolean} options.download specifies whether the attachment content-disposition header should be set so that the file is automatically downloaded by the browser. If omitted download is defaulted to false.
    // @return {string} the url for the resource
    //
    //
    resourceUrl (resourceUrn, options, notUsed3) {
        if (options === null || typeof options === "string") {
            console.log("loki.web.resourceUrl(resourceUrn, queryParams, download) is deprecated, please use loki.web.resourceUrl(resourceUrn,options)");
            options = {
                queryParams: options,
                download: notUsed3,
            };
        }
        if (!options) {
            options = {};
        }
        options.subjectUrn = resourceUrn;
        options.serviceUrn = "urn:com:loki:core:model:api:resource";
        options.serviceTypePrefix = loki.web.getApiServicePrefix();
        if (options.download) {
            if (!options.queryParams) {
                options.queryParams = "download=true";
            } else {
                options.queryParams = `${options.queryParams}&download=true`;
            }
        }

        return loki.web.serviceUrl(options);
    },

    // Constructs a url for the resource and appends a release parameter that allows for recaching when a major release is pushed.
    // This url will point to a web service that returns the resource's data (GET)
    //
    // @param resourceUrn the urn of the resource
    // @param {object} options the options for construction the resource url
    // @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
    // @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
    // @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
    // @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
    // @param {boolean} options.download specifies whether the attachment content-disposition header should be set so that the file is automatically downloaded by the browser. If omitted download is defaulted to false.
    // @return {string} the url for the resource
    //
    resourceUrlWithCacheCheck (resourceUrn, options, notUsed3) {
        if (options === null || typeof options === "string") {
            console.log("loki.web.resourceUrlWithCacheCheck(resourceUrn, queryParams, download) is deprecated, please use loki.web.resourceUrlWithCacheCheck(resourceUrn,options)");
            options = {
                queryParams: options,
                download: notUsed3,
            };
        }
        if (!options) {
            options = {};
        }
        options.cacheCheck = true;
        const url = loki.web.resourceUrl(resourceUrn, options);

        return url;
    },

    /**
   *
   * @deprecated for backward compatibility, use resourceUrlWithCacheCheck() instead
   */
    resourceUrlwithCacheCheck (resourceUrn, queryParams, download) {
        console.log("loki.web.resourceUrlwithCacheCheck() is deprecated, please use loki.web.resourceUrlWithCacheCheck() instead");

        return loki.web.resourceUrlWithCacheCheck(
            resourceUrn,
            queryParams,
            download
        );
    },

    /**
   *
   * @param {String} imageUrn
   * @param {String} sizeUrn
   * @return {String}
   */
    imageUrl (imageUrn, sizeUrn) {
        const urnPath = loki.web.urnToUrlPath(imageUrn);
        const apiPrefix = loki.web.getApiServicePrefix();
        let url = `${apiPrefix}urn/com/loki/core/model/api/image/v/${urnPath}`;

        if (typeof sizeUrn !== "undefined" && sizeUrn !== null) {
            url = `${url}?size=${loki.web.urnToUrlParams(sizeUrn)}`;
        }

        return url;
    },

    // Constructs a url for the page with the given parameters
    //
    // @param {type} pageUrn the urn of the page
    // @param {object} options the options for construction the page url
    // @param {string} options.subjectUrn the urn of the data to be displayed on the page or null if there is no subject data
    // @param {type} options.serviceUrn same as options.pageUrn
    // @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
    // @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
    // @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
    // @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
    // @return {String} the url for the page
    //
    pageUrl (pageUrn, options, notUsed3, notUsed4) {
        if (options === null || typeof options === "string") {
            console.log("loki.web.pageUrl(subjectUrn,pageUrn,queryParams,urlPrefix) is deprecated, please use loki.web.pageUrl(pageUrn,options)");
            const param1 = pageUrn;
            const param2 = options;

            pageUrn = param2;
            options = {
                subjectUrn: param1,
                queryParams: notUsed3,
                urlPrefix: notUsed4,
            };
        }
        if (!options) {
            options = {};
        }
        options.serviceUrn = pageUrn;
        options.serviceTypePrefix = loki.web.getPagesPrefix();

        return loki.web.serviceUrl(options);
    },

    // Constructs a url for the page with the given parameters and appends a release parameter that allows for recaching when a major release is pushed.
    //
    // @param {type} pageUrn the urn of the page
    // @param {object} options the options for construction the page url
    // @param {string} options.subjectUrn the urn of the data to be displayed on the page or null if there is no subject data
    // @param {type} options.serviceUrn same as options.pageUrn
    // @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
    // @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
    // @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
    // @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
    // @return {String} the url for the page
    //
    pageUrlWithCacheCheck (pageUrn, options, notUsed3, notUsed4) {
        if (options === null || typeof options === "string") {
            console.log("loki.web.pageUrlWithCacheCheck(subjectUrn,pageUrn,queryParams,urlPrefix) is deprecated, please use loki.web.pageUrlWithCacheCheck(pageUrn,options)");
            const param1 = pageUrn;
            const param2 = options;

            pageUrn = param2;
            options = {
                subjectUrn: param1,
                queryParams: notUsed3,
                urlPrefix: notUsed4,
            };
        }
        if (!options) {
            options = {};
        }
        options.cacheCheck = true;

        return loki.web.pageUrl(pageUrn, options);
    },

    /**
   *
   * @deprecated for backward compatibility, use pageUrlWithCacheCheck() instead
   */
    pageUrlwithCacheCheck (subjectUrn, pageUrn, queryParams, prefix) {
        console.log("loki.pageUrlwithCacheCheck() is deprecated, please use loki.pageUrlWithCacheCheck() instead");

        return loki.web.pageUrlWithCacheCheck(
            subjectUrn,
            pageUrn,
            queryParams,
            prefix
        );
    },

    // Constructs a url for a resource in the model dataspace
    // This url will point to a web service that returns the resource's data (GET) or allows the resource to be modified (POST,DELETE).
    // BY DEFAULT CACHE CHECK IS ON which appends a release parameter that allows for recaching when a major release is pushed.
    //
    // @param {string} resourceUrn the urn of the resource
    // @param {object} options the options for construction the resource url
    // @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
    // @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
    // @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
    // @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
    // @param {boolean} options.download specifies whether the attachment content-disposition header should be set so that the file is automatically downloaded by the browser. If omitted download is defaulted to false.
    // @return {string} the url for the resource
    //
    //
    modelResUrl (resourceUrn, options) {
        if (!options) {
            options = {};
        }
        options.subjectUrn = resourceUrn;
        options.serviceUrn = "urn:com:loki:core:model:api:modelResource";
        options.serviceTypePrefix = loki.web.getApiServicePrefix();
        if (options.download) {
            if (!options.queryParams) {
                options.queryParams = "download=true";
            } else {
                options.queryParams = `${options.queryParams}&download=true`;
            }
        }
        options.cacheCheck = true;

        return loki.web.serviceUrl(options);
    },

    /**
   *
   * @param {type} destUrn
   * @return {String}
   */
    uploadUrl (destUrn) {
        const urnPath = loki.web.urnToUrlPath(destUrn);
        const apiPrefix = loki.web.getApiServicePrefix();

        return `${apiPrefix}urn/com/loki/core/model/api/upload/v/${urnPath}`;
    },

    /**
   *
   * @param {type} sourceUrn
   * @param {type} destUrn
   * @param {type} viewUrn
   * @param {type} options of form {merge:"true",genUrnFromField:"no"}
   * @return {String}
   */
    importUrl (sourceUrn, destUrn, viewUrn, options) {
        const destPath = loki.web.urnToUrlPath(destUrn);
        const apiPrefix = loki.web.getApiServicePrefix();
        let url = `${apiPrefix}urn/com/loki/importData/model/api/importData/v/${destPath}?source=${sourceUrn}`;

        if (typeof viewUrn !== "undefined" && viewUrn !== null) {
            url = `${url}&importView=${viewUrn}`;
        }
        if (options) {
            for (const option in options) {
                url = `${url}&${option}=${options[option]}`;
            }
        }

        return url;
    },

    // Returns a url for a loki data web service (CRUD service)
    // @param {string} entityUrn the urn of the entity to create/read/update/delete
    // @param {string} viewUrn the view to user for a create/read/update
    // @param {object} options the options for construction the data web service url
    // @param {string} options.queryParams any query parmeters to be added to the url
    // @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
    // @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
    // @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
    // @return {string} the url for the web service
    //
    dataServiceUrl (entityUrn, viewUrn, options) {
        if (!options) {
            options = {};
        }
        options.subjectUrn = entityUrn;
        options.serviceUrn = viewUrn;
        options.serviceTypePrefix = loki.web.getApiServicePrefix();

        return loki.web.serviceUrl(options);
    },

    // Returns a url for a loki web service
    // @param {string} serviceUrn the urn of the web service to call
    // @param {object} options the options for construction the web service url
    // @param {string} options.subjectUrn the urn of the main entity/resource on which to execute the service
    // @param {string} options.queryParams any query parmeters to be added to the url
    // @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
    // @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
    // @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
    // @return {string} the url for the web service
    //
    webServiceUrl (serviceUrn, options, notUsed3, notUsed4) {
        if (options === null || typeof options === "string") {
            console.log("loki.web.webServiceUrl(subjectUrn,serviceUrn,queryParams,urlPrefix) is deprecated, please use loki.web.webServiceUrl(serviceUrn,options)");
            const param1 = serviceUrn;
            const param2 = options;

            serviceUrn = param2;
            options = {
                subjectUrn: param1,
                queryParams: notUsed3,
                urlPrefix: notUsed4,
            };
        }
        if (!options) {
            options = {};
        }
        options.serviceUrn = serviceUrn;
        options.serviceTypePrefix = loki.web.getApiServicePrefix();

        return loki.web.serviceUrl(options);
    },

    // Returns a url for a loki service (web service, page, or data service)
    // @param {object} options the options for construction the  service url
    // @param {string} options.subjectUrn the urn of the main entity on which to execute the service
    // @param {string} options.serviceUrn the urn of the web service to call
    // @param {string} options.serviceTypePrefix for local services, this is the prefix for the type of service. Typically /pages or /api
    // @param {string} options.queryParams any query parmeters to be added to the url
    // @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
    // @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
    // @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
    // @param {string} options.cacheCheck if true add a url param that forces the browser to refresh the page in cache when a new release is deployed.
    // @return {string} the url for the service
    //
    serviceUrl (options) {
        let newServiceUrn = options.serviceUrn;
        let newPrefix = "";

        if (options.urlPrefix) {
            newPrefix = options.urlPrefix;
        } else if (options.connection) {
            var conn = options.connection;

            if (conn) {
                newPrefix = conn.url;
                if (newServiceUrn.slice(0, 1) === ":") {
                    newServiceUrn = conn.rootUrn + newServiceUrn;
                }
            }
        } else if (options.serviceGroupUrn) {
            var conn = loki.environ.getConnection(options.serviceGroupUrn);

            if (conn) {
                newPrefix = conn.url;
                if (newServiceUrn.slice(0, 1) === ":") {
                    newServiceUrn = conn.rootUrn + newServiceUrn;
                }
            }
        } else {
            newPrefix = options.serviceTypePrefix;
        }
        if (newPrefix.slice(-1) !== "/") {
            newPrefix = `${newPrefix}/`;
        }

        let serviceUrnPath = "";

        if (newServiceUrn) {
            serviceUrnPath = loki.web.urnToUrlPath(newServiceUrn);
        }

        let subjectUrnPath = "";

        if (options.subjectUrn) {
            subjectUrnPath += loki.web.urnToUrlPath(options.subjectUrn);
        }

        let {queryParams} = options;

        if (options.cacheCheck) {
            if (queryParams) {
                queryParams = `${queryParams}&release=${loki.app.getReleaseNumber()}`;
            } else {
                queryParams = `?release=${loki.app.getReleaseNumber()}`;
            }
        }

        let url = `${newPrefix + serviceUrnPath}/v/${subjectUrnPath}`;

        url = loki.web._appendParamsToUrl(url, queryParams);

        return url;
    },

    homeUrl: "${loki.web.homeUrl!}",
    unauthorizedUrl: "${loki.web.unauthorizedUrl!}",
    notFoundUrl: "${loki.web.notFoundUrl!}",

    _appendParamsToUrl (url, queryParams) {
        if (queryParams) {
            if (queryParams.charAt(0) === "&") {
                queryParams = queryParams.substring(1);
            }
            if (queryParams.charAt(0) !== "?") {
                url = `${url}?`;
            }
            url += queryParams;
        }

        return url;
    },
};

/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.data = {

    // List all the children of the given urn
    //
    // @param {type} urn
    // @param {type} [callback]
    // @param {Object} [options] service options of format: {format:"json",beginIdx:0,numRequested:20,outputView:"urn:com:myView"}
    // @return {undefined}
    // @deprecated removed due to dependence on jquery
    //
    list (urn, callback, options) {
        console.log("loki.data.list is deprecated, please remove usage.");
        let params = "";

        if (options) {
            if (options.format) {
                const {format} = options;

                params = `${params}&format=${format}`;
            }
            if (options.beginIdx) {
                const {beginIdx} = options;

                params = `${params}&begin=${beginIdx}`;
            }
            if (options.numRequested) {
                const {numRequested} = options;

                params = `${params}&num=${numRequested}`;
            }
            if (options.outputView) {
                const outputView = loki.urnToUrlParams(options.outputView);

                params = `${params}&outputView=${outputView}`;
            }
            if (params.length > 0) {
                params = params.substring(1); // remove begining amp
            }
        }
        const url = loki.web.webServiceUrl(
            urn,
            "urn:com:loki:core:model:api:list",
            params
        );
    /** @type {JQueryAjaxSettings} */
        const ajaxOptions = {
            type: "GET",
            url,
            dataType: "jsonp",
            jsonp: "jsoncallback",
            success (response) {
                if (callback !== null && typeof callback === "function") {
                    callback(null, response);
                }
            },
            error (response) {
                if (callback !== null && typeof callback === "function") {
                    callback("Error getting children.", response);
                }
            },
        };

        axios
            .get(url)
            .then((d) => ajaxOptions.success(d.data))
            .catch((e) => ajaxOptions.error(e.response));
    // $.ajax(ajaxOptions);
    },
    loadEntity (a, b, c) {
        c = c || {};
        c.format
            ? c.queryParams = `format\x3d${c.format}`
            : (c.queryParams = "format\x3djson",
            c.format = "json");
        c.dataSpaceUrn && (c.queryParams = `${c.queryParams}\x26dataSpaceUrn\x3d${c.dataSpaceUrn}`);
        let d = null,
            h = c.format;

        c.jsonp && (d = "jsoncallback",
        h = "jsonp");
        c.format === "xml" && (h = "text");
        a = loki.web.dataServiceUrl(a, b, c);
        /** @type {JQueryAjaxSettings} */
        const ajaxOptions = {
            type: "GET",
            url: a,
            dataType: "jsonp",
            jsonp: "jsoncallback",
            success (response) {
                if (callback !== null && typeof callback === "function") {
                    callback(null, response);
                }
            },
            error (response) {
                if (callback !== null && typeof callback === "function") {
                    callback("Error getting children.", response);
                }
            },
        };

        axios
            .get(a)
            .then((d) => ajaxOptions.success(d.data))
            .catch((e) => ajaxOptions.error(e.response));
    },
    query (options, unused) {
        if (typeof options === "string") {
        // handle loki.data.query(queryUrn,options) in a backward compatible way
            console.log("loki.data.query(queryUrn,options) is deprecated, please use loki.data.query(options) where one option is 'queryUrn'.");
            unused.queryUrn = options;
            options = unused;
        }
        options = options || {};
        if (options.engine && !options.dataSpaceUrn) {
            options.dataSpaceUrn = options.engine;
            console.log("The options.query param is deprecated fro loki.data.query(). Use options.dataSpaceUrn instead.");
        }
    
        let hasOutputView = false;
    
        if (options.outputView || options.outputViews) {
            hasOutputView = true;
        }
    
        let post;
    
        if (typeof options.post !== "undefined") {
            post = options.post;
        } else if (options.queryUrn) {
            post = false; // default to GET when there is a queryUrn so that we have a easy to repeat url for the query
        } else {
            post = true; // default to POST for an adhoc query
        }
    
        let jsonpCallback = null;
        let dataType = "json";
    
        if (options.jsonp) {
            jsonpCallback = "jsoncallback";
            dataType = "jsonp"; // automatically adds callback param to url
        }
    
        let {queryUrn} = options;
    
        if (queryUrn && options.connection) {
            if (queryUrn.startsWith(":")) {
                // use connection root if there is no root to the queryUrn
                queryUrn = options.connection.rootUrn + queryUrn;
            }
        }
    
        let headers;
    
        if (options.useCurrentUserAuth && loki.user.getUserSessionKey) {
            headers = {Authorization: `LOKISESSION ${loki.user.getUserSessionKey()}`};
        }
    
        let url;
        let promise;
    
        if (post) {
        // POST
            url = loki.web.webServiceUrl("urn:com:loki:core:model:api:query", {
                subjectUrn: null,
                queryParams: "",
                serviceGroupUrn: options.serviceGroupUrn,
                connection: options.connection,
                urlPrefix: options.urlPrefix,
            });
            const postOpts = JSON.parse(JSON.stringify(options)); // make a copy
    
            postOpts.queryUrn = queryUrn;
            delete postOpts.mapResults;
            delete postOpts.post;
            if (typeof postOpts.begin !== "undefined") {
                postOpts.beginIdx = postOpts.begin; // the post json param is beginIdx for the web service
                delete postOpts.begin;
            }
            if (typeof postOpts.num !== "undefined") {
                postOpts.numRequested = postOpts.num; // the post json param is numRequested for the web service
                delete postOpts.num;
            }
            const ajaxOptions = {
                type: "POST",
                url,
                contentType: "application/json",
                data: JSON.stringify(postOpts),
                dataType,
                jsonp: jsonpCallback,
    
                // beforeSend: function(xhr){loki.data._setHeaders(xhr,headers);},
                headers,
            };
    
            promise = axios.post(url, {data: postOpts}).then((d) => d.data);
        // promise = $.ajax(ajaxOptions);
        } else {
        // GET
            let params;
    
            if (queryUrn) {
                params = `queryUrn=${loki.web.urnToUrlParams(queryUrn)}`;
            } else if (options && !options.post) {
                params = `query=${encodeURIComponent(options.query)}`;
            }
            if (options.format) {
                params = `${params}&format=${options.format}`;
            } else {
                params = `${params}&format=json`; // default to json
            }
            if (options.beginIdx) {
                params = `${params}&begin=${options.beginIdx}`;
            }
            if (options.begin) {
                params = `${params}&begin=${options.begin}`;
            }
            if (options.numRequested) {
                params = `${params}&num=${options.numRequested}`;
            } else if (options.num) {
                params = `${params}&num=${options.num}`;
            }
            if (options.dataSpaceUrn) {
                params =
            `${params
            }&dataSpaceUrn=${
                loki.web.urnToUrlParams(options.dataSpaceUrn)}`;
            }
            if (options.outputView) {
                const outputView = loki.web.urnToUrlParams(options.outputView);
    
                params = `${params}&outputView=${outputView}`;
            }
    
            let outputViewParam = "";
    
            if (options.outputView) {
                outputViewParam =
            `&outputView=${loki.web.urnToUrlParams(options.outputView)}`;
            } else if (options.outputViews) {
                for (var i in options.outputViews) {
                    outputViewParam =
              `${outputViewParam
              }&outputView=${
                  loki.web.urnToUrlParams(options.outputViews[i])}`;
                }
            }
            params += outputViewParam;
    
            let paramParam = "";
    
            // Numbered parameters are p1, p2, p3, etc and can be multi valued arrays
    
            if (options.params) {
                for (var i = 0; i < options.params.length; i++) {
                    if (isArray(options.params[i])) {
                        // This parameter is an array, repeat its values in the p{x} url parameter
                        for (let j = 0; j < options.params[i].length; j++) {
                            paramParam =
                  `${paramParam
                  }&p${
                      i + 1
                  }=${
                      encodeURIComponent(options.params[i][j])}`;
                        }
                    } else {
                        paramParam =
                `${paramParam
                }&p${
                    i + 1
                }=${
                    encodeURIComponent(options.params[i])}`;
                    }
                }
            }
            // Named parameters are a name/value map and can have multi valued arrays
            if (options.namedParams) {
                paramParam += loki.data._addParams(options.namedParams, "p_");
            }
            // Expression parameters are a name/value map and can have multi valued arrays
            if (options.expressionParams) {
                paramParam += loki.data._addParams(options.expressionParams, "e_");
            }
            params += paramParam;
    
            url = loki.web.webServiceUrl("urn:com:loki:core:model:api:query", {
                subjectUrn: null,
                queryParams: params,
                serviceGroupUrn: options.serviceGroupUrn,
                connection: options.connection,
                urlPrefix: options.urlPrefix,
            });
    
            /** @type {JQueryAjaxSettings} */
            const ajaxOptions = {
                type: "GET",
                url,
                dataType,
                jsonp: jsonpCallback,
    
                // beforeSend: function(xhr){loki.data._setHeaders(xhr,headers);},
                headers,
            };
    
            promise = axios.get(url).then((d) => d.data);
        // promise = $.ajax(ajaxOptions);
        }
        promise = loki.data._handleJsonp(promise, options);
    
        if (options.mapResults) {
            promise = promise.then((data) => loki.data._mapResultsFilter(data, hasOutputView));
        }
    
        return promise;
    }
};

/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.user = {
    unauthorizedUrl: loki.web.unauthorizedUrl,
    resetPasswordUrl:
    "${loki.web.urls[\"urn:com:loki:config:data:urlUses#resetPassword\"]!}",
    getUserUrn () {
        return loki._config.userUrn;
    },
    isLoggedIn () {
        return loki._config.isLoggedIn;
    },
    isGuest () {
        return loki._config.isGuest;
    },
    getUserData () {
        return loki._config.userData;
    },
    getFunctionUrns () {
        return loki._config.userFunctionUrns;
    },
    canPerformFunction (functionUrn) {
        let canPerform = false;

        if (loki._config.userFunctionUrns) {
            for (let i = 0; i < loki._config.userFunctionUrns.length; i++) {
                if (functionUrn === loki._config.userFunctionUrns[i]) {
                    canPerform = true;
                    break;
                }
            }
        }

        return canPerform;
    },

    /**
   *
   * @param {type} username
   * @param {type} password
   * @param {type} callback
   * @return {undefined}
   * TODO: remove due to dependence on jquery
   */
    login (username, password, callback) {
        const data = {
            username,
            password,
        };
        const url = loki.web.webServiceUrl("urn:com:loki:core:model:api:login");
    /** @type {JQueryAjaxSettings} */
        const ajaxOptions = {
            type: "POST",
            url,
            dataType: "json",
            // dataType : 'jsonp', // automatically adds callback param to url
            // jsonp : 'jsoncallback', // name of callback param
            data: JSON.stringify(data),
            // processData: false, // send data in body
            contentType: "application/json",
            success (response) {
                if (response.success) {
                    loki._config.userUrn = response.userUrn;
                }
                if (callback !== null && typeof callback === "function") {
                    callback(null, response);
                }
            },
            error (response) {
                if (callback !== null && typeof callback === "function") {
                    callback("Error logging in.", response);
                }
            },
        };

        axios
            .get(url, {data})
            .then((d) => ajaxOptions.success(d.data))
            .catch((e) => ajaxOptions.error(e.response));
    // $.ajax(ajaxOptions);
    },

    /**
   *
   * @param {type} callback
   * @return {undefined}
   */
    logout (callback) {
        loki.user.login(null, null, callback);
    },

    // Returns the user's session key used to keep the user logged in.
    //
    //
    getUserSessionKey () {
        const getCookie = function (name) {
            let value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);

            if (parts.length == 2) {
                value = parts
                    .pop()
                    .split(";")
                    .shift();
                if (value.slice(0, 1) === "\"") {
                    value = value.substring(1);
                }
                if (value.slice(-1) === "\"") {
                    // endsWith
                    value = value.substring(0, value.length - 1);
                }

                return value;
            }
        };

        return getCookie("lokiLoginSession");
    },

    authRootUrns: [

    // FREEMARKER ASSIGNMENT ${start}
    // <#assign i=0>
    // <#list loki.user.authRootUrns as authRootUrn>
    //     <#if (i > 0)>,</#if>"${authRootUrn}"
    //     <#assign i=i+1>
    // </#list>
    // ${end}
    ],
};

/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.urn = {

    // Returns Checks if the urn is a urn with a new marker '$' in it.
    //
    // @param {type} urn
    // @return {boolean} true if the urn is a urn with a new marker in it; false otherwise.
    //
    isNew (urn) {
        return urn.indexOf("$") >= 0;
    },

    // Checks if the urn is a resource urn (with the resource marker '!' in it)
    //
    // @param {type} urn
    // @return {boolean} true if the urn is a resource urn; false otherwise.
    //
    isResourceUrn (urn) {
        return urn.indexOf("!") >= 0;
    },

    // Checks if the urn contains a version component
    //
    // @param {type} urn
    // @return {boolean} true if the urn contains a version component; false otherwise
    //
    hasVersion (urn) {
        return urn.indexOf("~") >= 0;
    },

    // Returns the version component of the urn if there is one
    //
    // @param {type} urn
    // @return {string} the version component of the urn
    //
    getVersion (urn) {
        const idx = urn.indexOf("~");

        if (idx >= 0 && idx != urn.length() - 1) {
            return urn.substring(idx + 1);
        }

        return null;
    },

    // returns the last segment of the given urn
    //
    // @param {string} urn
    // @returns {string} the last segment of the given urn
    //
    getLastSegment (urn) {
        if (!urn) {
            return null;
        }
        let index = -1;
        const index1 = urn.lastIndexOf(":");
        const index2 = urn.lastIndexOf("#");
        const index3 = urn.lastIndexOf("!");

        if (index1 > index2 && index1 > index3) {
            index = index1;
        } else if (index2 > index3) {
            index = index2;
        } else {
            index = index3;
        }
        let lastSegment;

        if (index < 0) {
            lastSegment = urn;
        } else {
            lastSegment = urn.substring(index + 1);
        }

        return lastSegment;
    },
};
loki.urn.getUrnLastSegment = loki.urn.getLastSegment;
loki.urn.isNewUrn = loki.urn.isNew;

/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.app = {
    appInstanceUrn: "${loki.app.appInstanceUrn!}",
    lokiNodeUrn: "${loki.app.lokiNodeUrn!}",
    getReleaseNumber () {
        return loki._config.systemReleaseNumber;
    },
    isDebug () {
        return loki._config.isDebug;
    },
    getReleaseTierUrn () {
        console.log("loki.app.getReleaseTierUrn() is deprecated, please use loki.app.isDebug() instead.");

        return loki._config.systemReleaseTierUrn;
    },
    rootUrn: "${loki.app.rootUrn!}",
};

/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.model = {
    addConnection (connection) {
        if (connection) {
            loki.environ._connections.push(connection);
        }
    },
    getConnectionByServiceGroup (serviceGroupUrn) {
        for (let i = 0; i < loki.environ._connections.length; i++) {
            const aConn = loki.environ._connections[i];

            if (aConn.serviceGroupUrn === serviceGroupUrn) {
                return aConn;
            }
            if (aConn.serviceGroupUrns) {
                for (let j = 0; j < aConn.serviceGroupUrns.length; j++) {
                    if (aConn.serviceGroupUrns[j] === serviceGroupUrn) {
                        return aConn;
                    }
                }
            }
        }

        return null;
    },
    modelRootUrns: [

    // FREEMARKER ASSIGNMENT ${start}
    // <#assign i=0>
    // <#list loki.model.modelRootUrns as modelRootUrn>
    //     <#if (i > 0)>,</#if>"${modelRootUrn}"
    //     <#assign i=i+1>
    // </#list>
    // ${end}
    ],

    // FREEMARKER ASSIGNMENT ${start}
    // ,modelDataSpaces :${loki.model.getModelDataSpacesSerialized("json")}
    // ,dataSpaces : ${loki.model.getDataSpacesSerialized("json")}
    // ${end}
};
loki.app.appPackRootUrns = loki.model.modelRootUrns; // for backward compatibility

loki.environ = {
    _connections: [],
    addConnection (connection) {
        console.log("loki.environ.addConnection() is deprecated, please use loki.model.addConnection() instead.");
        if (connection) {
            loki.environ._connections.push(connection);
        }
    },
    getConnection (serviceGroupUrn) {
        console.log("loki.environ.getConnection() is deprecated, please use loki.model.getConnectionByServiceGroup() instead.");

        return loki.model.getConnectionByServiceGroup(serviceGroupUrn);
    },
};

/**
 * Set global configuration for the loki module
 * systemReleaseNumber - the global release number for the system.
 * userUrn - the urn of the current user
 * isLoggedIn - boolean that indicates whether a user is logged in
 * userData - data about the current user.
 * @memberOf module:lokiJs
 * @param {Object} config a configuration object of the format { systemReleaseNumber:xxx, userUrn:yyy }
 */
loki.config = function (config) {
    for (const item in config) {
        loki._config[item] = config[item];
    }
};
loki._config = {
    systemReleaseNumber: null,
    systemReleaseTierUrn: null,
    userUrn: null,
    isLoggedIn: null,
    userData: null,
    userFunctionUrns: null,
};

// for backward compatibility
loki.urlPrefixes = function (a, b, c, d, e, f) {
    console.log("loki.urlPrefixes() is deprecated, please use loki.web.urlPrefixes().");

    return loki.web.urlPrefixes(a, b, c, d, e, f);
};
loki.getApiServicePrefix = function (a, b, c, d, e, f) {
    console.log("loki.getApiServicePrefix() is deprecated, please use loki.web.getApiServicePrefix().");

    return loki.web.getApiServicePrefix(a, b, c, d, e, f);
};
loki.getPagesPrefix = function (a, b, c, d, e, f) {
    console.log("loki.getPagesPrefix() is deprecated, please use loki.web.getPagesPrefix().");

    return loki.web.getPagesPrefix(a, b, c, d, e, f);
};
loki.urnToUrlPath = function (a, b, c, d, e, f) {
    console.log("loki.urnToUrlPath() is deprecated, please use loki.web.urnToUrlPath().");

    return loki.web.urnToUrlPath(a, b, c, d, e, f);
};
loki.urnToUrlParams = function (a, b, c, d, e, f) {
    console.log("loki.urnToUrlParams() is deprecated, please use loki.web.urnToUrlParams().");

    return loki.web.urnToUrlParams(a, b, c, d, e, f);
};
loki.resourceUrl = function (a, b, c, d, e, f) {
    console.log("loki.resourceUrl() is deprecated, please use loki.web.resourceUrl().");

    return loki.web.resourceUrl(a, b, c, d, e, f);
};
loki.imageUrl = function (a, b, c, d, e, f) {
    console.log("loki.imageUrl() is deprecated, please use loki.web.imageUrl().");

    return loki.web.imageUrl(a, b, c, d, e, f);
};
loki.pageUrl = function (a, b, c, d, e, f) {
    console.log("loki.pageUrl() is deprecated, please use loki.web.pageUrl().");

    return loki.web.pageUrl(a, b, c, d, e, f);
};
loki.uploadUrl = function (a, b, c, d, e, f) {
    console.log("loki.uploadUrl() is deprecated, please use loki.web.uploadUrl().");

    return loki.web.uploadUrl(a, b, c, d, e, f);
};
loki.importUrl = function (a, b, c, d, e, f) {
    console.log("loki.importUrl() is deprecated, please use loki.web.importUrl().");

    return loki.web.importUrl(a, b, c, d, e, f);
};
loki.webServiceUrl = function (a, b, c, d, e, f) {
    console.log("loki.webServiceUrl() is deprecated, please use loki.web.webServiceUrl().");

    return loki.web.webServiceUrl(a, b, c, d, e, f);
};
loki.list = function (a, b, c, d, e, f) {
    console.log("loki.list() is deprecated, please use loki.data.list().");

    return loki.data.list(a, b, c, d, e, f);
};
loki.getKnownChildren = function (a, b, c, d, e, f) {
    console.log("loki.getKnownChildren() is deprecated, please use loki.data.list().");

    return loki.data.list(a, b, c, d, e, f);
};
loki.login = function (a, b, c, d, e, f) {
    console.log("loki.login() is deprecated, please use loki.user.login().");

    return loki.user.login(a, b, c, d, e, f);
};
loki.logout = function (a, b, c, d, e, f) {
    console.log("loki.logout() is deprecated, please use loki.user.logout().");

    return loki.user.logout(a, b, c, d, e, f);
};
loki.isNewUrn = function (a, b, c, d, e, f) {
    console.log("loki.isNewUrn() is deprecated, please use loki.urn.isNewUrn().");

    return loki.urn.isNewUrn(a, b, c, d, e, f);
};
loki.getUrnLastSegment = function (urn) {
    console.log("loki.getUrnLastSegment() is deprecated, please use loki.urn.getLastSegment().");

    return loki.urn.getLastSegment(urn);
};
loki.domain = loki.app;
loki.system = loki.app;
loki.user.securityRootUrns = loki.user.authRootUrns;
loki.app.domainUrn =
  loki.user.authRootUrns.length > 0
      ? loki.user.authRootUrns[0]
      : null;

/**
 * @license lokiJQuery copyright 2019 SaplingData LLC
 */

/**
 * A Loki JavaScript utility providing jquery base utilities
 * @module lokiJQuery
 */

// Load the data for the entity with the given urn using the given view
// @memberof module:lokiJQuery
// @param {string} urn the urn of the entity to be loaded
// @param {string} viewUrn the entity view used to do the load
// @param {Object} options service options
// @param {string} options.format the format in which to return the data. "json" is the default.
// @param {string} options.dataSpaceUrn the data space from which to load the data
// @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.
// @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
// @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
// @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
// @return {Promise}
//

loki.data.loadEntity = function (urn, viewUrn, options) {
    options = options || {};
    // set query params based on other options, but don't allow caller to set options.queryParams
    if (options.format) {
        options.queryParams = `format=${options.format}`;
    } else {
    // default to json
        options.queryParams = "format=json";
        options.format = "json";
    }
    if (options.dataSpaceUrn) {
        options.queryParams =
      `${options.queryParams}&dataSpaceUrn=${options.dataSpaceUrn}`;
    }

    let jsonpCallback = null;
    let dataType = options.format;

    if (options.jsonp) {
        jsonpCallback = "jsoncallback";
        dataType = "jsonp"; // automatically adds callback param to url
    }
    if (options.format === "xml") {
    // jquery will return a dom object for xml, but we typically want a string
        dataType = "text";
    }

    const url = loki.web.dataServiceUrl(urn, viewUrn, options);
  /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        type: "GET",
        contentType: "application/json",
        url,
        dataType,
        jsonp: jsonpCallback,
    };
    const promise = axios.get(url).then((d) => d.data);
    // $.ajax(ajaxOptions);
    // promise = loki.data._handleJsonp(promise, options);

    return promise;
};

// Save the data for the entity with the given urn using the given view
// @memberof module:lokiJQuery
// @param {string} urn the urn of the entity to be loaded
// @param {string} viewUrn the entity view used to do the load
// @param {Object} options service options
// @param {string} options.format the format in which to return the data. "json" is the default.
// @param {string} options.dataSpaceUrn the data space to save the data into
// @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false. (Not sure this works for POST.)
// @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
// @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
// @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
// @return {Promise}
//
loki.data.saveEntity = function (urn, viewUrn, data, options) {
    options = options || {};
    // set query params based on other options, but don't allow caller to set options.queryParams
    if (options.format) {
        options.queryParams = `format=${options.format}`;
    } else {
        options.queryParams = "format=json"; // default to json
    }
    if (options.dataSpaceUrn) {
        options.queryParams =
      `${options.queryParams}&dataSpaceUrn=${options.dataSpaceUrn}`;
    }

    let jsonpCallback = null;
    let dataType = "json";

    if (options.jsonp) {
        jsonpCallback = "jsoncallback";
        dataType = "jsonp"; // automatically adds callback param to url
    }

    const url = loki.web.dataServiceUrl(urn, viewUrn, options);
  /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        method: "POST",
        contentType: "application/json",
        url,
        data,
    };
    const promise = axios(ajaxOptions).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);
    // promise = loki.data._handleJsonp(promise, options);

    return promise;
};

// Delete the entity with the given urn
// @memberof module:lokiJQuery
// @param {string} urn the urn of the entity to be deleted
// @param {Object} options service options
// @param {string} options.format the format in which to return the data. "json" is the default.
// @param {string} options.dataSpaceUrn the data space to delete the data from
// @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.  (Not sure this works for DELETE.)
// @param {string} options.recursive if true then recusively delete all child entities. Default is false.
// @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
// @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
// @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
// @return {Promise}
//
loki.data.deleteEntity = function (urn, options, unused1) {
    if (arguments.length > 2 || typeof options === "string") {
    // for backward compatibility, arguments used to be (urn,view,options) but view is not needed
        console.log("loki.data.deleteEntity(urn,view,options) is deprecated, please use loki.data.deleteEntity(urn, options)");
        options = unused1 || {};
    } else {
        options = options || {};
    }

    return loki.data.deleteItem(urn, options);
};

// Delete the resource with the given urn
// @memberof module:lokiJQuery
// @param {string} urn the urn of the resource to be deleted
// @param {Object} options service options
// @param {string} options.format the format in which to return the data. "json" is the default.
// @param {string} options.dataSpaceUrn the data space to delete the data from
// @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.  (Not sure this works for DELETE.)
// =* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
// @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
// @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
// @return {Promise}
//
loki.data.deleteResource = function (urn, options) {
    return loki.data.deleteItem(urn, options);
};

// Delete the entity or resource with the given urn
// @memberof module:lokiJQuery
// @param {string} urn the urn of the entity/resource to be deleted
// @param {Object} options service options
// @param {string} options.format the format in which to return the data. "json" is the default.
// @param {string} options.dataSpaceUrn the data space to delete the data from
// @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.  (Not sure this works for DELETE.)
// =* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
// @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
// @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
// @return {Promise}
//
loki.data.deleteItem = function (urn, options) {
    options = options || {};
    // set query params based on other options, but don't allow caller to set options.queryParams
    if (options.format) {
        options.queryParams = `format=${options.format}`;
    } else {
        options.queryParams = "format=json"; // default to json
    }
    if (options.recursive && options.recursive === true) {
        options.queryParams = `${options.queryParams}&recursive=true`;
    }
    if (options.dataSpaceUrn) {
        options.queryParams =
      `${options.queryParams}&dataSpaceUrn=${options.dataSpaceUrn}`;
    }

    let jsonpCallback = null;
    let dataType = "json";

    if (options.jsonp) {
        jsonpCallback = "jsoncallback";
        dataType = "jsonp"; // automatically adds callback param to url
    }

    let url;

    if (loki.urn.isResourceUrn(urn)) {
        url = loki.web.resourceUrl(urn, options);
    } else {
        url = loki.web.dataServiceUrl(
            urn,
            "urn:com:loki:core:model:api:rawData",
            options
        );
    }

    /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        method: "DELETE",
        url,
        dataType,
        jsonp: jsonpCallback,
    };
    const promise = axios.delete(url).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);
    // promise = loki.data._handleJsonp(promise, options);

    return promise;
};

// Gets header info for the entity or resource without retrieving the data
// @memberof module:lokiJQuery
// @param {string} urn the urn of the entity or resource
// @param {string} options.format the format in which to return the data. "json" is the default.
// @param {string} options.dataSpaceUrn the data space from which to load the data
// @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false. (Not sure this works for HEAD.)
// @return {Promise} resolving with header information
//
loki.data.head = function (urn, options) {
    options = options || {};
    if (options.format) {
        options.queryParams = `format=${options.format}`;
    } else {
        options.queryParams = "format=json"; // default to json
    }
    if (options.dataSpaceUrn) {
        options.queryParams =
      `${options.queryParams}&dataSpaceUrn=${options.dataSpaceUrn}`;
    }
    let url;

    if (loki.urn.isResourceUrn(urn)) {
        url = loki.web.resourceUrl(urn, options);
    } else {
        url = loki.web.dataServiceUrl(
            urn,
            "urn:com:loki:core:model:api:rawData",
            options
        );
    }

    let jsonpCallback = null;
    let dataType = "json";

    if (options.jsonp) {
        jsonpCallback = "jsoncallback";
        dataType = "jsonp"; // automatically adds callback param to url
    }

    /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        method: "HEAD",
        contentType: "application/json",
        url,
        dataType,
        jsonp: jsonpCallback,
    };
    const promise = axios.head(url).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);
    const cPromise = promise.then((data, status, res) => {
        const lastModified = res.getResponseHeader("Last-Modified");

        return {"Last-Modified": lastModified};
    }, loki.data._handleJsonpErrHandler);

    return cPromise;
};

// List all the children of the given urn
// @memberof module:lokiJQuery
// @param {string} parentUrn the parent urn whose children are to be listed
// @param {string} options.dataSpaceUrn the data space to do the list on
// @param {Object} options service options
// @param {number} options.beginIdx the index of the first item to be returned
// @param {number} options.numRequested the max number of items to be returned
// @param {string} options.outputView (optional) allows entity data to be returned instead of a list of urns. If provided this view will be used to load and return entity data.
// @param {string} options.format the format in which to return the data. "json" is the default.
// @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.
// @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
// @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
// @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
// @return {Promise}
//
loki.data.list = function (parentUrn, options) {
    options = options || {};
    // set query params based on other options, but don't allow caller to set options.queryParams
    if (options.format) {
        options.queryParams = `format=${options.format}`;
    } else {
        options.queryParams = "format=json"; // default to json
    }
    if (options.dataSpaceUrn) {
        options.queryParams =
      `${options.queryParams}&dataSpaceUrn=${options.dataSpaceUrn}`;
    }
    if (options.beginIdx) {
        const {beginIdx} = options;

        options.queryParams = `${options.queryParams}&begin=${beginIdx}`;
    }
    if (options.numRequested) {
        const {numRequested} = options;

        options.queryParams = `${options.queryParams}&num=${numRequested}`;
    }
    if (options.outputView) {
        const outputView = loki.web.urnToUrlParams(options.outputView);

        options.queryParams = `${options.queryParams}&outputView=${outputView}`;
    }
    options.subjectUrn = parentUrn;

    let jsonpCallback = null;
    let dataType = "json";

    if (options.jsonp) {
        jsonpCallback = "jsoncallback";
        dataType = "jsonp"; // automatically adds callback param to url
    }

    const url = loki.web.webServiceUrl("urn:com:loki:core:model:api:list", options);
  /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        type: "GET",
        url,
        dataType,
        jsonp: jsonpCallback,
    };
    const promise = axios.get(url).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);
    // promise = loki.data._handleJsonp(promise, options);

    return promise;
};

// Load the resource with the given urn
// The resource will be loaded as text.
// @memberof module:lokiJQuery
// @param {string} urn the urn of the resource to be loaded
// @param {Object} options service options
// @param {string} options.dataSpaceUrn the data space to save the data into
// @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
// @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
// @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
// @return {Promise}
//
loki.data.loadResource = function (urn, options) {
    options = options || {};

    // set query params based on other options (if any), but don't allow caller to set options.queryParams
    if (options.dataSpaceUrn) {
        options.queryParams = `dataSpaceUrn=${options.dataSpaceUrn}&`;
    } else {
        options.queryParams = "";
    }
    options.queryParams = `${options.queryParams}noCache=${new Date().getTime()}`; // prevent caching
    const url = loki.web.resourceUrl(urn, options);
    /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        type: "GET",
        dataType: "text",
        url,
    };
    const promise = axios.get(url, {responseType: "text"}).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);

    return promise;
};

loki.data._hash = function (keys, values) {
    let hash = {},
        vlen = values && values.length || 0,
        i,
        len;

    for (i = 0, len = keys.length; i < len; ++i) {
        if (i in keys) {
            hash[keys[i]] = vlen > i && i in values
                ? values[i]
                : true;
        }
    }

    return hash;
};
loki.data._mapResultsFilter = function (results, hasOutputview) {
    let newResults;

    if (hasOutputview) {
        newResults = new Array(results.results.length);
        for (let i = 0; i < results.results.length; i++) {
            const result = results.results[i][0];

            newResults[i] = result;
        }

        return newResults;
    }
    newResults = [];
    const {columnNames} = results;

    if (columnNames) {
        results.results.forEach((result, i) => {
            newResults.push(loki.data._hash(columnNames, result));
        });
    }

    results.results = newResults;

    return results;
};
loki.data._addParamValue = function (name, value, paramParam, prefix) {
    if (isArray(value)) {
    // This value is an array, repeat all values in the url parameter
        for (let j = 0; j < value.length; j++) {
            paramParam =
        `${paramParam}&${prefix}${name}=${encodeURIComponent(value[j])}`;
        }
    } else {
        paramParam =
      `${paramParam}&${prefix}${name}=${encodeURIComponent(value)}`;
    }

    return paramParam;
};
loki.data._addParams = function (params, prefix) {
    let paramParam = "";

    if (isArray(params)) {
        for (let i = 0; i < params.length; i++) {
            paramParam = loki.data._addParamValue(
                params[i].name,
                params[i].value,
                paramParam,
                prefix
            );
        }
    } else {
        for (const name in params) {
            paramParam = loki.data._addParamValue(
                name,
                params[name],
                paramParam,
                prefix
            );
        }
    }

    return paramParam;
};
// /** 
//  * Execute a named query on the server or a query string
//  * 
//  * @template O
//  * @param {O} options options and parameters for executing the query
//  * @param {string} options.queryUrn the urn of the named query to be executed
//  * @param {string} options.query the query to be executed
//  * @param {string} options.format the format of the results. The default is "json"
//  * @param {string} options.dataSpaceUrn the data space on which to run the query
//  * @param {string[]|string[][]} options.params the numbered params for the query. Each param may have multiple values.  These params are substituted into the query in the order given. Examples: ["v1",["v2a","v2b],"v3"]
//  * @param {Object|Object[]} options.namedParams the named params for the query. Each param may have multiple values.  These params are substituted into the query by name. Examples: {p1:"v1",p2:["v2a","v2b"]}; [{name:"p1",value:"v1"},{name:"p2",value:["v2a","v2b"]}]
//  * @param {Object|Object[]} options.expressionParams the expression params for the query.  These params can substitute expressions within the query and are substituted into the query by name. Examples: {p1:"v1",p2:["v2a","v2b"]}; [{name:"p1",value:"v1"},{name:"p2",value:["v2a","v2b"]}]
//  * @param {number} options.begin (or options.beginIdx) used in query result paging, the index of the first entity to be returned from the query. Ignored if a LokiYQuery is provided
//  * @param {number} options.num (or options.numRequested) used in query result paging, the number of entities to be returned from the query. Ignored if a LokiYQuery is provided
//  * @param {string} options.outputView request that the first (and only) column returned by the query (which must be a urn) is turned into an object using the given outputView
//  * @param {string} options.outputViews request that all columns returned by the query (which must all be urns) are turned into objects using the given outputViews
//  * @param {boolean} options.mapResults if set to true then map the results such that an array of objects is always returned.  Only works for json data.
//  * @param {boolean} options.post use POST http method
//  * @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false. (Not sure this works for POST.)
//  * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
//  * @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
//  * @param {string} options.urlPrefix used to override the beginning of the url so that another application may be called.
//  * @param {boolean} options.useCurrentUserAuth if true, use the current user's authentication to access the remote service. (default false). NOTE: does not work cross domain.
//  * @return {O extends {mapResults: true} ? import("@/shims-loki").QueryResponseMapped : import("@/shims-loki").QueryResponse}
//  */
loki.data.query = function (options, unused) {
    if (typeof options === "string") {
    // handle loki.data.query(queryUrn,options) in a backward compatible way
        console.log("loki.data.query(queryUrn,options) is deprecated, please use loki.data.query(options) where one option is 'queryUrn'.");
        unused.queryUrn = options;
        options = unused;
    }
    options = options || {};
    if (options.engine && !options.dataSpaceUrn) {
        options.dataSpaceUrn = options.engine;
        console.log("The options.query param is deprecated fro loki.data.query(). Use options.dataSpaceUrn instead.");
    }

    let hasOutputView = false;

    if (options.outputView || options.outputViews) {
        hasOutputView = true;
    }

    let post;

    if (typeof options.post !== "undefined") {
        post = options.post;
    } else if (options.queryUrn) {
        post = false; // default to GET when there is a queryUrn so that we have a easy to repeat url for the query
    } else {
        post = true; // default to POST for an adhoc query
    }

    let jsonpCallback = null;
    let dataType = "json";

    if (options.jsonp) {
        jsonpCallback = "jsoncallback";
        dataType = "jsonp"; // automatically adds callback param to url
    }

    let {queryUrn} = options;

    if (queryUrn && options.connection) {
        if (queryUrn.startsWith(":")) {
            // use connection root if there is no root to the queryUrn
            queryUrn = options.connection.rootUrn + queryUrn;
        }
    }

    let headers;

    if (options.useCurrentUserAuth && loki.user.getUserSessionKey) {
        headers = {Authorization: `LOKISESSION ${loki.user.getUserSessionKey()}`};
    }

    let url;
    let promise;

    if (post) {
    // POST
        url = loki.web.webServiceUrl("urn:com:loki:core:model:api:query", {
            subjectUrn: null,
            queryParams: "",
            serviceGroupUrn: options.serviceGroupUrn,
            connection: options.connection,
            urlPrefix: options.urlPrefix,
        });
        const postOpts = JSON.parse(JSON.stringify(options)); // make a copy

        postOpts.queryUrn = queryUrn;
        delete postOpts.mapResults;
        delete postOpts.post;
        if (typeof postOpts.begin !== "undefined") {
            postOpts.beginIdx = postOpts.begin; // the post json param is beginIdx for the web service
            delete postOpts.begin;
        }
        if (typeof postOpts.num !== "undefined") {
            postOpts.numRequested = postOpts.num; // the post json param is numRequested for the web service
            delete postOpts.num;
        }
        const ajaxOptions = {
            type: "POST",
            url,
            contentType: "application/json",
            data: JSON.stringify(postOpts),
            dataType,
            jsonp: jsonpCallback,

            // beforeSend: function(xhr){loki.data._setHeaders(xhr,headers);},
            headers,
        };

        promise = axios.post(url, {data: postOpts}).then((d) => d.data);
    // promise = $.ajax(ajaxOptions);
    } else {
    // GET
        let params;

        if (queryUrn) {
            params = `queryUrn=${loki.web.urnToUrlParams(queryUrn)}`;
        } else if (options && !options.post) {
            params = `query=${encodeURIComponent(options.query)}`;
        }
        if (options.format) {
            params = `${params}&format=${options.format}`;
        } else {
            params = `${params}&format=json`; // default to json
        }
        if (options.beginIdx) {
            params = `${params}&begin=${options.beginIdx}`;
        }
        if (options.begin) {
            params = `${params}&begin=${options.begin}`;
        }
        if (options.numRequested) {
            params = `${params}&num=${options.numRequested}`;
        } else if (options.num) {
            params = `${params}&num=${options.num}`;
        }
        if (options.dataSpaceUrn) {
            params =
        `${params
        }&dataSpaceUrn=${
            loki.web.urnToUrlParams(options.dataSpaceUrn)}`;
        }
        if (options.outputView) {
            const outputView = loki.web.urnToUrlParams(options.outputView);

            params = `${params}&outputView=${outputView}`;
        }

        let outputViewParam = "";

        if (options.outputView) {
            outputViewParam =
        `&outputView=${loki.web.urnToUrlParams(options.outputView)}`;
        } else if (options.outputViews) {
            for (var i in options.outputViews) {
                outputViewParam =
          `${outputViewParam
          }&outputView=${
              loki.web.urnToUrlParams(options.outputViews[i])}`;
            }
        }
        params += outputViewParam;

        let paramParam = "";

        // Numbered parameters are p1, p2, p3, etc and can be multi valued arrays

        if (options.params) {
            for (var i = 0; i < options.params.length; i++) {
                if (isArray(options.params[i])) {
                    // This parameter is an array, repeat its values in the p{x} url parameter
                    for (let j = 0; j < options.params[i].length; j++) {
                        paramParam =
              `${paramParam
              }&p${
                  i + 1
              }=${
                  encodeURIComponent(options.params[i][j])}`;
                    }
                } else {
                    paramParam =
            `${paramParam
            }&p${
                i + 1
            }=${
                encodeURIComponent(options.params[i])}`;
                }
            }
        }
        // Named parameters are a name/value map and can have multi valued arrays
        if (options.namedParams) {
            paramParam += loki.data._addParams(options.namedParams, "p_");
        }
        // Expression parameters are a name/value map and can have multi valued arrays
        if (options.expressionParams) {
            paramParam += loki.data._addParams(options.expressionParams, "e_");
        }
        params += paramParam;

        url = loki.web.webServiceUrl("urn:com:loki:core:model:api:query", {
            subjectUrn: null,
            queryParams: params,
            serviceGroupUrn: options.serviceGroupUrn,
            connection: options.connection,
            urlPrefix: options.urlPrefix,
        });

        /** @type {JQueryAjaxSettings} */
        const ajaxOptions = {
            type: "GET",
            url,
            dataType,
            jsonp: jsonpCallback,

            // beforeSend: function(xhr){loki.data._setHeaders(xhr,headers);},
            headers,
        };

        promise = axios.get(url).then((d) => d.data);
    // promise = $.ajax(ajaxOptions);
    }
    promise = loki.data._handleJsonp(promise, options);

    if (options.mapResults) {
        promise = promise.then((data) => loki.data._mapResultsFilter(data, hasOutputView));
    }

    return promise;
};

loki.data._handleJsonpErrHandler = function (xhr, statusCode, statusText) {
    try {
        const json = xhr.responseText
            .replace(/jQuery[0-9_]+\(/g, "")
            .replace(/\)/g, "")
            .replace("{\"results\":[", "");

        xhr.responseJSON = JSON.parse(json);
    } catch (e) {}

    return xhr;
};
loki.data._handleJsonp = function (promise, options) {
    // NOTE: auth on cross domain jsonp won't work since cross-domain jsonp cannot send headers since it injects a script tag into the html
    if (options.jsonp) {
    // translate error message from jsonp to json if needed
        promise = promise.then((data, statusCode, xhr) => data, loki.data._handleJsonpErrHandler);
    }

    return promise;
};
// loki.data._setHeaders = function(xhr, headers) {
//    // provide functionality to set headers (in jquery 1.5 this is not necessary)
//    if (headers) {
//        for ( var headerName in headers ) {
//            var headerValue = headers[headerName];
//            if ( headerValue ) {
//                xhr.setRequestHeader(headerName, headerValue);
//            }
//        }
//    }
// };

// Login a user
// @memberof module:lokiJQuery
// @param {string} username
// @param {string} password
// @return {Promise} A promise that completes when the login (on the server side) succeeds or errors
//
loki.user.login = function (username, password) {
    const data = {
        username,
        password,
    };
    const url = loki.web.webServiceUrl("urn:com:loki:core:model:api:login");
  /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        type: "POST",
        url,
        dataType: "json",
        // dataType : 'jsonp', // automatically adds callback param to url
        // jsonp : 'jsoncallback', // name of callback param
        data: JSON.stringify(data),
        // processData: false, // send data in body
        contentType: "application/json",
    };
    const promise = axios.post(url, {data}).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);

    return promise.then((data) => {
        if (data && data.userUrn) {
            loki._config.userUrn = data.userUrn;
        }

        return data;
    });
};

// Logs out the current user
// @memberof module:lokiJQuery
// @return {Promise} A promise that completes when the logout (on the server side) succeeds or errors
//
loki.user.logout = function () {
    promise = loki.user.login(null, null);

    return promise;
};

// Creates a new guest user account and sets the state (via cookies, etc) so that the current user is the new guest user
// The javascript loki variable is set so that loki.user.getUserUrn() returns the new guest user urn
// @memberof module:lokiJQuery
// @return {Promise} A promise that returns the urn of the new guest user
//
loki.user.createGuestUser = function () {
    const url = loki.web.webServiceUrl("urn:com:loki:user:model:api:createGuestUser");
  /** @type {JQueryAjaxSettings} */
    var promise = axios.post(url, {data}).then((d) => d.data);
    const ajaxOptions = {
        type: "POST",
        url,
        dataType: "json",
        // data: JSON.stringify(data),
        contentType: "application/json",
    };
    // var promise = $.ajax(ajaxOptions);
    var promise = axios.post(url).then((d) => d.data);

    return promise.then((data) => {
        if (loki._config) {
            loki._config.userUrn = data.newGuestUserUrn;
        }

        return data;
    });
};

// Begins the process of creating a new user and credentials for the person currently logged in to the application
//
// @memberof module:lokiJQuery
// @param {object} options request options object
// @param {string} options.userUrn (optional) the urn of the existing user to give credentials to
// @param {string} options.userName the userName for login purposes (set on the credentials)
// @param {string} options.userDisplayName (optional) the full display name for a new user
// @param {string} options.email the email for communications with the new user
// @param {string} options.password (optional) the password for the new user's login credentials. If not passed here, the new user can choose a password on the confirmation page.
// @param {string} options.confirmUrl the url to the page where the user is sent to create their user login credentials. This link is put in the email sent to the user. It may be an absolute or relative url. A url parameter 'token' will be added to the url to pass the secure request token to the confirm page. For security reasons, this url must point to the same server and port as the app making the request.
// @param {string} options.returnUrl (optional) the url to send the user to after the user creation process is complete. This url is passed back from the confirmation service. It may be an absolute or relative url. For security reasons, this url must point to the same server and port as the app making the request.
// @return {Promise} A promise that returns when the request is successfully submitted
//
loki.user.createMyUserRequest = function (options) {
    const data = {
        userName: options.userName,
        userDisplayName: options.userDisplayName,
        email: options.email,
        password: options.password,
        confirmUrl: options.confirmUrl,
        returnUrl: options.returnUrl,
    };
    const url = loki.web.webServiceUrl("urn:com:loki:user:model:api:createMyUserRequest");
  /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        type: "POST",
        url,
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json",
    };
    const promise = axios.post(url, {data}).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);

    return promise.then((data) => data);
};

// Begins the process of inviting a new user of the application
// See the documentation on the web service (urn:com:loki:user:model:api:inviteNewUserRequest) for more information.
// @memberof module:lokiJQuery
// @param {object} options request options object
// @param {string} options.userUrn (optional) the urn of the existing user to give credentials to
// @param {string} options.userName the userName for login purposes (set on the credentials)
// @param {string} options.userDisplayName (optional) the full display name for a new user
// @param {string} options.email the email for communications with the new user
// @param {string} options.password (optional) the password for the new user's login credentials. If not passed here, the new user can choose a password on the confirmation page.
// @param {string} options.confirmUrl the url to the page where the user is sent to create their user login credentials. This link is put in the email sent to the user. It may be an absolute or relative url. A url parameter 'token' will be added to the url to pass the secure request token to the confirm page. For security reasons, this url must point to the same server and port as the app making the request.
// @param {string} options.returnUrl (optional) the url to send the user to after the user creation process is complete. This url is passed back from the confirmation service. It may be an absolute or relative url. For security reasons, this url must point to the same server and port as the app making the request.
// @return {Promise} A promise that returns when the request is successfully submitted
//
loki.user.inviteNewUserRequest = function (options) {
    const data = {
        userUrn: options.userUrn,
        userName: options.userName,
        userDisplayName: options.userDisplayName,
        email: options.email,
        password: options.password,
        confirmUrl: options.confirmUrl,
        returnUrl: options.returnUrl,
    };
    const url = loki.web.webServiceUrl("urn:com:loki:user:model:api:inviteNewUserRequest");
  /** @type {JQueryAjaxSettings} */
    const ajaxOptions = {
        type: "POST",
        url,
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json",
    };
    const promise = axios.post(url, {data}).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);

    return promise.then((data) => data);
};

// Completes the process of creating a new user and credentials.
// This service should be called when the new user returns via the confirmUrl sent in email.
// See the documentation on the web service (urn:com:loki:user:model:api:createUserConfirm) for more information.
//
// @memberof module:lokiJQuery
// @param {string} token the secure request token
// @param {object} options request options object
// @param {string} options.password the password for the new user. If provided in the request step then password is not needed.
// @return {Promise} A promise that returns when the request is successfully submitted
//
loki.user.createUserConfirm = function (token, options) {
    const data = {
        token,
        password: options.password,
    };
    const url = loki.web.webServiceUrl("urn:com:loki:user:model:api:createUserConfirm");
    const ajaxOptions = {
        type: "POST",
        url,
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json",
    };
    const promise = axios.post(url, {data}).then((d) => d.data);
    // var promise = $.ajax(ajaxOptions);

    return promise.then((data) => {
        if (loki._config) {
            loki._config.userUrn = data.newUserUrn;
        }

        return data;
    });
};

export default loki;
