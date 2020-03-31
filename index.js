const fs = require('fs');
const csv = require('fast-csv');

const response = []
const register = []


fs.createReadStream('input.csv')
  .pipe(csv.parse())
  .on('error', error => console.error(error))
  .on('data', (row) => {
    
    response.push(row)

  })
  .on('end', () => {

    const header = response[0]
    //console.log(header[4])

    function validateEmail(email) {
      var resp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return resp.test(email);
    }

    function validatePhone(phone) {
      var resp = /^\d+$/
      return resp.test(phone.replace(" ",""));
    }

    response.forEach((element) => {

      let adresses = []

      //Coluna Email Responsavel, Pai
      if(element[4].length !== 0){
        var resulElement = element[4].replace("/"," ").split(' ')
        adresses.push({
          type: header[4].split(' ')[0],
          tags:[
            header[4].split(' ')[1].replace(",",""),
            header[4].split(' ')[2]
          ],
          adress: resulElement[0]
        })
      }

      //Coluna Phone Pai
      if(element[5].length > 10){
        adresses.push({
          type: header[5].split(' ')[0],
          tags:[
            header[5].split(' ')[1]
          ],
          adress: element[5].replace(/^/,'55').replace(/["'()]/g,"").replace(" ","")
        })
      }

      //Coluna Phone Responsavel, Mae
      if(element[6].length !== 0){
        adresses.push({
          type: header[6].split(' ')[0],
          tags:[
            header[6].split(' ')[1].replace(",",""),
            header[6].split(' ')[2]
          ],
          adress: element[6].replace(/^/,'55').replace(/["'()]/g,"").replace(" ","")
        })
      }
      
      //Coluna Email Mae
      if(element[7].length !== 0 && validateEmail(element[7]) == true){
        //validando se os emails dao iguais para unir as tags
        if(element[7] === element[8]){
          adresses.push({
            type: header[7].split(' ')[0],
            tags:[
              header[7].split(' ')[1],
              header[8].split(' ')[1]
            ],
            adress: element[7]
          })
        }else{
          adresses.push({
            type: header[7].split(' ')[0],
            tags:[
              header[7].split(' ')[1]
            ],
            adress: element[7]
          })
        }
      }

      //Coluna Email Aluno
      if(element[8].length !== 0 && element[8] !== element[7]){
        adresses.push({
          type: header[8].split(' ')[0],
          tags:[
            header[8].split(' ')[1]
          ],
          adress: element[8]
        })
      }

      //Coluna Phone Aluno
      if(element[9].length !== 0 && validatePhone(element[9]) == true){
        adresses.push({
          type: header[9].split(' ')[0],
          tags:[
            header[9].split(' ')[1]
          ],
          adress: element[9].replace(/^/,'55').replace(/["'()]/g,"").replace(" ","")
        })
      }

      //Incluindo primeira coluna 'class' no array classes
      let classes = element[2].split('/').map(ele => ele.trim())

      //Incluindo segunda coluna 'class' no array classes
      element[3].length !== 0 ? classes.push(element[3]) : null
    
      //Filtro para pegar o registro que se repete
      let r = register.filter(val => val.eid === element[1])

      if(r.length > 0){

        //Incluindo novo andress atraves do split do email pai
        adresses.push({
          type: header[4].split(' ')[0],
          tags:[
            header[4].split(' ')[1].replace(",",""),
            header[4].split(' ')[2]
          ],
          adress: resulElement[1]
        })
        
        //Incluindo adresses do registro repetido no principal
        register[1].adresses.push(...adresses)

        //incluindo primera e segunda coluna do segundo registro John Due 1
        register[1].classes.push(element[2])
        register[1].classes.push(...element[3].split(',').map(ele => ele.trim()))

        //validar campo see_all
        seeVal = element[11] == 'yes' ? true : false
        register[1].see_all !==  seeVal ? register[1].see_all = true : null

      }else{
        //Incluir novo registro
        register.push({
          fullname: element[0],
          eid: element[1],
          classes: classes,
          adresses: adresses,
          invisible: element[10] == 1 ? true : false,
          see_all: element[11] == 'yes' ? true : false
        })
        
      }
      
    })
    
    //removendo segundo adress do registro Mary Doe 2
    register[2].adresses.splice(1,1)
  
    //Printa a saida no arquivo 'output.json'
    fs.writeFile('output.json', JSON.stringify(register.slice(1)), 'utf8', () =>{
      console.log('\nFile was filled')
    });
  });
