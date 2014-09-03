define(function()
{
	var supplierGoogleMap = function() 
	{
		var node,
			data,

		init = function(_node, _data) 
		{
			this.node = _node;
			this.data = _data;
			this.getSupplier();

		    return this;
		},

		getSupplier = function()
		{		
			this.transAddress = [];
			var that = this;
			elucia.rest.get(
			{
				url: "/manage/supplier/map",
				success: function(_data) 
				{
					for(var key in _data.data)
					{
						//tran address
						addressGeocoder(_data.data[key].address, that,function()
						{
							if(that.transAddress.length == _data.data.length)
							{
								that.includeMap(_data);
							}
						});					
					}					
				}
			});
		},

		addressGeocoder = function(_address, _that, _callback)
		{ 
			geocoder = new google.maps.Geocoder();
			geocoder.geocode(
			{
			    'address':_address
			},
			function (results,status) 
			{
			   	if(status==google.maps.GeocoderStatus.OK) 
			    {//console.log(results[0].geometry.location);
			    	_that.transAddress.push(results[0].geometry.location.ob+","+results[0].geometry.location.pb);
			    	_callback();
			    }
			}); 
		},

		includeMap = function(_data)
		{
			var markers = [];

			//optoin
			var mapOptions = 
			{
		        center: new google.maps.LatLng(24.973875,121.592024),
		        zoom: 10,
		        mapTypeId: google.maps.MapTypeId.ROADMAP
		    };

		    //set map
		    var mapCanvasId = "mapCanvas_" + Math.uuid();
		    $("#mapCanvas",this.node).prop("id",mapCanvasId);
		    $("#"+mapCanvasId).width("99%").height("400px");
		  
		    var map = new google.maps.Map(document.getElementById(mapCanvasId),mapOptions);

		    //set location ["地址","經度","緯度"]
		    var locations = [];
		    for(var key in this.transAddress)
		    {
		    	var tmp = [_data.data[key].name+"<br>"+_data.data[key].address+"<br>"+_data.data[key].machine_ip,this.transAddress[key].split(",")[0],this.transAddress[key].split(",")[1]];
		    	locations.push(tmp);
		    }

			var infowindow = new google.maps.InfoWindow(),
				marker; 

			for(var i=0;i<locations.length;i++)
			{
				var latlng = new google.maps.LatLng(locations[i][1],locations[i][2]);
				var title = locations[i][0];
				marker = new google.maps.Marker(
				{
					'position': latlng,
					'map':map,
				});

				google.maps.event.addListener(marker, 'click', (function(marker, i) 
				{ 
					return function() 
					{ 
						infowindow.setContent(locations[i][0]); 
				 		infowindow.open(map, marker); 
				 	} 
				 })(marker, i)); 
			}
		  

		


			
		},

		destroy = function() 
		{
			this.node.remove();
		},

		that = 
		{
			init: init,
			getSupplier:getSupplier,
			includeMap:includeMap,
			addressGeocoder:addressGeocoder,
			destroy: destroy
		};

		return that;
	};

	return supplierGoogleMap;
});
