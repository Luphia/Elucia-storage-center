module.exports =  function()
{
	getIpMapAddress = function(_ip)
	{
		var ipMap = 
		[
			{"ip":"10.10.20.94:3000","address":"台灣台北市"},
			{"ip":"10.10.20.95:3000","address":"台灣新北市"}
		]

		var address,
			check = false;
		for(var key in ipMap)
		{
			if(ipMap[key].ip == _ip)
			{
				address = ipMap[key].address;
				check = true;
			}
		}

		if(!check)
		{
			address = "台灣桃園市";
		}

		return address;
	},

	that = 
	{
		getIpMapAddress:getIpMapAddress
	};

	return that;
}