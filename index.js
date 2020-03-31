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

    function validateEmail(email) {
      var resp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return resp.test(email);
    }

    function validatePhone(phone) {
      var resp = /^\d+$/
      return resp.test(phone.replace(" ",""));
    }

    response.forEach((coluna) => {

      let adresses = []

      //Coluna Email Responsavel, Pai
      if(coluna[4].length !== 0){
        var resulElement = coluna[4].replace("/"," ").split(' ')
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
      if(coluna[5].length > 10){
        adresses.push({
          type: header[5].split(' ')[0],
          tags:[
            header[5].split(' ')[1]
          ],
          adress: coluna[5].replace(/^/,'55').replace(/["'()]/g,"").replace(" ","")
        })
      }

      //Coluna Phone Responsavel, Mae
      if(coluna[6].length !== 0){
        adresses.push({
          type: header[6].split(' ')[0],
          tags:[
            header[6].split(' ')[1].replace(",",""),
            header[6].split(' ')[2]
          ],
          adress: coluna[6].replace(/^/,'55').replace(/["'()]/g,"").replace(" ","")
        })
      }
      
      //Coluna Email Mae
      if(coluna[7].length !== 0 && validateEmail(coluna[7]) == true){
        //validando se os emails dao iguais para unir as tags
        if(coluna[7] === coluna[8]){
          adresses.push({
            type: header[7].split(' ')[0],
            tags:[
              header[7].split(' ')[1],
              header[8].split(' ')[1]
            ],
            adress: coluna[7]
          })
        }else{
          adresses.push({
            type: header[7].split(' ')[0],
            tags:[
              header[7].split(' ')[1]
            ],
            adress: coluna[7]
          })
        }
      }

      //Coluna Email Aluno
      if(coluna[8].length !== 0 && coluna[8] !== coluna[7]){
        adresses.push({
          type: header[8].split(' ')[0],
          tags:[
            header[8].split(' ')[1]
          ],
          adress: coluna[8]
        })
      }

      //Coluna Phone Aluno
      if(coluna[9].length !== 0 && validatePhone(coluna[9]) == true){
        adresses.push({
          type: header[9].split(' ')[0],
          tags:[
            header[9].split(' ')[1]
          ],
          adress: coluna[9].replace(/^/,'55').replace(/["'()]/g,"").replace(" ","")
        })
      }

      //Incluindo primeira coluna 'class' no array classes
      let classes = coluna[2].split('/').map(ele => ele.trim())

      //Incluindo segunda coluna 'class' no array classes
      coluna[3].length !== 0 ? classes.push(coluna[3]) : null
    
      //Filtro para pegar o registro que se repete
      let r = register.filter(val => val.eid === coluna[1])

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
        r[0].adresses.push(...adresses)

        //incluindo primera e segunda coluna do segundo registro
        r[0].classes.push(coluna[2])
        r[0].classes.push(...coluna[3].split(',').map(ele => ele.trim()))

        //validar campo see_all
        seeVal = coluna[11] == 'yes' ? true : false
        r[0].see_all !==  seeVal ? r[0].see_all = true : null

      }else{
        //Incluir novo registro
        register.push({
          fullname: coluna[0],
          eid: coluna[1],
          classes: classes.length == 1 ? classes[0]:classes,
          adresses: adresses,
          invisible: coluna[10] == 1 ? true : false,
          see_all: coluna[11] == 'yes' ? true : false
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
