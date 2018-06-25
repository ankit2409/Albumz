var express=require('express');
var router=express.Router();
var multer=require('multer');
var upload=multer({dest:'./public/images/uploads'});
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
	var albumRef=fbref.child('albums');

	albumRef.once('value',function(snapshot){
		var albums= [];
		snapshot.forEach(function(childSnapshot){
			var key=childSnapshot.key;
			var childData=childSnapshot.val();
			if(childData.uid == fbAuth.currentUser.uid){
				albums.push({
					id: key,
					artist: childData.artist,
					title: childData.title,
					year: childData.year,
					label: childData.label,
					tracks: childData.tracks,
					cover: childData.cover,
					genre: childData.genre,
					info: childData.info
				});
			}
		});
		res.render('albums/index',{albums: albums});
	});
});
/*
router.get('/add',function(req,res,next){
	res.render('albums/add');
});
*/
router.get('/add',function(req,res,next){
	var genreRef = fbref.child('genres');
	genreRef.once('value',function(snapshot){
		var data=[];
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			data.push({
				id: key,
				name: childData.name
			});
		});
		res.render('albums/add',{genres: data});
	});
});

router.post('/add',upload.single('cover'),function(req,res,next){
	//check file upload
	if(req.file){
		console.log('Uploading file...');
		var cover=req.file.filename;
	}else{
		console.log('No File Uploaded...');
		var cover='noimage.jpg';
	}

	//Build an album
	var album={
		artist: req.body.artist,
		title: req.body.title,
		genre: req.body.genre,
		info: req.body.info,
		year: req.body.year,
		label: req.body.label,
		tracks: req.body.tracks,
		cover: cover,
		uid: fbAuth.currentUser.uid
	}
	//create refrence
	var albumRef = fbref.child('albums');

	//push
	console.log('upload done');
	albumRef.push().set(album);
	req.flash('success_msg','Album Saved');
	res.redirect('/albums');

});

router.get('/details/:id',function(req,res){

	var id=req.params.id;
	console.log(id);
	var albumRef=fbref.child('/albums/'+id);

	albumRef.once('value',function(snapshot){
		var album=snapshot.val();
		res.render("albums/details",{album: album,id:id}); 
	});
});


router.delete('/delete/:id' ,function(req,res,next){
	var id=req.params.id;
	console.log(id);
	var albumRef = fbref.child('/albums/'+id);
	albumRef.remove();
	req.flash('success_msg','Album Deleted');
	res.send(200);
	//res.redirect('/genres')
});

router.get('/edit/:id',function(req,res,next){
	var id=req.params.id;
	var albumRef=fbref.child('/albums/'+id);
	var genreRef = fbref.child('genres');
	albumRef.once('value',function(snapshot){
		var genres=[];
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.key;
			var childData = childSnapshot.val();
			genres.push({
				id: key,
				name: childData.name
			});
		});

		//for(var i=0;i<genres.length;i++)
		//console.log(genres[i].id+"   "+genres[i].name);
		albumRef.once("value",function(snapshot){
		var album=snapshot.val();
		//console.log(album.name+"  -- "+album.genre);
		res.render('albums/edit',{album: album, id: id, genres: genres});
	});
	});


	
});

router.post('/edit/:id',upload.single('cover'),function(req,res,next){
	var id=req.params.id;
	//var name=req.baody.name;
	var albumRef=fbref.child('/albums/'+id);
	if(req.file){
		var cover=req.file.filename;

		//upadte album with cover
		albumRef.update({
			artist: req.body.artist,
			title: req.body.title,
			year: req.body.year,
			label: req.body.label,
			tracks: req.body.tracks,
			genre: req.body.genre,
			info: req.body.info,
			cover: cover
		});
	}else{
		albumRef.update({
			artist: req.body.artist,
			title: req.body.title,
			year: req.body.year,
			label: req.body.label,
			tracks: req.body.tracks,
			genre: req.body.genre,
			info: req.body.info
		});
	}
	req.flash('success_msg','Album Successfully updated');
	res.redirect('/albums/details/'+id);
});
module.exports=router;