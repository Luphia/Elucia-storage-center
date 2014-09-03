var view = 1,
	user,
	desktop,
	currentClientHeight = 0,
	configuration = {
		paths: {
			cs: "./lib/cs",
			order: "./lib/order",
			css: "./lib/css",
			widgets: "../widgets",
			login: "./login",
			config: "./config"
		},
		period: 3000
	},
	myMonitors = {},
	useLanguage = "zh-tw";

function setLanguage(_lang) {
	var refresh = (_lang != useLanguage);

	if(typeof(_lang) == "undefined") {
		_lang = useLanguage;
	}
	else {
		useLanguage = _lang;
	}

	i18n.set({lang: _lang, path: './language'});
	if(refresh) {
		translateAll();
	}
}

function translateAll() {
	$("span.translate").each(function(_index, _elem) {
		var word = $(this).attr("word");
		$(this).text( i18n._(word) );
	});
}

function checkBrowser() {
	// download chrome - https://www.google.com/chrome
	// confirm(JSON.stringify(window.$.client), "", {});
	console.log(window.$.client);
}

function loadConfig() {
	var data = {
		url: configuration.paths.config,
		success: function(_data) {
			for(var key in _data) {
				configuration[key] = _data[key];
			}
		}
	};
	elucia.rest.get(data);
}

function afterLogin(_data) {
	configuration.user = _data;
	var tmpWidget = {
		"name": "desktop",
		"data": {
			"user": user
		}
	};

	elucia.add(tmpWidget, function(_node, _data, _obj) {
		desktop = _obj;
	});
	// window.onresize = resize;
}

function afterLogout() {
	for(var key in openWindows) {
		openWindows[key].destroy();
	}
	configuration.user = {};
	desktop.destroy();
}

/*
$("div.screen").touchwipe({
	wipeLeft: function() { page(1); },
	wipeRight: function() { page(-1); },
	wipeUp: function() { alert("up"); },
	wipeDown: function() { alert("down"); },
	min_move_x: 20,
	min_move_y: 20,
	preventDefaultEvents: true
});
*/

$(document).ready(function() {
  	loadConfig();
  	checkBrowser();
  	setLanguage();

    elucia.add({"name": "login", "data": {"config": configuration, "afterLogin": afterLogin, "afterLogout": afterLogout}}, function(_node, _data, _obj) {
    	user = _obj;
    });
    elucia.add("msg", function(_node, _data, _obj) {
    window.alert = _obj.alert;
    });
});