var express = require('express');
var router = express.Router();


var path = require('path');

router.get('/', function(req, res, next) {
	if (req.session.imagefiles === undefined){
		res.sendFile(path.join(__dirname, '..','/public/html/index.html'));
	} else {
		res.render('index', {images: req.session.imagefiles} )
	}
});

var multer = require('multer');
var path = require('path');

let storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, 'public/images')
	},
	filename: function(req, file, cb){
		cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1] )
	}
})

let fileFilter = (req, file, callback) => {
	let ext = path.extname(file.originalname);
	if (ext !== '.png' && ext !== '.jpg'){
		return callback(new Error('Only png and jpg files are accepted'))
	} else {
		return callback(null, true)
	}
}

var upload = multer({ storage, fileFilter: fileFilter});

router.post('/upload', upload.array('images'), function (req, res){
	let files = req.files;
	let imgNames = [];
	
	for( i of files){
		let index = Object.keys(i).findIndex( function (e){return e === 'filename'})
		imgNames.push( Object.values(i)[index] )
	}
	req.session.imagefiles = imgNames
		
	res.redirect('/')
})

var path = require('path');
var fs = require('fs');

var PDFDocument = require('pdfkit');

router.post('/pdf', function(req, res, next) {
	let body = req.body
	
	let doc = new PDFDocument({size: 'A4', autoFirstPage: false}); 
	let pdfName = 'pdf-' + Date.now() + '.pdf';
	
	doc.pipe( fs.createWriteStream( path.join(__dirname, '..',`/public/pdf/${pdfName}` ) ) );
	

	for(let name of body){
		doc.addPage()
		doc.image(path.join(__dirname, '..',`/public/images/${name}`),20, 20, {width: 555.28, align: 'center', valign: 'center'} )
	}
	doc.end();
	
	res.send(`/pdf/${pdfName}`)
})
router.get('/new', function(req, res, next) {
	let filenames = req.session.imagefiles;
    
	let deleteFiles = async (paths) => {
		let deleting = paths.map( (file) => unlink(path.join(__dirname, '..', `/public/images/${file}`) ) )
		await Promise.all(deleting)
	}
	deleteFiles(filenames)
	
	req.session.imagefiles = undefined

	res.redirect('/')
})

module.exports = router;
