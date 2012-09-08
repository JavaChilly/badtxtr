var child = require('child_process'),
    async = require('async'),
	uuid  = require('node-uuid');

var PUBLIC_IMG_DIR  = '/Users/johnny/Projects/badtxtr/public/uploads/';
var COMMAND_TIMEOUT = 20000;
/*
 * POST a report of a bad texter
 */

var processReport = function(report) {
	
}

exports.submit = function(req, res){
	console.log(req.files);
	console.log(uuid.v4());
	
	var report = {
		id : uuid.v4(),
		image: null
	}
	
	if ( req.files.pic && req.files.pic.pic ) {
		var pic = req.files.pic.pic;
		var src = pic.path;
		
		if (pic.type == 'image/jpeg' || pic.type == 'image/png' ) {
			report.image = {
				name : report.id + '.jpg';
			};
			
			async.series({
				move: function(next) {
					var rename_cmd = 'mv ' + src + ' ' + PUBLIC_IMG_DIR + report.image.name;
			        child.exec(rename_cmd, {timeout:COMMAND_TIMEOUT/2}, function(error, stdout, stderr) {
			            if (stderr && !error) {
			                error = stderr; // is this ok or will something explode?
			            }
			            if (error) {
			                console.log("encountered error while moving file: " + src);
							console.log(error);
							next(error);
			            } else {
							next();
			            }
			        });
				},
				resize: function(next) {
					// convert landscape_full.jpg -auto-orient -resize 1024x1024 -set filename:fname '%t_' \( +clone -auto-orient -resize 600x600 -write '%[filename:fname]detail.jpg' +delete \) \( +clone -auto-orient -thumbnail 100x150 -write '%[filename:fname]tile.jpg' +delete \) \( +clone -auto-orient -thumbnail 75x75^ -gravity center -extent 75x75 -write '%[filename:fname]thumb.jpg' +delete \) '%[filename:fname]hd.png'
					var resize_cmd = 'convert ' + PUBLIC_IMG_DIR + report.image.name + "-auto-orient -resize 100x100 '" + PUBLIC_IMG_DIR + report.image.name + "'";
					child.exec(resize_cmd, {timeout:COMMAND_TIMEOUT}, function(error, stdout, stderr) {
		                if (stderr && !error) {
			                error = stderr; // is this ok or will something explode?
			            }
						if (error) {
			                console.log("encountered error while resizing: " + PUBLIC_IMG_DIR + report.image.name);
							console.log(error);
							next(error);
			            } else {
							report.image.thumb = report.id + '_thumb.jpg';
							next();
			            }
		            });
				}
			}, function(error, results) {
	    		var results = {};
	    		if(error) {
	    			logger.error("resizer sequence failed with error:", error);
	    		}
				
				//
	        });
		
			
		}
		
		/*
		
		
		{ pic: 
		   { size: 4138079,
		     path: '/tmp/b376c5a3656545c909a82996d4b54fd4',
		     name: 'P1000478_2.JPG',
		     type: 'image/jpeg',
		     hash: false,
		     lastModifiedDate: Sat Sep 08 2012 12:18:28 GMT-0700 (PDT),
		     _writeStream: 
		      { path: '/tmp/b376c5a3656545c909a82996d4b54fd4',
		        fd: 10,
		        writable: false,
		        flags: 'w',
		        encoding: 'binary',
		        mode: 438,
		        bytesWritten: 4138079,
		        busy: false,
		        _queue: [],
		        _open: [Function],
		        drainable: true },
		     length: [Getter],
		     filename: [Getter],
		     mime: [Getter] } }	
	}
	*/

	res.render('index', { title: 'BadTXTr' })
};