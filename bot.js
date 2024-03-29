var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
var n;
var d;
bot.on('ready', function (evt) { //boot up and reading in
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    //READ IN RESPONSES
    var count = 0;
    const testFolder = './servers/';
    const fs = require('fs');

    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
            count++;
            var fs2 = require('fs');
            var tempArray = [];
            fs2.readFile('./servers/' + file, 'utf-8', (err, data) => {
                servers.push(file);
                if (err) throw err;
                var cut = 'ERROR';
                cut = data;
                while(cut.indexOf('~') >=0){
                    tempArray.push(cut.substring(0,cut.indexOf('~')));
                    cut = cut.substring(cut.indexOf('~')+1, cut.length);
                }
                responses.push(tempArray);
            })

        });
    })
    //READ IN CENSORS
    fs.readFile('censoredwords.txt', 'utf-8', (err, data) => {
        if (err) throw err;
        var cut = 'ERROR';
        cut = data;
        while(cut.indexOf('~') >=0){
            censorsize++;
            censors.push(cut.substring(0,cut.indexOf('~')));
            cut = cut.substring(cut.indexOf('~')+1, cut.length);
        }
    })
    d = new Date();
    n = d.getTime();
});

var servers = []; //NOTHING RN
var responses = []; //All responses (will be changed with multi-server implementation)
var censors = []; //Whats not allowed
var censorsize = 0;


//ABOVE HERE IS STUFF I DONT TOUCH
bot.on('message', function (user, userID, channelID, message, event) { //message reader
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    var d2 = new Date();
    var n2 = d2.getTime();
    if(n2-n >= 300000){ //Posture Check
      if(Math.floor(Math.random() * (+100 - +0)) + +0 > 90 ){ //10% chance
        bot.sendMessage({
            to: channelID,
            message: 'Posture Check! Last check was ' + ((n2-n)/60000) + ' minute(s) ago.'
        })
        n = n2;
      }
    }


    var fileName = channelID + ".txt";
    if (message.substring(0,2) == 'w!') { //bot commands
        var args = message.substring(2).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            case 'add':
                if(censor(message.substring(6)) == 1){
                    bot.sendMessage({
                        to: channelID,
                        message: 'Message denied (type w!rules for possible reasons)'
                    })
                }else{
                    bot.sendMessage({
                        to: channelID,
                        message: 'Added the message: "' + message.substring(6) + '"'
                    });
                    var loc = serverExists(fileName);
                    if(loc == -1){
                        servers.push(fileName);
                        loc = servers.length-1;
                        var emptyArray = [];
                        responses.push(emptyArray)
                    }
                    responses[loc].push(message.substring(6));
                    const fs = require('fs')
                    fs.appendFile('./servers/' + fileName, message.substring(6) + '~', function (err) {});
                }

            break;
            /*case 'remove':
                bot.sendMessage({
                    to: channelID,
                    message: 'Removed! (not really)'
                });
                const fetched = await message.channelID.fetchMessages({limit: 1});
                message.channel.bulkDelete(fetched)
                    .catch(error => message.reply('Couldnt delete messages because of: ${error}'));
            break;*/
            case 'rules':
                bot.sendMessage({
                    to: channelID,
                    message: 'Limitations when adding messages:\n1. Character limit of 150\n2. No racist terms\n3. Use of the character "~" is not allowed\n4. No self-commands (calling its own commands)'
                });
            break;
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Use "w!" for bot interactions (add, remove, rules), then use "wotbot" to get responses, like this:'
                });
            break;
            case 'devtool':
                var index = serverExists(fileName);
                bot.sendMessage({
                    to: channelID,
                    message: responses[index][1]
                });
            break;
         }
    }else if (message.toLowerCase().indexOf("wotbot") >= 0) { //wotbot
        var index = serverExists(fileName);
        if(index == -1){
            bot.sendMessage({
                to: channelID,
                message: 'No existing responses! Type w!help to get started!'
            });
        }else{
            bot.sendMessage({
                to: channelID,
                message: wotbot(index)
            });
        }
    }

    if(userID.toLowerCase().indexOf("/*REDACTED FOR GITHUB*/") >= 0) { //parz
       if(Math.floor(Math.random() * (+100 - +0)) + +0 > 99 ) //1% chance
       bot.sendMessage({
            to: channelID,
            message: "ok parz"
        });
    }
    if(userID.toLowerCase().indexOf("/*REDACTED FOR GITHUB*/") >= 0) { //ganon
       if(Math.floor(Math.random() * (+100 - +0)) + +0 > 99 )
       bot.sendMessage({
            to: channelID,
            message: "pog"
        });
    }
    if(userID.toLowerCase().indexOf("/*REDACTED FOR GITHUB*/") >= 0) { //crue
       if(Math.floor(Math.random() * (+100 - +0)) + +0 > 99 )
       bot.sendMessage({
            to: channelID,
            message: "peter"
        });
    }
});
function contains(msg){
}
function serverExists(ID){
    for(var i = 0;i<servers.length;i++){
        if(servers[i] == ID){
            return i;
        }
    }
    return -1;
}
function wotbot(svr){
    var num = Math.floor(Math.random() * (+responses[svr].length - +0)) + +0;
    return responses[svr][num];
}
function censor(msg){
    if(msg.length > 150){ //max length
        return 1;
    }
    if(msg.indexOf('~')>=0){ //forbidden character
        return 1;
    }
    for(var i = 0;i<censorsize;i++){
        if(msg.toLowerCase().indexOf(censors[i])>=0){ //censored words
            return 1;
        }
    }
    return 0;
}
