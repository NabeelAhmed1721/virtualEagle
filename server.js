//Libraries
const express = require('express');
var favicon = require('serve-favicon');
const https = require('https');
const detect = require('detect-file-type');
var exec = require('child_process').exec;
var shelljs = require('shelljs');
var fs = require('fs');
var request = require('request');

//App Constants
const PORT = 7019;
const pythonClassifierPath = '/home/simon/workspace/other/hack-phs/gy.py';

//Server Init
const app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
// app.set('view engine', 'pug'); // view engine set // Sorry nabeel, I won't be using pug for simplicity reasons
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

var requestCount = 0;
shelljs.rm('-r', 'upload/');
shelljs.mkdir('upload/');

//Routes

app.use('/', express.static(__dirname + '/public')); // static public folder



function isSupported(id, callback){
    detect.fromFile('upload/'+id, function(err, result) {
        if (err || !result || result.ext !== 'jpg') {
            callback(false);
        }
        callback(true);
    });
}

function getPrediction(id, callback){
    exec('python3 '+pythonClassifierPath+' upload/'+id, function(error, stdout, stderr){
        if(error || stderr){
            console.log('Python error: '+error);
            console.log('Python stderr: '+stderr);
            process.exit();
        }
        callback(stdout);
    });
}

app.post('/getPrediction', function(req, res){
    if(!req.body.base64Image){
        res.send('No image provided');
        return;
    }
    var base64Data = req.body.base64Image.replace(/^data:image\/jpeg;base64,/, "").replace(/^data:image\/jpg;base64,/, "");
    var requestNumber = requestCount++;
    fs.writeFile("upload/"+requestNumber, base64Data, 'base64', function(err) {
        if(err){
            res.send("Error writing file: "+err);
            console.log("Error writing file: "+err);
            return;
        }
        isSupported(requestNumber, function(isIt){
            if(!isIt){
                res.send('File format not jpeg or jpg');
                return;
            }
            getPrediction(requestNumber, function(contents){
                res.send(contents);
            });
        });
        return;
    });
});

app.get('/command', function(req, res) {
    if (!req.query.action) {
        res.json({
            success: false,
            error: 'No action specified'
        });
        return;
    }
    // Somehow get that command to the raspberry pi...
    
    request(req.query.action === 'right' ? 'http://ec2-3-234-16-131.compute-1.amazonaws.com:8090/right' : 'http://ec2-3-234-16-131.compute-1.amazonaws.com:8090/left', function(err, response, body){
        if(err){
            console.log('Error while requesting command: '+err);
        }
        
    });
    
    res.json({
        success: true
    });
});



/// SSL Support

const privateKey = fs.readFileSync('certificates/privkey.pem', 'utf8'); // Thanks simon :)
const certificate = fs.readFileSync('certificates/cert.pem', 'utf8');
const ca = fs.readFileSync('certificates/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app).listen(PORT, null, null, () => console.log(`App listening on ${PORT}!`));
