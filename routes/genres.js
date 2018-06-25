var express=require('express');
var router=express.Router();
var firebase=require('../firebase');
var db=firebase.FirebaseInstance.database();
var fbref=db.ref();
var fbAuth=firebase.FirebaseInstance.auth();
router.get('*',function(req,res,next){
  if(fbAuth.currentUser==null){
    res.redirect('/users/login');
  }
  next();
});

router.get('/',function(req,res,next){
	var genreRef=fbref.child('genres');

	genreRef.once('value',function(snapshot){
		var genres= [];
		snapshot.forEach(function(childSnapshot){
			var key=childSnapshot.key;
			var childData=childSnapshot.val();
			if(childData.uid == fbAuth.currentUser.uid){
				genres.push({
					id:key,
					name:childData.name
				});
			}
		});
		res.render('genres/index',{genres: genres});
	});
});

/*
router.get('/',function(req,res,next){
	res.render('genres/index');
});
*/

router.get('/add',function(req,res,next){
	res.render('genres/add');
});

router.post('/add',function(req,res,next){
	var genre = {
		name : req.body.name,
		uid: fbAuth.currentUser.uid
	}
	var genreRef = fbref.child('genres');
	genreRef.push().set(genre);
	console.log("Added");
	req.flash('success_msg', 'Genre Saved');
	res.redirect('/genres');
});

router.post('/edit/:id' ,function(req,res,next){
	var id=req.params.id;
	var name=req.body.name;
	var genreRef = fbref.child('/genres/'+id);
	genreRef.update({
		name: name
	});
	res.redirect('/genres')
});


router.delete('/delete/:id' ,function(req,res,next){
	var id=req.params.id;
	console.log(id);
	var genreRef = fbref.child('/genres/'+id);
	genreRef.remove();
	req.flash('success_msg','Genre Deleted');
	res.send(200);
	//res.redirect('/genres')
});


router.get('/edit/:id',function(req,res,next){
	var id=req.params.id;
	var genreRef=fbref.child('/genres/'+id);
	genreRef.once("value",function(snapshot){
		var genre=snapshot.val();
		res.render('genres/edit',{genre: genre,id: id});
	});
});

router.post('/edit/:id',function(){
	var id=req.params.id;
	var name=req.body.name;
	var genreRef=fbref.child('/genres/'+id);
	genreRef.update({
		name: name
	});
	res.redirect('/genres');
});

module.exports=router;
