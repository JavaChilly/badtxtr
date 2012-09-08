
/*
 * POST a report of a bad texter
 */

exports.submit = function(req, res){
	console.log(req.files);
	
	req.on('data', function(b) {
		console.log(b);
		console.log("/n");
	});

	res.render('index', { title: 'BadTXTr' })
};