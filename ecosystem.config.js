module.exports = {
  "apps": [{
      "name": "guessify.me",
      "instances": 1,
      "script": "src/server/index.js",
      "args": [],
      "watch": false,
      "node_args": "",
      "merge_logs": true,
      "log_date_format" : "YYYY-MM-DD HH:mm Z",
      "env": {
          "NODE_ENV": "production",
          "MONGO_URL": "mongodb://guessify:pAI5v2#NQk#W@localhost/guessify"
      } 
  }]
}
