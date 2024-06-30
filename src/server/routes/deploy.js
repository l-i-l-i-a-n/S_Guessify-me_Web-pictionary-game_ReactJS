const express = require('express');
var router = express.Router();
const { exec } = require("child_process");

router.post('/trigger', function(req, res){
    exec("sh deploy.sh", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
  console.log(req.body.object_kind);
  res.send("OK")
});


module.exports = router;