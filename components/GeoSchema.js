// Based on: https://addons.mozilla.org/en-US/firefox/addon/geo-schema-handler/

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

const nsIProtocolHandler = Ci.nsIProtocolHandler;

const osm = "http://www.openstreetmap.org/";
const geoSCHEME = "geo";
const geoPROTOCOL_CID = Components.ID( "{5072d14a-86df-4236-b519-28f75aed9aa6}" );
const geoPROTOCOL_CONTRACT_ID = "@mozilla.org/network/protocol;1?name=" + geoSCHEME;
    
Components.utils.import( "resource://gre/modules/XPCOMUtils.jsm" );

function GeoSchema() {}

GeoSchema.prototype = {
    scheme: geoSCHEME,
    protocolFlags: nsIProtocolHandler.URI_NORELATIVE |
        nsIProtocolHandler.URI_NOAUTH |
        nsIProtocolHandler.URI_LOADABLE_BY_ANYONE,

    newURI: function( aSpec, aOriginCharset, aBaseURI ) {
        var uri = Cc[ "@mozilla.org/network/simple-uri;1" ].createInstance( Ci.nsIURI );

        uri.spec = aSpec;

        return uri;
    },

    newChannel: function( aURI ) {
        var ios = Cc[ "@mozilla.org/network/io-service;1" ].getService( Ci.nsIIOService ),
            fullGeoURI = aURI.spec,
            coords = fullGeoURI.slice( 4 ).split( "," ),
            lat = coords[ 0 ],
            lon = coords[ 1 ],
            osmuri = ios.newURI( osm + "?mlat=" + lat + "&mlon=" + lon + "#map=17/" + lat + "/" + lon, null, null )
            channel = ios.newChannelFromURI( osmuri, null ).QueryInterface( Ci.nsIHttpChannel );

        channel.setRequestHeader("X-Moz-Is-Feed", "1", false);

        return channel;
    },
 
    classDescription: "geo: URL schema manager",
    contractID: geoPROTOCOL_CONTRACT_ID,
    classID: geoPROTOCOL_CID,
    QueryInterface: XPCOMUtils.generateQI( [ Ci.nsIProtocolHandler ] )
}

if ( XPCOMUtils.generateNSGetFactory ) {
    var NSGetFactory = XPCOMUtils.generateNSGetFactory( [ GeoSchema ] );
} else {
    var NSGetModule = XPCOMUtils.generateNSGetModule( [ GeoSchema ] );
}

