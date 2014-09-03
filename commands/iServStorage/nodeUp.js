module.exports = function(){
  var job,

  init = function(_job)
  {
    job = _job;
    return this;
  },
 
  execute = function(_data, _callback)
  {
    try 
    {
      var nodepath = "http://" + _data.node + "%";
      var sql = "update file_path set status = 2 where file_path like '" + nodepath + "' and status = 1";

      var cDb = require("../../modules/queryDB.js");
      db = new cDb().queryDB(sql, _data._config, function(err,result)
      {
        if(!err)
        {
          _callback(false, job);
        }
        else
        {
          throw err;
        }
      });
    }
    catch(e)
    {
      _callback(e);
    }

  },

  that = {
    init: init,
    execute: execute
  };
  return that;
}