const chalk = require('chalk');
const figlet = require('figlet');

const colorize =(msg,color) => {

    if (typeof color!== "undefined"){
        msg=chalk[color].bold(msg);
    }
    return msg;
};

const log =(socket,msg,color) => {
    socket.write(colorize(msg,color)+"\n");
};

const biglog =(socket,msg,color) => {

    log(socket,figlet.textSync(msg, {horizontalLayout: 'full', verticalLayout: 'full'}),color);
};

const errorlog =(socket,errormsg) => {

    socket.write(`${colorize("Error","red")}: ${colorize(colorize(errormsg,"red"),"bgYellowBright")}\n`);
};



exports=module.exports= {
    colorize,
    log,
    biglog,
    errorlog
};

