const Sequelize = require('sequelize');
const{log,biglog,errorlog,colorize}=require('./outformat');
const {models}=require('./model');

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

const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};


const add_quiz = rl => {
    makeQuestion(rl, ' Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, ' Introduzca la respuesta ')
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(` ${colorize('Se ha añadido', ' magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erróneo :');
            error.errors.forEach(({message}) => errorlog(message));

        })
        .catch(error => {
            errorlog(error.message);
        }).then(() => {
        rl.prompt();
    });
};



const list_quiz=rl=>{

    models.quiz.findAll()
        .each(quiz => {
            log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
        })
        .catch(error => {
            errorloh(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

const show_quiz = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

const validateId = id => {
    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined") {
            reject(new Error(`Falta el parámetro <id>.`));
        } else {
            id = parseInt(id); // coger parte entera y descartar lo demás
            if (Number.isNaN(id)) {
                reject(new Error(`El valor del parámetro <id> no es válido`));

            } else {
                resolve(id);
            }
        }
    });
};




const test_quiz =(rl,id) =>{
    /*
   //validar id, si es correcto, acceder a la BD extraer el quiz con ese id y preguntar
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

    */
};

const play_quiz=rl => {
/*
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

*/

};


const delete_quiz = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.destroy({where: {id} }))
        .catch(error => {
            errorlog(error.message);
        }).then(() => {
        rl.prompt();
    });
};


const edit_quiz = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {
                rl.write(quiz.question)
            }, 0);
            return makeQuestion(rl, 'Introduzca la pregunta: ')
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {
                        rl.write(quiz.answer)
                    }, 0);
                    return makeQuestion(rl, 'Introduzca la respuesta: ')
                        .then(a => {
                            quiz.question = q;
                            quiz.answer = a;
                            return quiz;
                        });
                });
        })
        .then(quiz => {
            return quiz.save();
        })
        .then(quiz => {
            log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=> ', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erróneo :');
            error.errors.forEach(({message}) => errorlog(message));

        })
        .catch(error => {
            errorlog(error.message);
        }).then(() => {
        rl.prompt();
    });
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