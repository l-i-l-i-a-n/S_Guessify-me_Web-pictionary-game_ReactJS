
const express = require('express');

if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const app = express();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // Pris
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
if (process.env.NODE_ENV == 'production') {
  const privateKey = fs.readFileSync('/etc/letsencrypt/live/guessify.me/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/guessify.me/cert.pem', 'utf8');
  const ca = fs.readFileSync('/etc/letsencrypt/live/guessify.me/chain.pem', 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca
  };
  var https = require('https').createServer(credentials, app);
} else var https = require('http').createServer(app);

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const argv = require('./util/argv');
const port = require('./util//port');
const websocket = require('./websocket');
const LobbyHandler = require('./Schema/LobbyHandler')
new LobbyHandler(https)

const loginRoute = require('./routes/login.js');
const deployRoute = require('./routes/deploy.js');

console.log(__dirname);


const logger = require('./util//logger');

const launchDataBase = require('./database.js');
// If you need a backend, e.g. an API, add your custom backend-specific middleware here

app.set('trust proxy', 1); // trust first proxy (autorise l'utilisation d'un proxy)
app.use(express.json());
app.use(express.static(`${__dirname}/../../dist`, { dotfiles: 'allow' }));
// In production we need to pass these values in instead of relying on webpack
// Pris


passport.serializeUser((user, done) => {
  user.password = null;

  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new LocalStrategy(
  ((username, password, done) => {
    const User = mongoose.model('User');
    User.findOne({ username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username/password.' });
      }
      user.comparePassword(password, (err, isMatch) => {
        if (err) return done(null, false, { message: err });
        if (!isMatch) return done(null, false, { message: 'Incorrect username/password.' });

        return done(null, user);
      });
    });
  })
));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', loginRoute);
app.use('/deploy', deployRoute);
app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/../../dist/index.html`));
});
// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const prettyHost = customHost || 'localhost';

// Start your app.
https.listen(port, () => {
  logger.appStarted(port, prettyHost);
});
launchDataBase(app);
