const fs = require('fs');
var dictionnaire = new Map();
fs.readdir(__dirname + '/../Dictionnaires/', function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
        fs.readFile(__dirname + '/../Dictionnaires/' + file, 'utf8', function (err, data) {
            if (err) throw err;
            const lang = file.replace(".txt", "");
            const dictLang = data.toString().split("\n").map((value)=>value.trim());
            dictionnaire.set(lang, dictLang)
            console.log(`${lang} loaded with ${dictLang.length} words!`)
        });
    });
});



const tirerMots = (lang) => {
    const dictLang = dictionnaire.get(lang)
    var random = Math.floor(Math.random() * dictLang.length)
    return dictLang[random].toLowerCase();
}

const underscoreWordToBeDrawn = (word) => {
    if ((typeof word) !== 'string') return "";
    let underscored_word = "";
    let currLetter = "";
    for (let i = 0; i < word.length; i++) {
        currLetter = word.charAt(i);
        currLetter === "-" || currLetter === " " ? underscored_word += currLetter + "\xa0" : underscored_word += "_\xa0"; // \xa0 stands for a no-break space
    }
    return underscored_word;
}

module.exports = {
    tirerMots,
    underscoreWordToBeDrawn
};