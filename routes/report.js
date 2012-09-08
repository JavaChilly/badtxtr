var child = require('child_process'),
    async = require('async'),
	uuid  = require('node-uuid');

var PUBLIC_IMG_DIR  = '/Users/johnny/Projects/badtxtr/public/uploads/';
var COMMAND_TIMEOUT = 20000;

exports.fetch = function(req, res, next) {
	console.log(req.query.lat + "," + req.query.lon);
	req.db.collection( 'reports', function( err, collection ) {
		if ( err ) { return next( err ); }
		collection.find({ 
			'loc' : { 
				'$near' : [parseFloat(req.query.lat), parseFloat(req.query.lon)],
				'$maxDistance' : 3
			}
		}).toArray(function(err, results) {
			res.json({ status: 'ok', results: results });
		});
	});
};

/*
 * POST a report of a bad texter
 */
exports.submit = function(req, res, next){
	var report = {
		id : uuid.v4(),
		image: null,
		created: new Date()
	};
	
	async.parallel({
		populateReport: function( next ) {
			report.loc = [ parseFloat(req.body.lat), parseFloat(req.body.lon) ];
			report.who = req.body.who;
			report.what = req.body.what;
			next();
		},
		
		processImage: function( next ) {
			if ( !req.files.pic ) {
				// no pic uploaded
				console.log('no pic uploaded');
				next();
			} else {
				var pic = req.files.pic;
				var src = pic.path;

				if (pic.type != 'image/jpeg' && pic.type != 'image/png' ) {
					// not the right format
					console.log('not the right format');
					next();
				}

				var fullName = report.id + '.jpg';
				var thumbName = report.id + '_thumb.jpg';

				async.series({
					move: function(next) {
						full = report.id + '.jpg';
						var rename_cmd = 'mv ' + src + ' ' + PUBLIC_IMG_DIR + fullName;
						child.exec(rename_cmd, {timeout:COMMAND_TIMEOUT/2}, function(error, stdout, stderr) {
				            if (stderr && !error) {
				                error = stderr; // is this ok or will something explode?
				            }
				            if (error) {
				                console.log("encountered error while moving file: " + src);
								console.log(error);
								next(error);
				            } else {
								report.image = {
									full: fullName
								};
								next();
				            }
				        });
					},
					resize: function(next) {
						// convert landscape_full.jpg -auto-orient -resize 1024x1024 -set filename:fname '%t_' \( +clone -auto-orient -resize 600x600 -write '%[filename:fname]detail.jpg' +delete \) \( +clone -auto-orient -thumbnail 100x150 -write '%[filename:fname]tile.jpg' +delete \) \( +clone -auto-orient -thumbnail 75x75^ -gravity center -extent 75x75 -write '%[filename:fname]thumb.jpg' +delete \) '%[filename:fname]hd.png'
						var resize_cmd = 'convert ' + PUBLIC_IMG_DIR + report.image.full + " -auto-orient -resize 100x100 " + PUBLIC_IMG_DIR + thumbName;
						child.exec(resize_cmd, {timeout:COMMAND_TIMEOUT}, function(error, stdout, stderr) {
			                if (stderr && !error) {
				                error = stderr; // is this ok or will something explode?
				            }
							if (error) {
				                console.log("encountered error while resizing: " + PUBLIC_IMG_DIR + fullName);
								console.log(error);
								next(error);
				            } else {
								report.image.thumb = thumbName;
								next();
				            }
			            });
					}
				}, function(err, results) {
		    		var results = {};
		    		if(err) { next( err ); } else {
						next();
					}					
		        });
			}
		}
	}, function(err, results) {
		if ( err ) { next( err ); } else {
			req.db.collection( 'reports', function( err, collection ) {
				if ( err ) { return next( err ); }
				// take our composed report and insert it in the db, redirecting to the success view when done
				collection.insert( report, { safe: true }, function( err, items ) {
					if ( err ) { return next( err ); }
					res.redirect('/#success', 302);
				});
			});
		}
	});	
	
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

	
};