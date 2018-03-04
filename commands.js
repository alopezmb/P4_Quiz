
const{log,biglog,errorlog,colorize}=require('./outformat');
const model=require('./model');

const help_quiz=rl=>{
    log('Comandos:');
    log('---------');
    log('    h|help - Muestra esta ayuda.');
    log('    list - Listar los quizzes existentes.');
    log('    show <id> - Muestra la pregunta y la respuesta el quiz indicado.');
    log('    add - Añadir un nuevo quiz interactivamente.');
    log('    delete <id> - Borrar el quiz indicado.');
    log('    edit <id> - Editar el quiz indicado.');
    log('    test <id> - Probar el quiz indicado.');
    log('    p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
    log('    credits - Créditos.');
    log('    q|quit - Salir del programa.');
    rl.prompt();
};

const add_quiz=rl=>{
    rl.question(colorize(' Introduzca una pregunta: ','red'),question=> {

        rl.question(colorize(' Introduzca una respuesta: ', 'red'), answer => {

            model.add(question,answer);
            log(`${colorize('Se ha añadido ','magenta')}:  ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
        });
    });
};

const list_quiz=rl=>{

    model.getAll().forEach((quiz,index)=>{
       log(`[${colorize(index,'magenta')}]: ${quiz.question}`);
    });

    rl.prompt();
};

const show_quiz=(rl,id)=>{
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else {
        try{
            const quiz= model.getByIndex(id);
            log(`[${colorize(id,'magenta')}]:  ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();
};

const test_quiz =(rl,id) =>{
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try{
            const quiz=model.getByIndex(id);
            rl.question(colorize(quiz.question +' ','magenta'),answer=> {
                if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                    log("CORRECTO","green");

                } else {
                    log('INCORRECTO', 'red');
                }
                rl.prompt();
            });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};

const play_quiz=rl => {

    //inicializo puntuaciones y array con ids
    let score = 0;
    let unResolved = [];
    let quizzes = model.getAll();
    if(quizzes.length>=1) {
        for (i = 0; i < quizzes.length; i++) {
            unResolved[i] = i;
        }
    }

    const playRandomQ =() => {
        let id = Math.round(Math.random() * quizzes.length);
        while (unResolved.indexOf(id) === -1) {
            id = Math.round(Math.random() * quizzes.length);

        }
        let quiz = model.getByIndex(id);

        rl.question(colorize(quiz.question + ' ', 'magenta'), answer => {
            if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                unResolved.splice(unResolved.indexOf(id), 1);
                score++;
                log(`${colorize("CORRECTO.","green")} Llevas ` +score+ ` aciertos`);
                if (unResolved.length === 0) {
                    log("Acertaste todas las preguntas, enhorabuena!");
                    log(`${colorize("Aciertos:", "green")} ${colorize(score, "magenta")}`);
                    rl.prompt();
                } else {
                    playRandomQ();
                }
            } else {
                log('INCORRECTO', 'red');
                log("Has perdido. Fin del juego.");
                log("Aciertos: " + score);
                rl.prompt();
            }
        });
    };

    if (Array.isArray(unResolved) && unResolved.length) {
        playRandomQ();
    } else{
        log("Ups, parece que no hay ninguna pregunta guardada!");
        log(`Incluye nuevas preguntas mediante el comando ${colorize("add", "cyan")} para poder empezar a jugar`);
        rl.prompt();
    }


};



const delete_quiz=(rl,id)=>{
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else {
        try{
            model.deleteByIndex(id);
            log(`${colorize('Se ha borrado correctamente la pregunta en la posición','green')}: [${colorize(id,'magenta')}]`);
        }catch(error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};


const edit_quiz = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {
            const quiz= model.getByIndex(id);

            process.stdout.isTTY && setTimeout( () => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout( () => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca una respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(`Se ha cambiado el quizz [${colorize(id, 'magenta')}] por :  ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

const credits_quiz=rl=>{
    log('Autor de la práctica:');
    log('Alejandro López Martínez','green');
    rl.prompt();
};

const quit_quiz= rl=>{
    rl.close();
};

exports=module.exports= {
    help_quiz,
    add_quiz,
    list_quiz,
    show_quiz,
    test_quiz,
    play_quiz,
    delete_quiz,
    edit_quiz,
    credits_quiz,
    quit_quiz
};