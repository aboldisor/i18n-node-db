/**
 * @author      Created by Boldisor Andrian <aboldisor@gmail.com> on 2013-11-26.
 * @link        https://github.com/aboldisor
 * @license     http://opensource.org/licenses/MIT
 *
 * @version     0.0.1
 */

var Language = require('../lib/language'),
    util     = require('util');




function LangWorker (model){
  this.model = model;

 this.loadedSchemas =  model.getLoadedModels();

}


LangWorker.prototype.addText= function(key, values,callback){




   var models = new Array();
    if(Object.keys(values).length != this.loadedSchemas.length){
       throw new Error('Must bee set all translation');
   }

  for (var i =0 ; i < this.loadedSchemas.length; i++){
      if(!(values.hasOwnProperty(this.loadedSchemas[i]))){
         var errMgs =  util.format('There is no set language translation like ', Object.keys(values)[i]);
          models.length = 0;
          throw new Error(errMgs);
      }
           var doc = this.model.getModelByName(this.loadedSchemas[i]);
               models[i] = new doc();
               models[i].key =key;
               models[i].value =values[this.loadedSchemas[i]];

  }

    models.forEach(function(model){
        model.save(function(err,result){

            if (callback !== undefined){
                callback(err,result);
            }


        });
    })

}

//TODO face  update la textul care a fost inserat deja strege din toate 3 scheme
// Ca obiect trebue sa primeasca eara un obiect cu toate variantele de traducere
 //plus keia lui

LangWorker.prototype.updateText = function (key, values, callback) {


    if (Object.keys(values).length != this.loadedSchemas.length) {

        callback('Based insert the object with all variations of translation', null);
        return;
    }
    for (var i = 0; i < this.loadedSchemas.length; i++) {
        if (!(values.hasOwnProperty(this.loadedSchemas[i]))) {
            var errMgs = util.format('There is no set language translation like ', Object.keys(values)[i]);

            if (callback !== undefined){
            callback(errMgs, null);
            }
            return;
        }

        this.model.getModelByName(this.loadedSchemas[i]).update({key: key}, {$set: {value: values[this.loadedSchemas[i]]}}, function (err,result) {
            if (callback !== undefined){
            callback(err,result);
            }
        });

    }


};


LangWorker.prototype.updateSpecificText= function(language ,key, newValues,callback){

     if(this.loadedSchemas.indexOf(language) == -1){
         var errMgs =  util.format("there is no such language like",language );
         if (callback !== undefined){
         callback(errMgs, null);
         }
         return;

     }

    this.model.getModelByName(language).findOneAndUpdate({key:key},{$set: {value :newValues}},'select',function(err, result){
        if (callback !== undefined){
        callback(err, result);
        }
        return;
     });

}



LangWorker.prototype.deleteText= function(key,callback){

    for (var i =0 ; i < this.loadedSchemas.length; i++){

        this.model.getModelByName(this.loadedSchemas[i]).find({key:key}).remove(function(err,response){
            if (callback !== undefined){
                callback(err,response);
            }
        });

    }

}

module.exports = LangWorker;
