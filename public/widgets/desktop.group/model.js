define(function() {
	var myModel = Spine.Model.sub();
	myModel.configure("id", "name", "column");
	myModel.extend(Spine.Model.Ajax);
	myModel.extend(Spine.Model.Local);
	
	myModel.extend({
		url: "../services/myResources/infoDb/getDBList/isRealData/false",
		fromJSON: function(objects) {
			var cModel = this,
				rtdata;

			if ( !objects ) {
				return;
			}
			if (typeof(objects) == 'string') {
				objects = JSON.parse(objects);
			}

			if (Spine.isArray(objects)) {
				rtdata = objects.map(function(object) {
					return new cModel(object);
				});

				console.log("### model fetch ###");
				console.log(objects);
				console.log(rtdata);

				return rtdata;
			} else {
				return new cModel(objects);
			}
		}
	});

	myModel.include({
		toJSON: function(objects) {
			var data = this.attributes();
			// do some processing
			return data;
		}
	});

	return myModel;
});