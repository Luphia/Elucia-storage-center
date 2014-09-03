
/**
 * Module dependencies.
 */

var fs = require('fs')
  , express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , https = require('https')
  , sslOpt = {
      key: fs.readFileSync('./config/server.key'),
      cert: fs.readFileSync('./config/server.crt'),
      ca: fs.readFileSync('./config/ca.crt'),
      requestCert: false,
      rejectUnauthorized: false,
      passphrase: "iServStorage"
    }
  , path = require('path')
  , os = require('os')
  , util = require('util')
  , commands = require('./modules/cmdqueue.js')
  , storage = require('./modules/keyvaluestore.js')
  , procedure = require('./modules/procedure.js')
  , fileHealthy = {}
  , io
  , server
  , secureServer
  , log4js = require('log4js')
  , chokidar = require('chokidar')
  , config = require('./config/config.json')
  , filter = require("./controller/Filter").init(commands, storage, config)
  , fake = require("./controller/FakeData").init(commands, storage, config)
  , test = require('./controller/Test').init(commands, storage, config)
  , JobPublisher = require('./modules/jobpublisher')//.init(commands, storage, config);  // need to setup rabbitmq
  , StorageReader = require('./controller/Storage').init(commands, storage, config)

  , indexController = require('./controller/Index')//.init(commands, storage, config)
  , clientController = require('./controller/Client').init(commands, storage, config)
  , configInfoController = require('./controller/ConfigInfo').init(commands, storage, config)

  , supplierController = require('./controller/Supplier').init(commands, storage, config)
  , sysSupplierConfigController = require('./controller/SysSupplierConfig').init(commands, storage, config)
  , loginController = require('./controller/Login').init(commands, storage, config)
  , logInfoController = require('./controller/LogInfo').init(commands, storage, config)
  , registerController = require('./controller/Register').init(commands, storage, config)
  , reportController = require('./controller/Report').init(commands, storage, config)
  , fileController = require('./controller/File').init(commands, storage, config, fileHealthy)
  , smartProvisionController = require('./controller/SmartProvision').init(commands, storage, config)
  , summaryController = require('./controller/Summary').init(commands, storage, config)
  , nodeRiskController = require('./controller/NodeRisk').init(commands, storage, config, fileHealthy)
  , fileHealthyController = require('./controller/fileHealthy').init(commands, storage, config, fileHealthy)
  , getDBDataController = require('./controller/GetDBData').init(commands, storage, config)
  , userLogController = require('./controller/UserLog')//.init(commands, storage, config)
  , userUsageController = require('./controller/UserUsage')//.init(commands, storage, config)
  , systemMonitor = require('./controller/SystemMonitor').init(commands, storage, config, fileHealthy)
  , supplierMonitorCollector = require("./controller/SupplierMonitorCollector").init(commands, storage, config, fileHealthy)
  ;

config.reload = function(_config) {
  console.log("reload config");
  var fs = require("fs");
  fs.readFile('./config/config.json', function (err, data) {
    var newConfig = JSON.parse(data.toString());
    for(var key in newConfig) {
      config[key] = newConfig[key];
    }
    console.log(config);
  });
};
var watcher = chokidar.watch('./config/config.json', {ignored: /[\/\\]\./, persistent: true});
watcher.on('change', function(path) {config.reload();});

log4js.configure('./config/log.config.json', { reloadSecs: 300 });
console.logger = log4js.getLogger('worker');

// prevent crash
process.on('uncaughtException', function(err) {
	console.trace('Caught exception: ' + err);
});


// generate file healthy analysis
var mf = new require("./modules/fileHealthyFactory.js").init(storage, config);
mf.create(function(e, data) {
  fileHealthy = data;
  nodeRiskController.init(false, false, false, fileHealthy);
  fileHealthyController.init(false, false, false, fileHealthy);
  fileController.setFileHealthy(fileHealthy);

  systemMonitor.init(false, false, false, fileHealthy);
  systemMonitor.repairFiles();

  // supplier monitor
  supplierMonitorCollector.init(false, false, false, fileHealthy);
  supplierMonitorCollector.monitor();
});


// console.log(JSON.stringify(config));
var app = express();

app.configure(function(){
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Authorization, X-Requested-With");
        res.header("Access-Control-Allow-Methods", "GET");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    });
    app.set('port', process.env.PORT || 3000);
  	app.set('views', __dirname + '/views');
  	// app.set('view engine', 'jade');
  	app.use(express.favicon(__dirname + '/public/images/favicon.png'));
  	app.use(express.logger('dev'));
  	app.use(express.bodyParser());
  	app.use(express.methodOverride());
  	app.use(express.cookieParser('A word for XXX'));
  	app.use(express.session({secret: "A word for XXX"}));
  	app.use(filter.nodeEnter);
  	app.use(filter.userEnter);
    app.use(filter.escapeXss);
  	app.use(app.router);
  	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});


//app.get('/', routes.index);
app.get('/fake/*', fake.get );
app.get('/test/*', test.test );
app.get('/curl/*', test.testMethod );
app.post('/curl/*', test.testMethod );
app.put('/curl/*', test.testMethod );
app.del('/curl/*', test.testMethod );
app.get('/config', function(_req, _res){
    var tmpCFG = require("./data/systemconfig.json");
    _res.send(JSON.stringify(tmpCFG));
});
app.get('/user', loginController.getUserData);

//StorageReader
app.get('/storage/config', sysSupplierConfigController.storageConfig);
app.get('/storage/*', StorageReader.get);

//CommandOperator controller
app.get('/command/*', require("./controller/CommandOperator").init(commands).get );
app.del('/command/*', require("./controller/CommandOperator").init(commands).delete );

//login controller
app.post('/login', loginController.login);
app.get('/login', loginController.checkLogin);
app.del('/login', loginController.logout);
app.get('/token/:token', loginController.tokenCheck);
app.del('/token/:token', loginController.tokenDelete);
app.put('/token/:token', loginController.tokenRenew);
app.get('/user/config', loginController.getUserConfig);
app.post('/user/genkey', loginController.genKey);
app.post('/user/key', loginController.postUserKey);
app.get('/user/key', loginController.getUserKey);
app.del('/user/key', loginController.deleteUserKey);

//register controller
app.post('/register/registerClient', registerController.registerClient);
app.post('/register/registerSupplier', registerController.registerSupplier);

// checkAccount controller
app.get('/checkAccount/:account', registerController.checkAccount);
app.get('/checkPassword/:account/:password', registerController.checkPassword);

//client controller
app.get('/manage/client', clientController.clientList);
app.get('/manage/client/diskUsage', clientController.clientDiskUsage);
app.get('/manage/client/diskUsage/*', clientController.clientDiskUsage);
app.put('/manage/client/updatePwd', clientController.clientUpdatePwd);

//config Controller
app.get('/configInfo/infoGet', configInfoController.infoGet);
app.post('/configInfo/infoSave', configInfoController.infoSave);

//supplier controller
app.get('/manage/supplier', supplierController.supplierList);
app.get('/manage/supplier/map', supplierController.supplierListMap);
app.post('/manage/supplier/supplierUpdateStatus', supplierController.supplierUpdateStatus);

//file controller
app.get('/file/*', fileController.fileDownload);
app.post('/file/*', fileController.fileUpload);
app.put('/file/*', fileController.fileUpload);
app.del('/file/*', fileController.fileDelete);
app.post('/check', fileController.checkFileAuth);
app.post('/confirm/*', fileController.fileUploadConfirm);

//System Controller
app.get('/checkNode/:ip', smartProvisionController.checkNode);
//SmartProvision controller
app.get('/exec/replication/:clientId/*', smartProvisionController.getReplication);
//nodeRisk controller
app.get('/nodeRisk', nodeRiskController.nodeRiskGet);
app.get('/fileHealthy/*', fileHealthyController.get);
app.get('/node/fileList', fileHealthyController.getFileList);
app.post('/node/fileLost', fileHealthyController.nodeFileLost);

//Summary controller
app.get('/summary/summaryInfo', summaryController.summaryInfo);
app.get('/summary/summarySupplier', summaryController.summarySupplier);
app.get('/summary/summarySupplier/:id', summaryController.summarySupplier);

//GetDBData controller
app.get('/dbdata/:period_start/:period_end', getDBDataController.get);
app.get('/diskhour/:client_id/:period_start/:period_end', getDBDataController.getDiskHour);

//client feedback
app.post('/report/clientInfo', reportController.clientInfo);

//metadata
app.post('/meta/*', fileController.metaPost);
app.get('/meta/*', fileController.metaGet);
app.put('/meta/*', fileController.metaPut);
app.del('/meta/*', fileController.metaDelete);
app.get('/fileList', fileController.metaList);

//logInfo controller
app.post('/logInfo', logInfoController.logInfoInsert);

app.post('/heartbeat/*', function(_req, _res) {
  	var rs = new require("./modules/jobResult.js")();
  	rs.setResult(1);
  	_res.send(rs.toJSON());
});


//start server
server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Center HTTP listening on port " + app.get('port'));
});
server80 = http.createServer(app).listen(80, function(){
  console.log("Center HTTP listening on port 80");
});
// https server
secureServer = https.createServer(sslOpt, app).listen('3300', function(){
  console.log("Center HTTPS listening on port 3300");
});