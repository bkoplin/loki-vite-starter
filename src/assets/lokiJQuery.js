// @ts-check
/**
 * @license lokiJQuery copyright 2019 SaplingData LLC
 */

/**
 * A Loki JavaScript utility providing jquery base utilities
 * @module lokiJQuery
 */

/** Load the data for the entity with the given urn using the given view
 * @memberof module:lokiJQuery
 * @param {string} urn the urn of the entity to be loaded
 * @param {string} viewUrn the entity view used to do the load
 * @param {Object} options service options
 * @param {string} options.format the format in which to return the data. "json" is the default.
 * @param {string} options.dataSpaceUrn the data space from which to load the data
 * @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.
 * @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
 * @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
 * @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
 * @return {Promise}
 */
import axios from 'axios'

let $ = {
    ajax
}
/**
 * @param {{ type: 'GET'|'POST'; url: string; data: {}|string; }} params
 */
function ajax(params) {
    return axios[params.type.toLowerCase()](params.url, params.data).then(d => d.data)
}
loki.data.loadEntity = function( urn, viewUrn, options ) {
  options = options || {};
  // set query params based on other options, but don't allow caller to set options.queryParams
  if ( options.format ) {
      options.queryParams = "format="+options.format;
  } else {
      // default to json
      options.queryParams = "format=json";
      options.format = "json";
  }
  if ( options.dataSpaceUrn ) {
      options.queryParams = options.queryParams+"&dataSpaceUrn="+options.dataSpaceUrn;
  }
  
  var jsonpCallback = null;
  var dataType = options.format;
  if ( options.jsonp ) {
      jsonpCallback = 'jsoncallback';
      dataType = 'jsonp';  // automatically adds callback param to url
  }
  if ( options.format === 'xml' ) {
      // jquery will return a dom object for xml, but we typically want a string
      dataType = 'text';
  }
  
  var url = loki.web.dataServiceUrl(urn,viewUrn,options);
  var promise = $.ajax({
      type: 'GET',
      contentType: 'application/json',
      url: url,
      dataType : dataType,
      jsonp : jsonpCallback // name of callback param
  });
  promise = loki.data._handleJsonp(promise, options);
  return promise;
};

/** Save the data for the entity with the given urn using the given view
* @memberof module:lokiJQuery
* @param {string} urn the urn of the entity to be loaded
* @param {string} viewUrn the entity view used to do the load
* @param {Object} options service options
* @param {string} options.format the format in which to return the data. "json" is the default.
* @param {string} options.dataSpaceUrn the data space to save the data into
* @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false. (Not sure this works for POST.)
* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
* @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
* @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
* @return {Promise}
*/
loki.data.saveEntity = function(urn, viewUrn, data, options) {
  options = options || {};
  // set query params based on other options, but don't allow caller to set options.queryParams
  if ( options.format ) {
      options.queryParams = "format="+options.format;
  } else {
      options.queryParams = "format=json"; // default to json
  }
  if ( options.dataSpaceUrn ) {
      options.queryParams = options.queryParams+"&dataSpaceUrn="+options.dataSpaceUrn;
  }
  
  var jsonpCallback = null;
  var dataType = 'json';
  if ( options.jsonp ) {
      jsonpCallback = 'jsoncallback';
      dataType = 'jsonp';  // automatically adds callback param to url
  }
  
  var url = loki.web.dataServiceUrl(urn,viewUrn,options);
  var promise = $.ajax({
      method: "POST",
      contentType: 'application/json',
      url: url,
      data: typeof data === 'string' ? data : JSON.stringify(data),
      dataType : dataType,
      jsonp : jsonpCallback // name of callback param
  });
  promise = loki.data._handleJsonp(promise, options);
  return promise;
};

/** Delete the entity with the given urn
* @memberof module:lokiJQuery
* @param {string} urn the urn of the entity to be deleted
* @param {Object} options service options
* @param {string} options.format the format in which to return the data. "json" is the default.
* @param {string} options.dataSpaceUrn the data space to delete the data from
* @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.  (Not sure this works for DELETE.)
* @param {string} options.recursive if true then recusively delete all child entities. Default is false.
* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
* @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
* @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
* @return {Promise}
*/
loki.data.deleteEntity = function(urn, options, unused1) {
  if ( arguments.length > 2 || typeof options === 'string' ) {
      // for backward compatibility, arguments used to be (urn,view,options) but view is not needed
      console.log("loki.data.deleteEntity(urn,view,options) is deprecated, please use loki.data.deleteEntity(urn, options)");
      options = unused1 || {};
  } else {
      options = options || {};
  }
  return loki.data.deleteItem(urn,options);
};

/** Delete the resource with the given urn
* @memberof module:lokiJQuery
* @param {string} urn the urn of the resource to be deleted
* @param {Object} options service options
* @param {string} options.format the format in which to return the data. "json" is the default.
* @param {string} options.dataSpaceUrn the data space to delete the data from
* @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.  (Not sure this works for DELETE.)
=* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
* @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
* @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
* @return {Promise}
*/
loki.data.deleteResource = function(urn,options) {
  return loki.data.deleteItem(urn,options);
};

/** Delete the entity or resource with the given urn
* @memberof module:lokiJQuery
* @param {string} urn the urn of the entity/resource to be deleted
* @param {Object} options service options
* @param {string} options.format the format in which to return the data. "json" is the default.
* @param {string} options.dataSpaceUrn the data space to delete the data from
* @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.  (Not sure this works for DELETE.)
=* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
* @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
* @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
* @return {Promise}
*/
loki.data.deleteItem = function(urn, options) {
  options = options || {};
  // set query params based on other options, but don't allow caller to set options.queryParams
  if ( options.format ) {
      options.queryParams = "format="+options.format;
  } else {
      options.queryParams = "format=json"; // default to json
  }
  if ( options.recursive && options.recursive === true ) {
      options.queryParams = options.queryParams + "&recursive=true";
  }
  if ( options.dataSpaceUrn ) {
      options.queryParams = options.queryParams+"&dataSpaceUrn="+options.dataSpaceUrn;
  }
  
  var jsonpCallback = null;
  var dataType = 'json';
  if ( options.jsonp ) {
      jsonpCallback = 'jsoncallback';
      dataType = 'jsonp';  // automatically adds callback param to url
  }
  
  var url;
  if ( loki.urn.isResourceUrn(urn) ) {
      url = loki.web.resourceUrl(urn,options);
  } else {
      url = loki.web.dataServiceUrl(urn,"urn:com:loki:core:model:api:rawData",options);
  }
  
  var promise = $.ajax({
      method: "DELETE",
      url: url,
      dataType : dataType,
      jsonp : jsonpCallback // name of callback param
  });
  promise = loki.data._handleJsonp(promise, options);
  return promise;
};

/** Gets header info for the entity or resource without retrieving the data
* @memberof module:lokiJQuery
* @param {string} urn the urn of the entity or resource
* @param {string} options.format the format in which to return the data. "json" is the default.
* @param {string} options.dataSpaceUrn the data space from which to load the data
* @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false. (Not sure this works for HEAD.)
* @return {Promise} resolving with header information
*/
loki.data.head = function(urn, options) {
  options = options || {};
  if ( options.format ) {
      options.queryParams = "format="+options.format;
  } else {
      options.queryParams = "format=json"; // default to json
  }
  if ( options.dataSpaceUrn ) {
      options.queryParams = options.queryParams+"&dataSpaceUrn="+options.dataSpaceUrn;
  }
  var url;
  if ( loki.urn.isResourceUrn(urn) ) {
      url = loki.web.resourceUrl(urn,options);
  } else {
      url = loki.web.dataServiceUrl(urn,"urn:com:loki:core:model:api:rawData",options);
  }
  
  var jsonpCallback = null;
  var dataType = 'json';
  if ( options.jsonp ) {
      jsonpCallback = 'jsoncallback';
      dataType = 'jsonp';  // automatically adds callback param to url
  }
  
  var promise = $.ajax({
      method: "HEAD",
      contentType: 'application/json',
      url: url,
      dataType : dataType,
      jsonp : jsonpCallback // name of callback param
  });
  var cPromise = promise.then( function(data,status,res) {
      var lastModified = res.getResponseHeader('Last-Modified');
      return {
          'Last-Modified':lastModified
      };
  }, loki.data._handleJsonpErrHandler);
  return cPromise;
};

/** List all the children of the given urn
* @memberof module:lokiJQuery
* @param {string} parentUrn the parent urn whose children are to be listed
* @param {string} options.dataSpaceUrn the data space to do the list on
* @param {Object} options service options
* @param {number} options.beginIdx the index of the first item to be returned
* @param {number} options.numRequested the max number of items to be returned
* @param {string} options.outputView (optional) allows entity data to be returned instead of a list of urns. If provided this view will be used to load and return entity data.
* @param {string} options.format the format in which to return the data. "json" is the default.
* @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false.
* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
* @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
* @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
* @return {Promise}
*/
loki.data.list = function( parentUrn, options ) {
  options = options || {};
  // set query params based on other options, but don't allow caller to set options.queryParams
  if ( options.format ) {
      options.queryParams = "format="+options.format;
  } else {
      options.queryParams = "format=json"; // default to json
  }
  if ( options.dataSpaceUrn ) {
      options.queryParams = options.queryParams+"&dataSpaceUrn="+options.dataSpaceUrn;
  }
  if ( options.beginIdx ) {
      var beginIdx = options.beginIdx;
      options.queryParams = options.queryParams + "&begin="+beginIdx;
  }
  if ( options.numRequested ) {
      var numRequested = options.numRequested;
      options.queryParams = options.queryParams + "&num="+numRequested;
  }
  if ( options.outputView ) {
      var outputView = loki.web.urnToUrlParams( options.outputView );
      options.queryParams = options.queryParams + "&outputView="+outputView;
  }
  options.subjectUrn = parentUrn;
  
  var jsonpCallback = null;
  var dataType = 'json';
  if ( options.jsonp ) {
      jsonpCallback = 'jsoncallback';
      dataType = 'jsonp';  // automatically adds callback param to url
  }
  
  var url = loki.web.webServiceUrl("urn:com:loki:core:model:api:list",options);
  var promise = $.ajax({ type: 'GET',
      url: url,
      dataType : dataType,
      jsonp : jsonpCallback // name of callback param
  });
  promise = loki.data._handleJsonp(promise, options);
  return promise;
};

/** Load the resource with the given urn
* The resource will be loaded as text.
* @memberof module:lokiJQuery
* @param {string} urn the urn of the resource to be loaded
* @param {Object} options service options
* @param {string} options.dataSpaceUrn the data space to save the data into
* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
* @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
* @param {string} options.urlPrefix use this prefix at the base of the url in order to connect to another application. Typically you don't want to hardcode this so use options.serviceGroupUrn or options.connection instead.
* @return {Promise}
*/
loki.data.loadResource = function( urn, options ) {
  options = options || {};
  
  // set query params based on other options (if any), but don't allow caller to set options.queryParams
  if ( options.dataSpaceUrn ) {
      options.queryParams = "dataSpaceUrn="+options.dataSpaceUrn+"&";
  } else {
      options.queryParams = "";
  }
  options.queryParams = options.queryParams +'noCache='+(new Date()).getTime();  // prevent caching
  var url = loki.web.resourceUrl(urn,options);
  var promise = $.ajax({
      type: 'GET',
      dataType: 'text',
      url: url
  });
  return promise;
};

loki.data._hash = function (keys, values) {
  var hash = {},
      vlen = (values && values.length) || 0,
      i, len;
  for (i = 0, len = keys.length; i < len; ++i) {
      if (i in keys) {
          hash[keys[i]] = vlen > i && i in values ? values[i] : true;
      }
  }
  return hash;
};
loki.data._mapResultsFilter = function(results,hasOutputview) {
  var newResults;
  if ( hasOutputview ) {
      newResults = new Array(results.results.length);
      for ( var i = 0; i < results.results.length; i++ ) {
          var result = results.results[i][0];
          newResults[i] = result;
      }
      return newResults;
  } else {
      newResults = [];
      var columnNames = results.columnNames;
      if ( columnNames ) {
          $.each(results.results, function(i,result) {
              newResults.push(loki.data._hash( columnNames, result)); 
          });
      }
  }
  results.results = newResults;
  return results;
};
loki.data._addParamValue = function ( name, value, paramParam, prefix ) {
  if ( $.isArray(value) ) {
      // This value is an array, repeat all values in the url parameter
      for ( var j=0; j < value.length; j++ ) {
          paramParam = paramParam + "&"+prefix+name+"="+encodeURIComponent(value[j]);
      }
  } else {
      paramParam = paramParam + "&"+prefix+name+"="+encodeURIComponent(value);
  }
  return paramParam;
};
loki.data._addParams = function(params,prefix) {
  var paramParam = "";
  if ( $.isArray(params) ) {
      for ( var i = 0; i < params.length; i++ ) {
          paramParam = loki.data._addParamValue( params[i].name, params[i].value, paramParam, prefix );
      }
  } else {
      for ( var name in params ) {
          paramParam = loki.data._addParamValue( name, params[name], paramParam, prefix );
      }
  }
  return paramParam;
};

/** Execute a named query on the server or a query string
* @memberof module:lokiJQuery
* @param {Object} options options and parameters for executing the query
* @param {string} options.queryUrn the urn of the named query to be executed
* @param {string} options.query the query to be executed
* @param {string} options.format the format of the results. The default is "json"
* @param {string} options.dataSpaceUrn the data space on which to run the query
* @param {string[]|string[][]} options.params the numbered params for the query. Each param may have multiple values.  These params are substituted into the query in the order given. Examples: ["v1",["v2a","v2b],"v3"]
* @param {Object|Object[]} options.namedParams the named params for the query. Each param may have multiple values.  These params are substituted into the query by name. Examples: {p1:"v1",p2:["v2a","v2b"]}; [{name:"p1",value:"v1"},{name:"p2",value:["v2a","v2b"]}]
* @param {Object|Object[]} options.expressionParams the expression params for the query.  These params can substitute expressions within the query and are substituted into the query by name. Examples: {p1:"v1",p2:["v2a","v2b"]}; [{name:"p1",value:"v1"},{name:"p2",value:["v2a","v2b"]}]
* @param {number} options.begin (or options.beginIdx) used in query result paging, the index of the first entity to be returned from the query. Ignored if a LokiYQuery is provided
* @param {number} options.num (or options.numRequested) used in query result paging, the number of entities to be returned from the query. Ignored if a LokiYQuery is provided
* @param {string} options.outputView request that the first (and only) column returned by the query (which must be a urn) is turned into an object using the given outputView
* @param {string} options.outputViews request that all columns returned by the query (which must all be urns) are turned into objects using the given outputViews
* @param {boolean} options.mapResults if set to true then map the results such that an array of objects is always returned.  Only works for json data.
* @param {boolean} options.post use POST http method
* @param {boolean} options.jsonp if true, use jsonp for cross site calls. Also, options.format must be json. Default is false. (Not sure this works for POST.)
* @param {string} options.serviceGroupUrn use this service group to determine the base of the url when connecting to another application.
* @param {string} options.connection use this connection to determine the base of the url when connecting to another application.
* @param {string} options.urlPrefix used to override the beginning of the url so that another application may be called.
* @param {boolean} options.useCurrentUserAuth if true, use the current user's authentication to access the remote service. (default false). NOTE: does not work cross domain.
* @return {Promise}
*/
loki.data.query = function( options, unused ) {
  if ( typeof options === "string") {
      // handle loki.data.query(queryUrn,options) in a backward compatible way
      console.log("loki.data.query(queryUrn,options) is deprecated, please use loki.data.query(options) where one option is 'queryUrn'.");
      unused.queryUrn = options;
      options = unused;
  }
  options = options || {};
  if ( options.engine && !options.dataSpaceUrn ) {
      options.dataSpaceUrn = options.engine;
      console.log("The options.query param is deprecated fro loki.data.query(). Use options.dataSpaceUrn instead.");
  }
  
  var hasOutputView = false;
  if ( options.outputView || options.outputViews ) {
      hasOutputView = true;
  }
  
  var post;
  if ( typeof(options.post) !== 'undefined' ) {
      post=options.post;
  } else if ( options.queryUrn ) {
      post = false;  // default to GET when there is a queryUrn so that we have a easy to repeat url for the query
  } else {
      post = true; // default to POST for an adhoc query
  }
  
  var jsonpCallback = null;
  var dataType = 'json';
  if ( options.jsonp ) {
      jsonpCallback = 'jsoncallback';
      dataType = 'jsonp';  // automatically adds callback param to url
  }
  
  var queryUrn = options.queryUrn;
  if ( queryUrn && options.connection ) {
      if ( queryUrn.startsWith(":") ) {
          // use connection root if there is no root to the queryUrn
          queryUrn = options.connection.rootUrn + queryUrn;
      }
  }
  
  var headers;
  if ( options.useCurrentUserAuth && loki.user.getUserSessionKey ) {
      headers = {"Authorization":"LOKISESSION "+loki.user.getUserSessionKey()};
  }
  
  var url;
  var promise;
  if(post) { // POST
      url = loki.web.webServiceUrl("urn:com:loki:core:model:api:query",{
          subjectUrn:null,
          queryParams: "",
          serviceGroupUrn: options.serviceGroupUrn,
          connection: options.connection,
          urlPrefix: options.urlPrefix
      });
      var postOpts = JSON.parse(JSON.stringify(options)); // make a copy
      postOpts.queryUrn = queryUrn;
      delete postOpts.mapResults;
      delete postOpts.post;
      if ( typeof postOpts.begin !== 'undefined' ) {
          postOpts.beginIdx = postOpts.begin; // the post json param is beginIdx for the web service
          delete postOpts.begin;
      }
      if ( typeof postOpts.num !== 'undefined' ) {
          postOpts.numRequested = postOpts.num; // the post json param is numRequested for the web service
          delete postOpts.num;
      }
      promise = $.ajax({ type: 'POST',
          url: url,
          contentType: 'application/json',
          data: JSON.stringify(postOpts),
          dataType : dataType,
          jsonp : jsonpCallback, // name of callback param
          // beforeSend: function(xhr){loki.data._setHeaders(xhr,headers);},
          headers: headers  // requires jquery 1.5
      });
  } else { // GET
      var params;
      if ( queryUrn ) {
          params = "queryUrn="+loki.web.urnToUrlParams(queryUrn);
      } else if ( options && !options.post){
          params = "query="+encodeURIComponent(options.query);
      }
      if ( options.format ) {
          params = params + "&format="+options.format;
      } else {
          params = params + "&format=json"; // default to json
      }
      if ( options.beginIdx ) {
          params = params + "&begin="+options.beginIdx;
      }
      if ( options.begin ) {
          params = params + "&begin="+options.begin;
      }
      if ( options.numRequested ) {
          params = params + "&num="+options.numRequested;
      } else if ( options.num ) {
          params = params + "&num="+options.num;
      }
      if ( options.dataSpaceUrn ) {
          params = params + "&dataSpaceUrn="+loki.web.urnToUrlParams(options.dataSpaceUrn);
      }
      if ( options.outputView ) {
          var outputView = loki.web.urnToUrlParams( options.outputView );
          params = params + "&outputView="+outputView;
      }

      var outputViewParam = "";
      if ( options.outputView ) {
          outputViewParam = "&outputView="+loki.web.urnToUrlParams( options.outputView );
      } else if ( options.outputViews ) {
          for ( var i in options.outputViews ) {
              outputViewParam = outputViewParam+"&outputView="+loki.web.urnToUrlParams( options.outputViews[i] );
          }
      }
      params = params + outputViewParam;

      var paramParam = "";
      // Numbered parameters are p1, p2, p3, etc and can be multi valued arrays
      if ( options.params ) {
          for ( var i = 0; i < options.params.length; i++ ) {
              if ( $.isArray(options.params[i]) ) {
                  // This parameter is an array, repeat its values in the p{x} url parameter
                  for ( var j=0; j < options.params[i].length; j++ ) {
                      paramParam = paramParam + "&p"+(i+1)+"="+encodeURIComponent(options.params[i][j]);
                  }
              } else {
                  paramParam = paramParam + "&p"+(i+1)+"="+encodeURIComponent(options.params[i]);
              }
          }
      }
      // Named parameters are a name/value map and can have multi valued arrays
      if ( options.namedParams ) {
          paramParam = paramParam + loki.data._addParams(options.namedParams,"p_");
      }
      // Expression parameters are a name/value map and can have multi valued arrays
      if ( options.expressionParams ) {
          paramParam = paramParam + loki.data._addParams(options.expressionParams,"e_");
      }
      params = params + paramParam;
      
      url = loki.web.webServiceUrl("urn:com:loki:core:model:api:query",{
          subjectUrn:null,
          queryParams: params,
          serviceGroupUrn: options.serviceGroupUrn,
          connection: options.connection,
          urlPrefix: options.urlPrefix
      });
      
      promise = $.ajax({ type: 'GET',
          url: url,
          dataType : dataType,
          jsonp : jsonpCallback, // name of callback param
          // beforeSend: function(xhr){loki.data._setHeaders(xhr,headers);},
          headers: headers  // requires jquery 1.5
      });
  }
  promise = loki.data._handleJsonp(promise, options);
  
  if ( options.mapResults ) {
      promise = promise.then( function(data) {
          return loki.data._mapResultsFilter( data, hasOutputView );
      });
  }
  return promise;
};

loki.data._handleJsonpErrHandler = function(xhr, statusCode, statusText) {
  try {
      var json = xhr.responseText.replace(/jQuery[0-9_]+\(/g, "").replace(/\)/g, '').replace('{"results":[','');
      xhr.responseJSON = JSON.parse(json);
  } catch (e) {}
  return xhr;
};
loki.data._handleJsonp = function(promise, options) {
  // NOTE: auth on cross domain jsonp won't work since cross-domain jsonp cannot send headers since it injects a script tag into the html
  if ( options.jsonp ) {
      // translate error message from jsonp to json if needed
      promise = promise.then( function(data, statusCode, xhr) {
          return data;
      }, loki.data._handleJsonpErrHandler);
  }
  return promise;
};
//loki.data._setHeaders = function(xhr, headers) {
//    // provide functionality to set headers (in jquery 1.5 this is not necessary)
//    if (headers) {
//        for ( var headerName in headers ) {
//            var headerValue = headers[headerName];
//            if ( headerValue ) {
//                xhr.setRequestHeader(headerName, headerValue);
//            }
//        }
//    }
//};


/** Login a user
* @memberof module:lokiJQuery
* @param {string} username
* @param {string} password
* @return {Promise} A promise that completes when the login (on the server side) succeeds or errors
*/
loki.user.login = function(username,password) {
  var data = { username : username, password : password };
  var url = loki.web.webServiceUrl("urn:com:loki:core:model:api:login");
  var promise = $.ajax({ type: 'POST',
      url: url,
      dataType : 'json',
      //dataType : 'jsonp', // automatically adds callback param to url
      //jsonp : 'jsoncallback', // name of callback param
      data: JSON.stringify(data),
      //processData: false, // send data in body
      contentType: 'application/json'
  });
  return promise.then( function(data) {
      if ( data && data.userUrn ) {
          loki._config.userUrn = data.userUrn;
      }
      return data;
  });
};
  
/** Logs out the current user
* @memberof module:lokiJQuery
* @return {Promise} A promise that completes when the logout (on the server side) succeeds or errors
*/
loki.user.logout = function() {
  promise = loki.user.login(null,null);
  return promise;
};

/** Creates a new guest user account and sets the state (via cookies, etc) so that the current user is the new guest user
* The javascript loki variable is set so that loki.user.getUserUrn() returns the new guest user urn
* @memberof module:lokiJQuery
* @return {Promise} A promise that returns the urn of the new guest user
*/
loki.user.createGuestUser = function() {
  var url = loki.web.webServiceUrl("urn:com:loki:user:model:api:createGuestUser");
  var promise = $.ajax({ type: 'POST',
      url: url,
      dataType : 'json',
      // data: JSON.stringify(data),
      contentType: 'application/json'
  });
  return promise.then( function(data) {
      if ( loki._config ) {
          loki._config.userUrn = data.newGuestUserUrn;
      }
      return data;
  });
};


/** Begins the process of creating a new user and credentials for the person currently logged in to the application
* 
* @memberof module:lokiJQuery
* @param {object} options request options object
* @param {string} options.userUrn (optional) the urn of the existing user to give credentials to
* @param {string} options.userName the userName for login purposes (set on the credentials)
* @param {string} options.userDisplayName (optional) the full display name for a new user
* @param {string} options.email the email for communications with the new user
* @param {string} options.password (optional) the password for the new user's login credentials. If not passed here, the new user can choose a password on the confirmation page.
* @param {string} options.confirmUrl the url to the page where the user is sent to create their user login credentials. This link is put in the email sent to the user. It may be an absolute or relative url. A url parameter 'token' will be added to the url to pass the secure request token to the confirm page. For security reasons, this url must point to the same server and port as the app making the request.
* @param {string} options.returnUrl (optional) the url to send the user to after the user creation process is complete. This url is passed back from the confirmation service. It may be an absolute or relative url. For security reasons, this url must point to the same server and port as the app making the request.
* @return {Promise} A promise that returns when the request is successfully submitted
*/
loki.user.createMyUserRequest = function(options) {
  var data = {
      userName : options.userName,
      userDisplayName : options.userDisplayName,
      email: options.email,
      password : options.password,
      confirmUrl: options.confirmUrl,
      returnUrl: options.returnUrl
  };
  var url = loki.web.webServiceUrl("urn:com:loki:user:model:api:createMyUserRequest");
  var promise = $.ajax({ type: 'POST',
      url: url,
      dataType : 'json',
      data: JSON.stringify(data),
      contentType: 'application/json'
  });
  return promise.then( function(data) {
      return data;
  });
};

/** Begins the process of inviting a new user of the application
* See the documentation on the web service (urn:com:loki:user:model:api:inviteNewUserRequest) for more information.
* @memberof module:lokiJQuery
* @param {object} options request options object
* @param {string} options.userUrn (optional) the urn of the existing user to give credentials to
* @param {string} options.userName the userName for login purposes (set on the credentials)
* @param {string} options.userDisplayName (optional) the full display name for a new user
* @param {string} options.email the email for communications with the new user
* @param {string} options.password (optional) the password for the new user's login credentials. If not passed here, the new user can choose a password on the confirmation page.
* @param {string} options.confirmUrl the url to the page where the user is sent to create their user login credentials. This link is put in the email sent to the user. It may be an absolute or relative url. A url parameter 'token' will be added to the url to pass the secure request token to the confirm page. For security reasons, this url must point to the same server and port as the app making the request.
* @param {string} options.returnUrl (optional) the url to send the user to after the user creation process is complete. This url is passed back from the confirmation service. It may be an absolute or relative url. For security reasons, this url must point to the same server and port as the app making the request.
* @return {Promise} A promise that returns when the request is successfully submitted
*/
loki.user.inviteNewUserRequest = function(options) {
  var data = {
      userUrn: options.userUrn,
      userName : options.userName,
      userDisplayName : options.userDisplayName,
      email: options.email,
      password : options.password,
      confirmUrl: options.confirmUrl,
      returnUrl: options.returnUrl
  };
  var url = loki.web.webServiceUrl("urn:com:loki:user:model:api:inviteNewUserRequest");
  var promise = $.ajax({ type: 'POST',
      url: url,
      dataType : 'json',
      data: JSON.stringify(data),
      contentType: 'application/json'
  });
  return promise.then( function(data) {
      return data;
  });
};

/** Completes the process of creating a new user and credentials.
* This service should be called when the new user returns via the confirmUrl sent in email.
* See the documentation on the web service (urn:com:loki:user:model:api:createUserConfirm) for more information.
* 
* @memberof module:lokiJQuery
* @param {string} token the secure request token
* @param {object} options request options object
* @param {string} options.password the password for the new user. If provided in the request step then password is not needed.
* @return {Promise} A promise that returns when the request is successfully submitted
*/
loki.user.createUserConfirm = function(token, options) {
  var data = {
      token : token,
      password : options.password
  };
  var url = loki.web.webServiceUrl("urn:com:loki:user:model:api:createUserConfirm");
  var promise = $.ajax({ type: 'POST',
      url: url,
      dataType : 'json',
      data: JSON.stringify(data),
      contentType: 'application/json'
  });
  return promise.then( function(data) {
      if ( loki._config ) {
          loki._config.userUrn = data.newUserUrn;
      }
      return data;
  });
};

