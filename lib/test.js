/**
 * Created by USER on 26.11.13.
 */
var Language = require('../lib/language'),
    LangWorker = require('../lib/langWorker');

var post = new Language();


post.createConnection('mongodb://dir3aux:dominion@54.201.114.178/everpretty');


post.setLanguage('en');
post.setLanguage('de');


//post.getModelByName('en');

var langWork = new LangWorker(post);



////TODO testele la langWorker au fost cu succes
////De mai testat o data languade daca tot e ok
//var valuesObj = {
//   en: 'En test',
//   de: 'de Test'
//
//}
////
////
//langWork.addText('forDelete1',valuesObj);
//




//var upvaluesObj = {
//    en: 'en implement Update',
//    de: 'de implement Update'
//}
//
//langWork.updateText('implementTest',upvaluesObj,function(err,response){
//
//    console.log(response);
//
//});


langWork.updateSpecificText('de','implementTest','Only de Updating',function(err, response){
console.log(response);

});

//langWork.deleteText('forDelete',function(err,response){
//   console.log(response);
//});



//langWork.deleteText('test');











