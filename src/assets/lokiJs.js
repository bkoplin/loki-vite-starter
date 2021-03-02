/**
 * A Loki JavaScript utility providing various functions for loki data and services
 * @module lokiJs
 */

/* Assign freemarker variables that allow freemarker tags not to mess up js syntax
 * <#assign start = "*"+"/">
 * <#assign end = "/"+"*">
 */

// Set up the loki namespace
if ( typeof loki === "undefined" ) {
    /**
     * The global variable 'loki' is the main javaScript entry point for loki javaScript functionality
     * @namespace
     * @memberOf module:lokiJs
     * @property {namespace} data a set of utilities for getting and saving loki data
     * @property {namespace} web a set of utilities for dealing with urls and the web
     * @property {namespace} user a set of utilities for dealing with user login
     * @property {namespace} urn a set of utilities for dealing with urns
     */
    var loki = new Object();
}

/**
 * @namespace loki.web
 * @memberOf module:lokiJs
 */
loki.web = {
    urlPrefixes : {
        api: '${loki.web.serviceUrlPrefix("urn:com:loki:meta:model:types:webService")}',
        pages: '${loki.web.serviceUrlPrefix("urn:com:loki:meta:model:types:webPage")}'
    },
    
    /**
     * 
     * @return {String}
     */
    getApiServicePrefix : function() {
        return loki.web.urlPrefixes.api;
    },
    
    /**
     * 
     * @return {String}
     */
    getPagesPrefix : function() {
        return loki.web.urlPrefixes.pages;
    },
    
    /**
     * 
     * @param {type} urn
     * @return {unresolved}
     */
    urnToUrlPath : function( urn ) {
        if ( urn ) {
            var exLoc = urn.lastIndexOf("!");
            var hashLoc = urn.lastIndexOf("#");
            var cLoc = urn.lastIndexOf(":");
            var pLoc = urn.lastIndexOf(".");
            
            urn = urn.replace(/#/g,"%23");
            urn = urn.replace(/:/g,"/");
            
            if ( hashLoc != -1 ) {
                // contained entities are unambiguous so no work is needed here
            } else if ( exLoc == -1 && pLoc > cLoc ) {
                // urn is an entity urn with a "." in the last segment
                // explicity add back a ":" to make sure loki doesn't think this is a resource.
                urn = urn.substring(0,cLoc)+":"+urn.substring(cLoc+1);
            } else if ( exLoc != -1 && pLoc < exLoc) {
                // urn is an resource urn with no "." in the last segment
                // explicity add back a "!" to make sure loki doesn't think this is an entity.
                urn = urn.substring(0,cLoc)+":"+urn.substring(cLoc+1);
            }
            return urn;
        } else {
            return null;
        }
    },
    
    /**
     * 
     * @param {type} urn
     * @return {unresolved}
     */
    urnToUrlParams : function( urn ) {
        if ( urn !== null ) {
            return urn.replace(/#/g,"%23");
        } else {
            return null;
        }
    },

    /** Constructs a url for the resource.
     * This url will point to a web service that returns the resource's data (GET) or allows the resource to be modified (POST,DELETE).
     * 
     * @param {string} resourceUrn the urn of the resource
     * @param {object} options the options for construction the resource url
     * @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
     * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
     * @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
     * @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
     * @param {boolean} options.download specifies whether the attachment content-disposition header should be set so that the file is automatically downloaded by the browser. If omitted download is defaulted to false.
     * @return {string} the url for the resource
     * 
     */
    resourceUrl : function( resourceUrn, options, notUsed3 ) {
        if ( options === null || typeof options === "string" ) {
            console.log("loki.web.resourceUrl(resourceUrn, queryParams, download) is deprecated, please use loki.web.resourceUrl(resourceUrn,options)");
            options = {
                queryParams: options,
                download: notUsed3
            };
        }
        if ( !options ) {
            options = {};
        }
        options.subjectUrn = resourceUrn;
        options.serviceUrn = "urn:com:loki:core:model:api:resource";
        options.serviceTypePrefix = loki.web.getApiServicePrefix();
        if ( options.download ) {
            if ( !options.queryParams ) {
                options.queryParams = "download=true";
            } else {
                options.queryParams = options.queryParams + "&download=true";
            }
        }
        
        return loki.web.serviceUrl(options);
    },

    /** Constructs a url for the resource and appends a release parameter that allows for recaching when a major release is pushed.
     * This url will point to a web service that returns the resource's data (GET)
     * 
     * @param resourceUrn the urn of the resource
     * @param {object} options the options for construction the resource url
     * @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
     * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
     * @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
     * @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
     * @param {boolean} options.download specifies whether the attachment content-disposition header should be set so that the file is automatically downloaded by the browser. If omitted download is defaulted to false.
     * @return {string} the url for the resource
     */
    resourceUrlWithCacheCheck : function( resourceUrn, options, notUsed3 ) {
        if ( options === null || typeof options === "string" ) {
            console.log("loki.web.resourceUrlWithCacheCheck(resourceUrn, queryParams, download) is deprecated, please use loki.web.resourceUrlWithCacheCheck(resourceUrn,options)");
            options = {
                queryParams: options,
                download: notUsed3
            };
        }
        if ( !options ) {
            options = {};
        }
        options.cacheCheck = true;
        var url = loki.web.resourceUrl(resourceUrn, options);
        return url;
    },
    
    /**
     * 
     * @deprecated for backward compatibility, use resourceUrlWithCacheCheck() instead
     */
    resourceUrlwithCacheCheck : function( resourceUrn, queryParams, download ) {
        console.log("loki.web.resourceUrlwithCacheCheck() is deprecated, please use loki.web.resourceUrlWithCacheCheck() instead");
        return loki.web.resourceUrlWithCacheCheck(resourceUrn, queryParams, download);
    },

    /**
     * 
     * @param {String} imageUrn
     * @param {String} sizeUrn
     * @return {String}
     */
    imageUrl : function( imageUrn, sizeUrn ) {
        var urnPath = loki.web.urnToUrlPath(imageUrn);
        var apiPrefix = loki.web.getApiServicePrefix();
        var url = apiPrefix+"urn/com/loki/core/model/api/image/v/"+urnPath;
        if ( typeof(sizeUrn) !== "undefined" && sizeUrn !== null ) {
            url = url + "?size="+loki.web.urnToUrlParams(sizeUrn);
        }
        return url;
    },
    
    /** Constructs a url for the page with the given parameters
     * 
     * @param {type} pageUrn the urn of the page
     * @param {object} options the options for construction the page url
     * @param {string} options.subjectUrn the urn of the data to be displayed on the page or null if there is no subject data
     * @param {type} options.serviceUrn same as options.pageUrn
     * @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
     * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
     * @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
     * @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
     * @return {String} the url for the page
     */
    pageUrl : function( pageUrn, options, notUsed3, notUsed4 ) {
        if ( options === null || typeof options === "string" ) {
            console.log("loki.web.pageUrl(subjectUrn,pageUrn,queryParams,urlPrefix) is deprecated, please use loki.web.pageUrl(pageUrn,options)");
            var param1 = pageUrn;
            var param2 = options;
            pageUrn = param2;
            options = {
                subjectUrn: param1,
                queryParams: notUsed3,
                urlPrefix: notUsed4
            };
        }
        if ( !options ) {
            options = {};
        }
        options.serviceUrn = pageUrn;
        options.serviceTypePrefix = loki.web.getPagesPrefix();
        
        return loki.web.serviceUrl(options);
    },

    /**  Constructs a url for the page with the given parameters and appends a release parameter that allows for recaching when a major release is pushed.
     * 
     * @param {type} pageUrn the urn of the page
     * @param {object} options the options for construction the page url
     * @param {string} options.subjectUrn the urn of the data to be displayed on the page or null if there is no subject data
     * @param {type} options.serviceUrn same as options.pageUrn
     * @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
     * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
     * @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
     * @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
     * @return {String} the url for the page
     */
    pageUrlWithCacheCheck : function( pageUrn, options, notUsed3, notUsed4 ) {
        if ( options === null || typeof options === "string" ) {
            console.log("loki.web.pageUrlWithCacheCheck(subjectUrn,pageUrn,queryParams,urlPrefix) is deprecated, please use loki.web.pageUrlWithCacheCheck(pageUrn,options)");
            var param1 = pageUrn;
            var param2 = options;
            pageUrn = param2;
            options = {
                subjectUrn: param1,
                queryParams: notUsed3,
                urlPrefix: notUsed4
            };
        }
        if ( !options ) {
            options = {};
        }
        options.cacheCheck = true;
        
        return loki.web.pageUrl(pageUrn, options);
    },
    
    /**
     * 
     * @deprecated for backward compatibility, use pageUrlWithCacheCheck() instead
     */
    pageUrlwithCacheCheck : function( subjectUrn, pageUrn, queryParams, prefix ) {
        console.log("loki.pageUrlwithCacheCheck() is deprecated, please use loki.pageUrlWithCacheCheck() instead");
        return loki.web.pageUrlWithCacheCheck(subjectUrn, pageUrn, queryParams, prefix);
    },

    /** Constructs a url for a resource in the model dataspace
     * This url will point to a web service that returns the resource's data (GET) or allows the resource to be modified (POST,DELETE).
     * BY DEFAULT CACHE CHECK IS ON which appends a release parameter that allows for recaching when a major release is pushed.
     * 
     * @param {string} resourceUrn the urn of the resource
     * @param {object} options the options for construction the resource url
     * @param {type} options.queryParams a url query parameter string where parameters are separated by '&amp;'. This string can optionally begin with a '?'.
     * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when linking to a page in another application.
     * @param {string} options.connection use this connection to determine the base of the url when linking to a page in another application.
     * @param {string} options.urlPrefix use this prefix at the base of the url in order to ling to a page in another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
     * @param {boolean} options.download specifies whether the attachment content-disposition header should be set so that the file is automatically downloaded by the browser. If omitted download is defaulted to false.
     * @return {string} the url for the resource
     * 
     */
    modelResUrl : function( resourceUrn, options ) {
        if ( !options ) {
            options = {};
        }
        options.subjectUrn = resourceUrn;
        options.serviceUrn = "urn:com:loki:core:model:api:modelResource";
        options.serviceTypePrefix = loki.web.getApiServicePrefix();
        if ( options.download ) {
            if ( !options.queryParams ) {
                options.queryParams = "download=true";
            } else {
                options.queryParams = options.queryParams + "&download=true";
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
    uploadUrl : function( destUrn ) {
        var urnPath = loki.web.urnToUrlPath(destUrn);
        var apiPrefix = loki.web.getApiServicePrefix();
        return apiPrefix+"urn/com/loki/core/model/api/upload/v/"+urnPath;
    },
    
    /**
     * 
     * @param {type} sourceUrn
     * @param {type} destUrn
     * @param {type} viewUrn
     * @param {type} options of form {merge:"true",genUrnFromField:"no"}
     * @return {String}
     */
    importUrl : function( sourceUrn, destUrn, viewUrn, options ) {
        var destPath = loki.web.urnToUrlPath(destUrn);
        var apiPrefix = loki.web.getApiServicePrefix();
        var url = apiPrefix+"urn/com/loki/importData/model/api/importData/v/"+destPath+"?source="+sourceUrn;
        if (typeof(viewUrn) !== "undefined" && viewUrn !== null ) {
            url = url + "&importView="+viewUrn;
        }
        if ( options ) {
            for ( var option in options ) {
                url = url + "&"+option+"="+options[option];
            }
        }
        return url;
    },
    
    /** Returns a url for a loki data web service (CRUD service)
     * @param {string} entityUrn the urn of the entity to create/read/update/delete
     * @param {string} viewUrn the view to user for a create/read/update
     * @param {object} options the options for construction the data web service url
     * @param {string} options.queryParams any query parmeters to be added to the url
     * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
     * @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
     * @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
     * @return {string} the url for the web service
     */
    dataServiceUrl : function( entityUrn, viewUrn, options ) {
        if ( !options ) {
            options = {};
        }
        options.subjectUrn = entityUrn;
        options.serviceUrn = viewUrn;
        options.serviceTypePrefix = loki.web.getApiServicePrefix();
        
        return loki.web.serviceUrl(options);
    },
    
    /** Returns a url for a loki web service
     * @param {string} serviceUrn the urn of the web service to call
     * @param {object} options the options for construction the web service url
     * @param {string} options.subjectUrn the urn of the main entity/resource on which to execute the service
     * @param {string} options.queryParams any query parmeters to be added to the url
     * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
     * @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
     * @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
     * @return {string} the url for the web service
     */
    webServiceUrl : function( serviceUrn, options, notUsed3, notUsed4 ) {
        if ( options === null || typeof options === "string" ) {
            console.log("loki.web.webServiceUrl(subjectUrn,serviceUrn,queryParams,urlPrefix) is deprecated, please use loki.web.webServiceUrl(serviceUrn,options)");
            var param1 = serviceUrn;
            var param2 = options;
            serviceUrn = param2;
            options = {
                subjectUrn: param1,
                queryParams: notUsed3,
                urlPrefix: notUsed4
            };
        }
        if ( !options ) {
            options = {};
        }
        options.serviceUrn = serviceUrn;
        options.serviceTypePrefix = loki.web.getApiServicePrefix();
        
        return loki.web.serviceUrl(options);
    },
    
    /** Returns a url for a loki service (web service, page, or data service)
     * @param {object} options the options for construction the  service url
     * @param {string} options.subjectUrn the urn of the main entity on which to execute the service
     * @param {string} options.serviceUrn the urn of the web service to call
     * @param {string} options.serviceTypePrefix for local services, this is the prefix for the type of service. Typically /pages or /api
     * @param {string} options.queryParams any query parmeters to be added to the url
     * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
     * @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
     * @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
     * @param {string} options.cacheCheck if true add a url param that forces the browser to refresh the page in cache when a new release is deployed.
     * @return {string} the url for the service
     */
    serviceUrl : function( options ) {
        var newServiceUrn = options.serviceUrn;
        var newPrefix = "";
        if ( options.urlPrefix ) {
            newPrefix = options.urlPrefix;
        } else if ( options.connection ) {
            var conn = options.connection;
            if ( conn ) {
                newPrefix = conn.url;
                if ( newServiceUrn.slice(0,1)===":" ) {
                    newServiceUrn = conn.rootUrn + newServiceUrn;
                }
            }
        } else if ( options.serviceGroupUrn ) {
            var conn = loki.environ.getConnection(options.serviceGroupUrn);
            if ( conn ) {
                newPrefix = conn.url;
                if ( newServiceUrn.slice(0,1)===":" ) {
                    newServiceUrn = conn.rootUrn + newServiceUrn;
                }
            }
        } else {
            newPrefix = options.serviceTypePrefix;
        }
        if ( newPrefix.slice(-1) !== "/" ) {
            newPrefix = newPrefix + "/";
        }
        
        var serviceUrnPath = "";
        if ( newServiceUrn ) {
            serviceUrnPath = loki.web.urnToUrlPath(newServiceUrn);
        }
        
        var subjectUrnPath = "";
        if ( options.subjectUrn ) {
            subjectUrnPath = subjectUrnPath + loki.web.urnToUrlPath(options.subjectUrn);
        }
        
        var queryParams = options.queryParams;
        if ( options.cacheCheck ) {
            if ( queryParams ) {
                queryParams = queryParams + "&release="+loki.app.getReleaseNumber();
            } else {
                queryParams = "?release="+loki.app.getReleaseNumber();
            }
        }
        
        var url = newPrefix+serviceUrnPath+"/v/"+subjectUrnPath;
        url = loki.web._appendParamsToUrl(url,queryParams);
        return url;
    },
    
    homeUrl: '${loki.web.homeUrl!}',
    unauthorizedUrl: '${loki.web.unauthorizedUrl!}',
    notFoundUrl: '${loki.web.notFoundUrl!}',
    
    _appendParamsToUrl : function( url, queryParams ) {
        if (queryParams) {
            if ( queryParams.charAt(0) === "&" ) {
                queryParams = queryParams.substring(1);
            }
            if ( queryParams.charAt(0) !== "?" ) {
                url = url + "?";
            }
            url = url + queryParams;
        }
        return url;
    }
};


/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.data = {
    /** List all the children of the given urn
     * 
     * @param {type} urn
     * @param {type} callback
     * @param {Object} options service options of format: {format:"json",beginIdx:0,numRequested:20,outputView:"urn:com:myView"}
     * @return {undefined}
     * @deprecated removed due to dependence on jquery
     */
    list : function( urn, callback, options ) {
        console.log("loki.data.list is deprecated, please remove usage.");
        var params = "";
        if ( options ) {
            if ( options.format ) {
                var format = options.format;
                params = params + "&format="+format;
            }
            if ( options.beginIdx ) {
                var beginIdx = options.beginIdx;
                params = params + "&begin="+beginIdx;
            }
            if ( options.numRequested ) {
                var numRequested = options.numRequested;
                params = params + "&num="+numRequested;
            }
            if ( options.outputView ) {
                var outputView = loki.urnToUrlParams( options.outputView );
                params = params + "&outputView="+outputView;
            }
            if ( params.length > 0 ) {
                params = params.substring(1);  // remove begining amp
            }
        }
        var url = loki.web.webServiceUrl(urn,"urn:com:loki:core:model:api:list",params);
        $.ajax({ type: 'GET',
            url: url,
            dataType : 'jsonp', // automatically adds callback param to url
            jsonp : 'jsoncallback', // name of callback param
            success: function(response){
                if ( callback !== null && typeof callback === "function" ) {
                    callback( null, response );
                }
            },
            error: function(response){
                if ( callback !== null && typeof callback === "function" ) {
                    callback( "Error getting children.", response );
                }
            }
        });
    }
};


/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.user = {
    unauthorizedUrl : loki.web.unauthorizedUrl,
    resetPasswordUrl : '${loki.web.urls["urn:com:loki:config:data:urlUses#resetPassword"]!}',
    getUserUrn: function() {
        return loki._config.userUrn;
    },
    isLoggedIn: function() {
        return loki._config.isLoggedIn;
    },
    isGuest: function() {
        return loki._config.isGuest;
    },
    getUserData: function() {
        return loki._config.userData;
    },
    getFunctionUrns : function() {
        return loki._config.userFunctionUrns;
    },
    canPerformFunction: function(functionUrn) {
        var canPerform = false;
        if ( loki._config.userFunctionUrns ) {
            for ( var i = 0; i < loki._config.userFunctionUrns.length; i++ ) {
                if ( functionUrn === loki._config.userFunctionUrns[i] ) {
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
    login : function(username,password,callback) {
        var data = { username : username, password : password };
        var url = loki.web.webServiceUrl("urn:com:loki:core:model:api:login");
        $.ajax({ type: 'POST',
            url: url,
            dataType : 'json',
            //dataType : 'jsonp', // automatically adds callback param to url
            //jsonp : 'jsoncallback', // name of callback param
            data: JSON.stringify(data),
            //processData: false, // send data in body
            contentType: 'application/json',
            success: function(response){
                if ( response.success ) {
                    loki._config.userUrn = response.userUrn;
                }
                if ( callback !== null && typeof callback === "function" ) {
                    callback( null, response );
                }
            },
            error: function(response){
                if ( callback !== null && typeof callback === "function" ) {
                    callback( "Error logging in.", response );
                }
            }
        });
    },
    
    /**
     * 
     * @param {type} callback
     * @return {undefined}
     */
    logout : function(callback) {
        loki.user.login(null,null,callback);
    },
    
    /** Returns the user's session key used to keep the user logged in.
     * 
     */
    getUserSessionKey : function() {
        var getCookie = function(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length == 2) {
                value = parts.pop().split(";").shift();
                if ( value.slice(0,1)==='"' ) {
                    value = value.substring(1);
                }
                if ( value.slice(-1)==='"' ) { // endsWith
                    value = value.substring(0,value.length-1);
                }
                return value;
            }
        };
        return getCookie("lokiLoginSession");
    },
    
    authRootUrns: [
        /* FREEMARKER ASSIGNMENT ${start}
        <#assign i=0>
        <#list loki.user.authRootUrns as authRootUrn>
            <#if (i > 0)>,</#if>"${authRootUrn}"
            <#assign i=i+1>
        </#list>
        ${end} */
    ]
};



/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.urn = {
    /** Returns Checks if the urn is a urn with a new marker '$' in it.
     * 
     * @param {type} urn
     * @return {boolean} true if the urn is a urn with a new marker in it; false otherwise.
     */
    isNew : function(urn) {
        return( urn.indexOf("$") >= 0 ) ;
    },
    
    /** Checks if the urn is a resource urn (with the resource marker '!' in it)
     * 
     * @param {type} urn
     * @return {boolean} true if the urn is a resource urn; false otherwise.
     */
    isResourceUrn : function(urn) {
        return( urn.indexOf("!") >= 0 ) ;
    },
    
    /** Checks if the urn contains a version component
     * 
     * @param {type} urn
     * @return {boolean} true if the urn contains a version component; false otherwise
     */
    hasVersion : function(urn) {
        return( urn.indexOf("~") >= 0 ) ;
    },
    
    /** Returns the version component of the urn if there is one
     * 
     * @param {type} urn
     * @return {string} the version component of the urn
     */
    getVersion : function(urn) {
        var idx = urn.indexOf("~");
        if ( idx >= 0 && idx != urn.length()-1 ) {
            return urn.substring(idx+1);
        } else {
            return null;
        }
    },
    
    /** returns the last segment of the given urn
     * 
     * @param {string} urn
     * @returns {string} the last segment of the given urn
     */
    getLastSegment : function(urn) {
        if ( !urn ) {
            return null;
        }
        var index = -1;
        var index1 = urn.lastIndexOf(":");
        var index2 = urn.lastIndexOf("#");
        var index3 = urn.lastIndexOf("!");
        if (index1 > index2 && index1 > index3) {
            index = index1;
        } else if (index2 > index3) {
            index = index2;
        } else {
            index = index3;
        }
        var lastSegment;
        if (index < 0) {
            lastSegment = urn;
        } else {
            lastSegment = urn.substring(index + 1);
        }
        return lastSegment;
    }
};
loki.urn.getUrnLastSegment = loki.urn.getLastSegment;
loki.urn.isNewUrn = loki.urn.isNew;

/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.app = {
    appInstanceUrn: '${loki.app.appInstanceUrn!}',
    lokiNodeUrn: '${loki.app.lokiNodeUrn!}',
    getReleaseNumber: function() {
        return loki._config.systemReleaseNumber;
    },
    isDebug: function() {
        return loki._config.isDebug;
    },
    getReleaseTierUrn: function() {
        console.log("loki.app.getReleaseTierUrn() is deprecated, please use loki.app.isDebug() instead.");
        return loki._config.systemReleaseTierUrn;
    },
    rootUrn : '${loki.app.rootUrn!}'
};

/**
 * @namespace
 * @memberOf module:lokiJs
 */
loki.model = {
    addConnection: function( connection ) {
        if ( connection ) {
            loki.environ._connections.push(connection);
        }
    },
    getConnectionByServiceGroup: function( serviceGroupUrn ) {
        for ( var i=0; i<loki.environ._connections.length; i++ ) {
            var aConn = loki.environ._connections[i];
            if ( aConn.serviceGroupUrn === serviceGroupUrn ) {
                return aConn;
            }
            if ( aConn.serviceGroupUrns ) {
                for ( var j=0; j<aConn.serviceGroupUrns.length; j++ ) {
                    if ( aConn.serviceGroupUrns[j] === serviceGroupUrn ) {
                        return aConn;
                    }
                }
            }
        }
        return null;
    },
    modelRootUrns :[
        /* FREEMARKER ASSIGNMENT ${start}
        <#assign i=0>
        <#list loki.model.modelRootUrns as modelRootUrn>
            <#if (i > 0)>,</#if>"${modelRootUrn}"
            <#assign i=i+1>
        </#list>
        ${end} */
        ]
    /* FREEMARKER ASSIGNMENT ${start}
    ,modelDataSpaces :${loki.model.getModelDataSpacesSerialized("json")}
    ,dataSpaces : ${loki.model.getDataSpacesSerialized("json")}
    ${end} */
};
loki.app.appPackRootUrns = loki.model.modelRootUrns;  // for backward compatibility

loki.environ = {
    _connections: [],
    addConnection: function( connection ) {
        console.log("loki.environ.addConnection() is deprecated, please use loki.model.addConnection() instead.");
        if ( connection ) {
            loki.environ._connections.push(connection);
        }
    },
    getConnection: function( serviceGroupUrn ) {
        console.log("loki.environ.getConnection() is deprecated, please use loki.model.getConnectionByServiceGroup() instead.");
        return loki.model.getConnectionByServiceGroup(serviceGroupUrn);
    }
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
loki.config = function( config ) {
    for ( var item in config ) {
        loki._config[item] = config[item];
    }
};
loki._config = {
        systemReleaseNumber : null,
        systemReleaseTierUrn : null,
        userUrn : null,
        isLoggedIn : null,
        userData : null,
        userFunctionUrns : null
};


// for backward compatibility
loki.urlPrefixes = function(a,b,c,d,e,f){ console.log("loki.urlPrefixes() is deprecated, please use loki.web.urlPrefixes()."); return loki.web.urlPrefixes(a,b,c,d,e,f) };
loki.getApiServicePrefix = function(a,b,c,d,e,f){ console.log("loki.getApiServicePrefix() is deprecated, please use loki.web.getApiServicePrefix()."); return loki.web.getApiServicePrefix(a,b,c,d,e,f) };
loki.getPagesPrefix = function(a,b,c,d,e,f){ console.log("loki.getPagesPrefix() is deprecated, please use loki.web.getPagesPrefix()."); return loki.web.getPagesPrefix(a,b,c,d,e,f) };
loki.urnToUrlPath = function(a,b,c,d,e,f){ console.log("loki.urnToUrlPath() is deprecated, please use loki.web.urnToUrlPath()."); return loki.web.urnToUrlPath(a,b,c,d,e,f) };
loki.urnToUrlParams = function(a,b,c,d,e,f){ console.log("loki.urnToUrlParams() is deprecated, please use loki.web.urnToUrlParams()."); return loki.web.urnToUrlParams(a,b,c,d,e,f) };
loki.resourceUrl = function(a,b,c,d,e,f){ console.log("loki.resourceUrl() is deprecated, please use loki.web.resourceUrl()."); return loki.web.resourceUrl(a,b,c,d,e,f) };
loki.imageUrl = function(a,b,c,d,e,f){ console.log("loki.imageUrl() is deprecated, please use loki.web.imageUrl()."); return loki.web.imageUrl(a,b,c,d,e,f) };
loki.pageUrl = function(a,b,c,d,e,f){ console.log("loki.pageUrl() is deprecated, please use loki.web.pageUrl()."); return loki.web.pageUrl(a,b,c,d,e,f) };
loki.uploadUrl = function(a,b,c,d,e,f){ console.log("loki.uploadUrl() is deprecated, please use loki.web.uploadUrl()."); return loki.web.uploadUrl(a,b,c,d,e,f) };
loki.importUrl = function(a,b,c,d,e,f){ console.log("loki.importUrl() is deprecated, please use loki.web.importUrl()."); return loki.web.importUrl(a,b,c,d,e,f) };
loki.webServiceUrl = function(a,b,c,d,e,f){ console.log("loki.webServiceUrl() is deprecated, please use loki.web.webServiceUrl()."); return loki.web.webServiceUrl(a,b,c,d,e,f) };
loki.list = function(a,b,c,d,e,f){ console.log("loki.list() is deprecated, please use loki.data.list()."); return loki.data.list(a,b,c,d,e,f) };
loki.getKnownChildren = function(a,b,c,d,e,f){ console.log("loki.getKnownChildren() is deprecated, please use loki.data.list()."); return loki.data.list(a,b,c,d,e,f) };
loki.login = function(a,b,c,d,e,f){ console.log("loki.login() is deprecated, please use loki.user.login()."); return loki.user.login(a,b,c,d,e,f) };
loki.logout = function(a,b,c,d,e,f){ console.log("loki.logout() is deprecated, please use loki.user.logout()."); return loki.user.logout(a,b,c,d,e,f) };
loki.isNewUrn = function(a,b,c,d,e,f){ console.log("loki.isNewUrn() is deprecated, please use loki.urn.isNewUrn()."); return loki.urn.isNewUrn(a,b,c,d,e,f) };
loki.getUrnLastSegment = function(urn){ console.log("loki.getUrnLastSegment() is deprecated, please use loki.urn.getLastSegment()."); return loki.urn.getLastSegment(urn) };
loki.domain = loki.app;
loki.system = loki.app;
loki.user.securityRootUrns = loki.user.authRootUrns;
loki.app.domainUrn = (loki.user.authRootUrns.length>0)?loki.user.authRootUrns[0]:null;

