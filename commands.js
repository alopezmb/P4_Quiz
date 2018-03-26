const Sequelize = require('sequelize');
const{log,biglog,errorlog,colorize}=require('./outformat');
const {models}=require('./model');

const help_quiz=(socket,rl)=>{
    log(socket,'Comandos:');
    log(socket,'---------');
    log(socket,'    h|help - Muestra esta ayuda.');
    log(socket,'    list - Listar los quizzes existentes.');
    log(socket,'    show <id> - Muestra la pregunta y la respuesta el quiz indicado.');
    log(socket,'    add - Añadir un nuevo quiz interactivamente.');
    log(socket,'    delete <id> - Borrar el quiz indicado.');
    log(socket,'    edit <id> - Editar el quiz indicado.');
    log(socket,'    test <id> - Probar el quiz indicado.');
    log(socket,'    p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
    log(socket,'    credits - Créditos.');
    log(socket,'    q|quit - Salir del programa.');
    rl.prompt();
};

const makeQuestion = (rl, text,color) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text,color), answer => {
            resolve(answer.trim());
        });
    });
};


const add_quiz = (socket,rl) => {
    makeQuestion(rl, ' Introduzca una pregunta: ',"cyan")
        .then(q => {
            return makeQuestion(rl, ' Introduzca la respuesta ',"yellow")
                .then(a => {
                    return {question: q, answer: a};
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(socket,` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog(socket,'El quiz es erróneo :');
            error.errors.forEach(({message}) => errorlog(message));

        })
        .catch(error => {
            errorlog(socket,error.message);
        }).then(() => {
        rl.prompt();
    });
};



const list_quiz=(socket,rl)=>{

    models.quiz.findAll()
        .each(pregunta => {
            log(socket,` [${colorize(pregunta.id, 'magenta')}]: ${pregunta.question}`);
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

const show_quiz = (socket,rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            log(socket,` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            errorlog(socket,error.message);
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


const test_quiz = (socket,rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }
            return makeQuestion(rl, quiz.question + " ", "magenta")
                .then(a => {
                    if (quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()) {
                        log(socket,"CORRECTO", "green");
                    } else {
                        log(socket,"INCORRECTO", "red")
                    }
                });
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();
        });

};

const play_quiz = (socket,rl) => {

    //Preparando variables globales al metodo entero
    let score = 0;
    let remainingarr=[];


    //Funcion promesa llamada de forma recursiva
    const playRandomQ = (remaining) => {

            let index = Math.round(Math.random() * remaining.length);

            while (index < 0 || index >= remaining.length) {             // intento generar un indice válido
                index = Math.round(Math.random() * remaining.length);

            }
            idq = remaining[index];

            validateId(idq)  // para poner un then necesito una promesa a la que ponerle el then
                .then(idq => models.quiz.findById(idq))
                .then(quiz => {
                    if (!quiz) {
                        throw new Error("PROBLEMAS");
                    }
                    return makeQuestion(rl, quiz.question + " ", "magenta")
                        .then(a => {
                            if (quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()) {
                                score++;
                                remaining.splice(index, 1);
                                log(socket,`${colorize("CORRECTO.", "green")} Llevas ` + score + ` aciertos`);


                                if (remaining.length === 0) {
                                    log(socket,`${colorize("ENHORABUENA! HAS GANADO!!", "green")} Aciertos totales :${colorize(score, "magenta")}`);


                                }
                                else {
                                       playRandomQ(remaining);


                                }


                            } else {
                                log(socket,`${colorize("INCORRECTO, ","red")}.Fin del juego. Aciertos:`+score);;

                            }
                        })
                        .catch(error => {
                            errorlog(socket,error.message);
                        })
                        .then(() => {
                            rl.prompt();
                        });
                });


        };




    //Una vez generado mi metodo auxiliar para recursividad, lo llamo y enlazo con promesas

    models.quiz.findAll().then(quizarray => {
        for (i = 0; i < quizarray.length; i++) {
            remainingarr[i] = quizarray[i].id;

        }
        playRandomQ(remainingarr);



    });

};






const delete_quiz = (socket,rl, id) => {
    validateId(id)
        .then(id => models.quiz.destroy({where: {id} }))
        .catch(error => {
            errorlog(socket,error.message);
        }).then(() => {
        rl.prompt();
    });
};



const edit_quiz = (socket,rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id = ${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {
                rl.write(quiz.question)
            }, 0);
            return makeQuestion(rl, 'Introduzca la pregunta: ',"cyan")
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {
                        rl.write(quiz.answer)
                    }, 0);
                    return makeQuestion(rl, 'Introduzca la respuesta: ',"yellow")
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
            log(socket,` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=> ', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog(socket,'El quiz es erróneo :');
            error.errors.forEach(({message}) => errorlog(message));

        })
        .catch(error => {
            errorlog(error.message);
        }).then(() => {
        rl.prompt();
    });
};

const credits_quiz=rl=>{
    log(socket,'Autor de la práctica:');
    log(socket,'Alejandro López Martínez','green');
    rl.prompt();
};

const quit_quiz= (socket,rl)=>{
    rl.close();
    socket.end();
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