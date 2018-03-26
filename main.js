const readline = require('readline');

//Podria hacer lo mismo con model, crearme una por cada metodo del quiz para no
//tener que hacer por ej model.add  todas las veces
const{log,biglog,errorlog,colorize}=require('./outformat');

const cmds = require('./commands');

const net = require("net");

let numconex=0;

net.createServer(socket => {

    numconex++;
    console.log("Se ha conectado un cliente desde " +socket.remoteAddress+ `Número de conexiones abiertas: ${colorize(numconex,"cyan")}`);
    biglog(socket,'CORE Quiz','green');


    const rl = readline.createInterface({
        input: socket,
        output: socket,
        prompt: colorize("quiz > ","blue"),
        completer:(line) => {
            const completions = 'h help q quit add list show test p play delete edit credits'.split(' ');
            const hits = completions.filter((c) => c.startsWith(line));
            // show all completions if none found
            return [hits.length ? hits : completions, line];
        }
    });


    socket
        .on("end", () => {
            rl.close();
            numconex--;
            console.log(`Se ha desconectado un cliente. Conexiones abiertas: ${colorize(numconex,"cyan")}`);
        })
        .on("error", () => {
            rl.close()
        });


    rl.prompt();

    rl.on('line', (line) => {

        let args= line.split(" ");
        let cmd= args[0].toLowerCase().trim();
        let id=args[1];

        switch (cmd) {

            case '':
                rl.prompt();
                break;
            case 'h':
            case 'help':
                cmds.help_quiz(socket,rl);
                break;

            case 'q':
            case 'quit':
                cmds.quit_quiz(socket,rl);
                break;

            case 'add':
                cmds.add_quiz(socket,rl);
                break;

            case 'list':
                cmds.list_quiz(socket,rl);
                break;

            case 'show':
                cmds.show_quiz(socket,rl,id);
                break;

            case 'test':
                cmds.test_quiz(socket,rl,id);
                break;

            case 'p':
            case 'play':
                cmds.play_quiz(socket,rl);
                break;

            case 'delete':
                cmds.delete_quiz(socket,rl,id);
                break;

            case 'edit':
                cmds.edit_quiz(socket,rl,id);
                break;

            case 'credits':
                cmds.credits_quiz(socket,rl);
                break;

            /*Lo utilizo para aprender cosas de JS que NPI*/
            case 'prueba':
                console.log(array[1]);
                rl.prompt();
                break;

            default:
                log(socket,`Comando desconocido:'${colorize(cmd,"red")}'`);
                log(socket,`Use ${colorize("help","green")} para ver todos los comandos disponibles.`);
                rl.prompt();
                break;
        }

    }).on('close', () => {
        log(socket,'Hasta pronto!');
        //process.exit(0);
    });


}).listen(3030);


















