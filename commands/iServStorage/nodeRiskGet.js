module.exports = function()
{
	var job,

	init = function(_job)
	{
		job = _job;
		return this;
	}, 

	execute = function(_data, _callback)
	{
      var fileHealthy = _data.fileHealthy,
          monitorData = _data.monitorData,
          data = [],
          totalDanger = 0,
          totalRisk = 0,
          totalFile = 0,
          badStatus = 0,
          liveStatus = 0,
          riskCount = 0,
          totalInfo = {};

      //merge fileHealthy and monitorData
      if(!!monitorData)
      {
          for(var key in monitorData)
          {
              var tmp = {},check = false;
              for(var key2 in fileHealthy)
              {
                  if(key == fileHealthy[key2].id) 
                  {
                      check = true;
                      tmp.ip = fileHealthy[key2].node;
                      tmp.name = monitorData[key].name;
                      tmp.fileCount = fileHealthy[key2].total;
                      tmp.risk = fileHealthy[key2].risk;
                      tmp.danger = fileHealthy[key2].danger;
                      tmp.status = monitorData[key].status;

                      if(monitorData[key].status == 0)
                      {
                          tmp.totalSpace = 0;
                          tmp.useSpace = 0;
                          badStatus++;
                      }
                      else
                      {
                          tmp.totalSpace = monitorData[key].disk.total;
                          tmp.useSpace = monitorData[key].disk.loading;
                          liveStatus++;
                      }                   
                      data.push(tmp);

                      //info
                      totalDanger += tmp.danger;
                      totalFile += tmp.fileCount;

                      if(tmp.risk > 0)
                        riskCount++;
                  }
              }

              if(!check)
              {
                  tmp.ip = monitorData[key].ip;
                  tmp.name = monitorData[key].name;
                  tmp.fileCount = monitorData[key].total;
                  tmp.risk = 0;
                  tmp.danger = 0;
                  tmp.totalSpace = 0;
                  tmp.useSpace = 0;
                  tmp.status = monitorData[key].status;
                  data.push(tmp);
              }
          }
      } 

      //set info
      totalInfo = 
      {
          "totalDanger":totalDanger,
          "totalFile":totalFile,
          "riskCount":riskCount,
          "totalNode":data.length,
          "badStatus":badStatus,
          "liveStatus":liveStatus
      }

      //test add new node && remove
      // if(typeof _data.add != "undefined") 
      // {
        // var tmp = {};
        //   tmp = {"id":3, "totalSpace":100000,"useSpace":10000,"ip":"127.0.0.1","fileCount":150,"name":"test","risk":50,"status":1}
        //   data.push(tmp);

        //    var tmp = {};
        //   tmp = {"id":4, "totalSpace":100000,"useSpace":10000,"ip":"127.0.0.2","fileCount":150,"name":"test","risk":40,"status":1}
        //   data.push(tmp);

        //    var tmp = {};
        //   tmp = {"id":5, "totalSpace":100000,"useSpace":10000,"ip":"127.0.0.3","fileCount":150,"name":"test","risk":30,"status":1}
        //   data.push(tmp);

        //    var tmp = {};
        //   tmp = {"id":6, "totalSpace":100000,"useSpace":10000,"ip":"127.0.0.4","fileCount":150,"name":"test","risk":20,"status":1}
        //   data.push(tmp);

        //    var tmp = {};
        //   tmp = {"id":7, "totalSpace":100000,"useSpace":10000,"ip":"127.0.0.5","fileCount":150,"name":"test","risk":10,"status":1}
        //   data.push(tmp);

        //    var tmp = {};
        //   tmp = {"id":8, "totalSpace":100000,"useSpace":10000,"ip":"127.0.0.6","fileCount":150,"name":"test","risk":55,"status":1}
        //   data.push(tmp);

          //  var tmp = {};
          // tmp = {"id":9, "totalSpace":100000,"useSpace":10000,"ip":"127.0.0.7","fileCount":150,"name":"test","risk":50,"status":1}
          // data.push(tmp);
      // }

      _data._result.message ="get nodeRisk success";
      _data._result.result = 1;
      _data._result.data.node = data;
      _data._result.data.totalInfo = totalInfo;
      _data._result.data.summary = _data.summaryData;

      _callback(false,job);
	},

	that = 
	{
		init: init,
		execute: execute
	};

	return that;
}