const spawn = require("child_process").spawn;

const pythonProcess = spawn('python', ["gy.py", 'outputImagesDecoded/out.jpeg']);

pythonProcess.stdout.setEncoding('utf8');

async function pythonReturn() {
    pythonProcess.stdout.on('data', (data) => {
        console.log(data);
    });
}

pythonReturn();