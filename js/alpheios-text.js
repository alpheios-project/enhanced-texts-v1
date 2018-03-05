/**
 * @fileoverview Javascript functionality for Alpheios text pages
 *
 * @version $Id: alpheios-text.js 847 2009-03-02 16:12:49Z BridgetAlmas $
 *
 * Copyright 2008-2009 Cantus Foundation
 * http://alpheios.net
 *
 * This file is part of Alpheios.
 *
 * Alpheios is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alpheios is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Supported Firefox versions
 */
var FIREFOX_VERSION_TEST = 'Firefox/';
var FIREFOX_VERSION_STRING = 'Firefox 3.x';

var ALPHEIOS_INSTALL_URL = 'http://alpheios.net/content/installation';

var ALPHEIOS_IDS =
{
    '{4816253c-3208-49d8-9557-0745a5508299}':'reader',
    '{0f1d7e06-6ce8-40b0-83f0-9783ee65ab9b}':'greek',
    '{7dd2b42f-3db8-4833-88c4-5a9e3788017b}':'latin'
}
/**
 * Supported Alpheios extensions
 */
var ALPHEIOS_EXT_REQS =
{
	'reader': { name: 'Alpheios Basic Libraries',
		    url: 'http://alpheios.net/xpi-install/alpheios-basic-latest.xpi',
		    min_version: '1.0beta2'
	          },
	'greek':  { name: 'Alpheios Greek Tools',
		    url: 'http://alpheios.net/xpi-install/alpheios-greek-latest.xpi',
		    min_version: '1.0beta2',
		    reader_match: [['1.0alpha','1.0alpha'],['1.0beta','1.0beta']]
		  },
	'latin':  { name: 'Alpheios Latin Tools',
		    url: 'http://alpheios.net/xpi-install/alpheios-latin-latest.xpi',
		    min_version: '1.0beta2',
		    reader_match: [['1.0alpha','1.0alpha'],['1.0beta','1.0beta']]
		  }
};

/**
 * Mapping of possible xml language codes to the corresponding Alpheios
 * extension code (this should really be done by the Alpheios Reader extension
 */
var ALPHEIOS_LANGUAGE_CODES =
{
	'el': 'greek',
	'grc': 'greek',
	'greek': 'greek',
	'latin': 'latin',
	'lat': 'latin',
	'la' : 'latin'
};

/**
 * Document ready functions
 */
function alpheios_ready()
{
	// Initialize the site toolbar
	$('ul.sf-menu').superfish();
	// add mac-specific stylesheet
	if (navigator.platform.match(/mac/i))
	{
	    $("head").append('<link href="../css/alpheios-text-mac.css" type="text/css" rel="stylesheet"');
	}

}

function getAlpheiosPackages()
{
    var pkgs = {};
    $("meta[name=_alpheios-installed-version]").each(
    function()
    {
	var info = $(this).attr("content").split(/:/);
	var id = info[0];
	var version = info[1];
	var key = ALPHEIOS_IDS[id];
	if (key)
	{
	    pkgs[key] = {};
	    pkgs[key].installed = version;
	    pkgs[key].metRequirement = check_version(ALPHEIOS_EXT_REQS[key].min_version,version);
	}
    }
    );
    return pkgs;
}

/**
 * Check for the presence of the Alpheios extensions required by the page
 * Note that this must be called upon load of the body tag, and not
 * from the jQuery document ready function because document ready is called
 * before the extension has time to insert the required metadata elements.
 * @param {Boolean} a_on_site flag to indicate whether or not we're on
 *                          an alpheios-enabled site (in which case,
 *                          list the required extensions, with a single
 *                          link to the installation/download site)
 */
function check_for_alpheios(a_on_site)
{
	if (typeof a_on_site == "undefined")
	{
		a_on_site = true;
	}

        if ($("#alpheios-install-links").length == 0)
        {
	    return;
        }

	var has_reader = false;
	var needs_language =
                $("#alpheios-require-language").attr("content") ||
		document.documentElement.getAttribute("xml:lang") ||
	        document.documentElement.getAttribute("lang");
	// map the language code used for the page to the one used
	// by Alpheios. TODO - eventually we should support multiple
	// languages per page
        var required_languages = [];
        var lang_list = needs_language.split(/\s+/);
        for (var i=0; i<lang_list.length; i++)
        {
            var a_lang = lang_list[i];
   	    if (typeof ALPHEIOS_LANGUAGE_CODES[a_lang] == 'string')
            {
	        required_languages.push(
                     [ALPHEIOS_LANGUAGE_CODES[a_lang],false]);
            }
	}
	// iterate through the metadata elements added to the page
	// by the Alpheios Reader extension (if any) to see if the
	// required ones are installed
	var installed_versions = getAlpheiosPackages();
	var version_text = $(".alpheios-version-text");
	if (installed_versions.reader &&
	    installed_versions.reader.installed.match(/beta/i))
	{
	    $("a",version_text).text("Beta Version");
	    version_text.css("display","block");
	}
	else if (installed_versions.reader &&
		 installed_versions.reader.installed.match(/alpha/i))
	{
	    $("a",version_text).text("Alpha Version");
	    version_text.css("display","block");
	}
        // if we're missing any of the required extensions, add links
	// to install them to the page, and hide the Alpheios toolbar
	var xpis = [];

	var sync_error = false;
	if (! (installed_versions.reader &&
	       installed_versions.reader.metRequirement))
	{
	    var info = getInstallInfo('reader');
	    xpis.push(info)
	}
        for (var i=0; i<required_languages.length; i++)
        {
            var a_lang = required_languages[i];
	    if (! (installed_versions[a_lang[0]] &&
		    installed_versions[a_lang[0]].metRequirement))
	    {
		var info = getInstallInfo(a_lang[0]);
		xpis.push(info);
	    }
	    else
	    {
		var match_pairs = ALPHEIOS_EXT_REQS[a_lang[0]].reader_match;
		for (var j=0; j<match_pairs.length; j++)
		{
		    var match_cond = match_pairs[j][0];
		    var match_read = match_pairs[j][1];
		    if (installed_versions[a_lang[0]].installed
				    .match(new RegExp(match_cond)) &&
			! installed_versions.reader.installed.match(match_read))
		    {
			sync_error = true;
			break;
		    }
		}
	    }
        }
	var html;
	if (sync_error || xpis.length > 0)
	{
	   html = "";
     disable_alpheios();
     new Alpheios.Embedded("#alpheios-main",document,{top:"30vh",left:"45vw"},{}).activate();
	}
}

function disable_alpheios()
{
     // add the install link to the page and hide
     // the toolbar
     $("#alpheios-install-links").css("display","none");
     $("#alph-toolbar").css("display","none");
     $("#alpheios-current-level").css("display","none");
     $("#alpheios-v2-hints").css("display","block");
}

/**
 * Compare installed extension version with required extension version
 * @param a_req_v the required version
 * @param a_has_v the installed version
 * @return true if installed version meets requirement otherwise false
 * @param Boolean
 */
function check_version(a_req_v,a_has_v)
{
    /**
     * this code implements only part of the logic
     * specified for the Mozilla Toolkit version format
     * see https://developer.mozilla.org/en/Toolkit_version_format
     * The 4 parts of the Alpheios version string are:
     * <major version>.<minor version>.<svn revision>.<build date>
     * The following code compares up to the first three parts only
     * and if a string part is missing, it assumes that we won't
     * use any string part which evaluates higher than 'zzzzzzzzzzzzzzz'
     */
    var req_parts = String(a_req_v).split(/\./);
    var has_parts = String(a_has_v).split(/\./);
    if (has_parts.length == 0)
    {
        return false;
    }

    var met_requirement = true;
    var met_part = 0;
    PARTS:
    for (var i=0; i<=req_parts.length; i++)
    {
         if (met_part > 0)
         {
             break;
         }
         if (met_part < 0)
         {
             met_requirement = false;
             break;
         }

         if (i == req_parts.length)
         {
             break;
         }
         if (req_parts[i] == '*')
         {
             continue;
         }
         var req_part_match = req_parts[i].match(/^(\d+)(\w+)?(\d+)?$/);
         var has_part_match = has_parts[i].match(/^(\d+)(\w+)?(\d+)?$/);
         VERSION_PART:
         for (var j=1; j<4; j++)
         {

             met_part = 0;
             var missing_part = j == 2 ? 'zzzzzzzzzzzzzzzz' : '0';
             if (!req_part_match[j]) req_part_match[j]=missing_part;
             if (!has_part_match[j]) has_part_match[j]=missing_part;

             // first and third parts are numbers
             if (j==1 || j==3)
             {
                 req_part_match[j] = parseInt(req_part_match[j]);
                 has_part_match[j] = parseInt(has_part_match[j]);

             }
             if (has_part_match[j] > req_part_match[j])
             {
                 met_part = 1;
                 break VERSION_PART;
             }
             else if (has_part_match[j] < req_part_match[j])
             {
                 met_part = -1;
                 break VERSION_PART;
             }
             // parts were equal so go on to next part
         }

    }
    return met_requirement;

}

/**
 * Get the installation details
 * @param {String} a_tool extension identifier
 * @return object with properties xpi and details
 * @type {Object}
 */
function getInstallInfo(a_tool)
{
	var url = ALPHEIOS_EXT_REQS[a_tool].url;
	var name = ALPHEIOS_EXT_REQS[a_tool].name;
	var version = ALPHEIOS_EXT_REQS[a_tool].min_version;
	var xpi_name = url.match(/\/([^\/]+\.xpi)/)[1];

	return { xpi: url,
		 details: name + " (" + version + ")"};
}

/**
 * Function to install the specified xpi file
 * @param {String} a_file xpi file url
 * @param {String} a_release name of the xpi file (for display during install)
 */
function install_xpi(a_file,a_release) {
	if (navigator.userAgent.indexOf("Firefox") == -1)
        {
            alert("Firefox is required to install these browser extensions.");
            return;
        }
        var xpi = new Object();
        xpi[a_release] = a_file;
        InstallTrigger.install(xpi,function(){});
}

/**
 * Function to install multiple xpi files together
 * @param {Array} a_xpis list of xpi files to install
 */
function installXpis(a_xpis)
{
    if (navigator.userAgent.indexOf("Firefox") == -1)
    {
	alert("Firefox is required to install these browser extensions.");
        return;
    }
    var xpiObj = {};
    for (var i=0; i<a_xpis.length; i++)
    {
	var xpi = a_xpis[i];
	var name = xpi.match(/\/([^\/]+\.xpi)/)[1];
	xpiObj[name] = xpi;
    }
    InstallTrigger.install(xpiObj,function(){});
}
