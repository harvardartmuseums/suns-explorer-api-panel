// jsonPanel.js
//
// Inserts, styles, and manages a JSON display
// and HAM API query editor
//
// |query       | -*-*-*-*-*-*-*-*-*-*-
// ||----------|| *-*-*-*-*-*-*-*-*-*-*
// || ...      || -*-*-*-*-*-*-*-*-*-*-
// ||----------|| *-*-*-*-*-*-*-*-*-*-*
// |            | -*-*-*-*-*-*-*-*-*-*-
// |json        | *-*-*-*-*-*-*-*-*-*-*
// ||----------|| -*-*-*-*-*-*-*-*-*-*-
// || { ...    || -*-*-*-*-*-*-*-*-*-*-
// ||----------|| *-*-*-*-*-*-*-*-*-*-*
// |            | -*-*-*-*-*-*-*-*-*-*-
//
//
// Requires: jQuery
//
//
// To operate, call setupPanel with parameters:
//
// 		baseURL
//			Basic API url
//			e.g., "api.harvardartmuseums.org"
//
//		apiKey
//			API key
//			If null, will solicit user key
//
//		width
//			Of panel, in % of window
//			Optional; default is 25%
//
//		setQuery
//			Sets a basic required query
//			e.g., "color=any&size=1"
//
//
// The variable panelAPIurl will report the full
// api query url, including api key and user input.
//
// The variable panelWidth will report the current
// width of the panel in percent of window.


var apiURL = "";
var apiKey = "";
var basicQuery = "";
var panelAPIurl = "";
var panelWidth = .25;
var defaultPanelWidth = .25;

function setupPanel(baseURL, setKey, width, setQuery) {
	apiURL = baseURL + "/object?apikey=";

	if (width != null) {
		panelWidth = width;
		defaultPanelWidth = width;
	}

	if (setQuery != null) {
		basicQuery = setQuery;
	}

	if (setKey != null) {
		apiKey = setKey;
		$("body").prepend("<div id=\"controlPanel\"><div id=\"flexbox\"><div id=\"query\">/object?" + basicQuery + "<div id=\"editablequery\" contenteditable onblur=\"queryUpdate()\" onkeydown=\"handleEnter(this, event)\" onpaste=\"handlePaste(event)\"></div></div><div id=\"json\"><span id=\"jsonContent\"></span></div></div><div id=\"panelMinimizer\" onClick=\"togglePanel()\"></div></div>");
	} else {
		$("body").prepend("<div id=\"controlPanel\"><div id=\"flexbox\"><div id=\"query\">/object?apikey=<div id=\"editablekey\" contenteditable onblur=\"keyUpdate()\" onkeydown=\"handleEnter(this, event)\" onpaste=\"handlePaste(event)\"></div>" + "&" + basicQuery + "<div id=\"editablequery\" contenteditable onblur=\"queryUpdate()\" onkeydown=\"handleEnter(this, event)\" onpaste=\"handlePaste(event)\"></div></div><div id=\"json\"><span id=\"jsonContent\"></span></div></div><div id=\"panelMinimizer\" onClick=\"togglePanel()\"></div></div>");
	}

	panelAPIurl = apiURL + apiKey + "&" + basicQuery;

	$("body").css({"width": "100%", "height": "100%"});
	$("html").css({"width": "100%", "height": "100%"});

	$("#controlPanel").css({
		"position": "absolute",
		"top": "0px",
		"left": "0px",
		"width": "25%",
		"height": "100%",
		"transform": "translate(0, 0)",
		"transition": "transform 1s",
		"border-right": "1px solid #AAAAAA",
		"background-color": "#FFFFFF",
		"z-index": "50"
	});

	$("#flexbox").css({
		"position": "absolute",
		"display": "flex",
		"flex-direction": "column",
		"align-items": "center",
		"justify-content": "space-around",
		"width": "100%",
		"height": "100%"
	});

	$("#panelMinimizer").css({
		"position": "absolute",
		"cursor": "col-resize",
		"top": "0px",
		"right": "0px",
		"width": "3px",
		"height": "100%",
		"background-color": "#AAAAAA"
	});

	$("#query").css({
		"box-sizing": "border-box",
		"padding": ".5vw 1vw",
		"position": "relative",
		"width": "90%",
		"min-height": "10%",
		"border": "1px solid #AAAAAA",
		"flex-grow": "0",
		"flex-shrink": "0",
		"word-wrap": "break-word"
	});

	$("#editablequery").css({
		"display": "inline",
		"padding": "0 .25em 0 .25em",
		"background-color": "#AAAAAA",
		"word-wrap": "break-word"
	});

	$("#editablekey").css({
		"display": "inline",
		"padding": "0 .25em 0 .25em",
		"background-color": "#AAAAAA",
		"word-wrap": "break-word"
	});

	$("#json").css({
		"box-sizing": "border-box",
		"position": "relative",
		"width": "90%",
		"height": "50%",
		"border": "1px solid #AAAAAA",
		"flex-grow": "0",
		"flex-shrink": "0"
	});

	$("#jsonContent").css({
		"box-sizing": "border-box",
		"padding": "0px",
		"display": "block",
		"width": "100%",
		"height": "100%",
		"overflow": "auto",
		"white-space": "pre",
		"font-size": "65%"
	});

	$('<style>#editablequery:focus {border: 1px solid #217AC0; outline: none; glow: none;} #editablekey:focus {border: 1px solid #217AC0; outline: none; glow: none;} #query::before {content: "Query:"; position: absolute; top: -17px; left: 0px;} #query::after {content: "try &title=tragedy"; position: absolute; bottom: -15px; right: 0px; font-size: 75%;} #json::before {content: "JSON:"; position: absolute; top: -17px;} #json::after {content: "an example JSON response for the query above"; position: absolute; bottom: -15px; right: 0px; font-size: 75%;}</style>').appendTo('head');

	updateJSON();
}


function togglePanel() {
	if (panelWidth == defaultPanelWidth) {
		panelWidth = 0;
		$("#controlPanel").css("transform", "translate(-" + (defaultPanelWidth*width - 3) + "px, 0)");
	} else {
		panelWidth = defaultPanelWidth;
		$("#controlPanel").css("transform", "translate(0, 0)");
	}
}

function prettify(string) {
	var colorful = "";
	var regex = /"#([0-9]|[a-z]){6}"/;
	var index = 0;
	var text = "";
	while (string.length > 0) {
		index = string.search(regex);
		if (index != -1) {
			text = regex.exec(string)[0];
			colorful += string.slice(0, index);
			colorful += "<span style=\"color: " + text.slice(1, -1) + "\">";
			colorful += text + "</span>";
			string = string.slice(index + 9);
		} else {
			colorful += string;
			string = "";
		}
	}

	var bold = "";
	regex = /"[^"]*":/;
	while (colorful.length > 0) {
		index = colorful.search(regex);
		if (index != -1) {
			text = regex.exec(colorful)[0];
			bold += colorful.slice(0, index);
			bold += "<strong>" + text.slice(0, -1) + "</strong>";
			colorful = colorful.slice(index + (text.length - 1));
		} else {
			bold += colorful;
			colorful = "";
		}
	}

	var linked = "";
	regex = /"http[^"]*"/;
	while (bold.length > 0) {
		index = bold.search(regex);
		if (index != -1) {
			text = regex.exec(bold)[0];
			linked += bold.slice(0, index);
			linked += "\"<a href=" + text + " target=\"_blank\">" + text.slice(1, -1) + "</a>";
			bold = bold.slice(index + (text.length - 1));
		} else {
			linked += bold;
			bold = "";
		}
	}

	var email = "";
	regex = /"[^"]*@[^"]*"/;
	while (linked.length > 0) {
		index = linked.search(regex);
		if (index != -1) {
			text = regex.exec(linked)[0];
			email += linked.slice(0, index);
			email += "\"<a href=\"mailto:" + text.slice(1, -1) + "\" target=\"_top\">" + text.slice(1, -1) + "</a>";
			linked = linked.slice(index + (text.length - 1));
		} else {
			email += linked;
			linked = "";
		}
	}

	return email;
}

function updateJSON() {
	var xmlrequest = new XMLHttpRequest();

	xmlrequest.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200) {
				$("#jsonContent").html(prettify(JSON.stringify(JSON.parse(this.responseText), null, 2)));
			}
		}
	};

	xmlrequest.open("GET", panelAPIurl, true);
	xmlrequest.send();
}

function keyUpdate() {
	apiKey = $("#editablekey").html().replace(/<\/?br>/, "");
	queryUpdate();
}

function queryUpdate() {
	panelAPIurl = apiURL + apiKey + "&" + basicQuery + $("#editablequery").html().replace("&amp;", "&").replace(/<\/?br>/, "");
	updateJSON();
}

function handleEnter(object, e) {
	if (e.which == "13") {
		e.preventDefault();
		$(object).blur();
		return false;
	}
}

function handlePaste(e) {
	e.preventDefault();

	if (e.clipboardData) {
		content = (e.originalEvent || e).clipboardData.getData('text/plain');
		document.execCommand('insertText', false, content);
	}
	else if (window.clipboardData) {
		content = window.clipboardData.getData('Text');
		document.selection.createRange().pasteHTML(content);
	}
}
