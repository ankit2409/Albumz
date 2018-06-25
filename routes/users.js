var express=require('express');
var router=express.Router();
var fb=require('firebase');
var firebase=require('../firebase');
var db=firebase.FirebaseInstance.database();
var fbref=db.ref();
var admin=firebase.admin;
var fbAuth=firebase.FirebaseInstance.auth();
var flash=require('connect-flash');


router.get('/register',function(req,res,next){
	res.render('users/register');
});

router.get('/login',function(req,res,next){
	res.render('users/login');
});
router.post('/register',function(req,res,next){
	var first_name= req.body.first_name;
	var last_name= req.body.last_name;
	var email=req.body.email;
	var password=req.body.password;
	var password2=req.body.password2;  
	var location= req.body.location;
	var fav_artist=req.body.fav_artist;
	var fav_genre=req.body.fav_genre;

	// validation
	req.checkBody('first_name','First name is Required').notEmpty();
	req.checkBody('email','Email is Required').notEmpty();
	req.checkBody('email','Email not valid').isEmail();
	req.checkBody('password','Password is Required').notEmpty();
	req.checkBody('password2','Passwords do not match').equals(req.body.password);

	var errors=req.validationErrors();
/*	if(first_name==''||last_name==''||email==''||Password==''||password2=='')
		req.flash('error_msg','Empty field');
	if(password2!=Password)
		req.flash('error_msg','Password do not match');*/
	if(errors){
		//console.log(errors);
		res.render('users/register',{errors: errors});
		//req.flash('error_msg','error');
	}else{
		//console.log(user);
	  fbAuth.createUserWithEmailAndPassword(email, password).then(function(user) {
        var userRef=fbref.child('users');
        uid=fbAuth.currentUser.uid;
        //console.log(user);
        //console.log(uid);
        var newUser={
					uid: uid,
					first_name: first_name,
					last_name: last_name,
					email: email,
					location: location,
					fav_genre: fav_genre,
					fav_artist: fav_artist
				}
				userRef.push().set(newUser);
				req.flash('success_msg','You are now registered and can login');
				res.redirect('/albums');
			}).catch(function(error){
				if(error){
					//console.log(error.message);
					req.flash('error_msg','error.message');
					res.redirect('users/register');
				}
			});
	}
});
router.post('/login',function(req,res,next){
	var email=req.body.email;
	var password=req.body.password;
	//validation
	req.checkBody('email','Email is Required').notEmpty();
	req.checkBody('password','Password is Required').notEmpty();

	var errors=req.validationErrors();
	if(errors){
		//req.flash('error_msg',errors);
		console.log(errors.params);
		res.render('users/login',{errors: errors});
		req.flash('error_msg',errors);
	}else{  
			fbAuth.setPersistence(fb.auth.Auth.Persistence.NONE)
		.then(function(){
			return fbAuth.signInWithEmailAndPassword(email, password)
			.then(function(firebaseUser){
				var uid = fbAuth.currentUser,uid;
				console.log("Authenticated user with uid:", uid);
				req.flash('success_msg','You are now logged in');
				//req.flash('success_msg', 'You are now logged in');
				res.redirect('/albums');
			})
			.catch(function(error){
				req.flash('error_msg', 'Login Failed');
				console.log('Login Failed: ', error.message);
				res.redirect('/users/login');
			});
		})
		.catch(function(error){
			//Handle Errors Here
			var errorCode = error.code;
			var errorMessage = error.message;
			res.flash('error_msg',error.message);
			console.log(errorMessage);
		});
			      // ...
			     // No user is signed in.
  				
}
 });


router.get('/logout',function(req,res){
	fbAuth.signOut();
req.flash('success_msg','You have successfully logged out');
  res.redirect('/users/login');
	/*then(function() {
  req.flash('success_msg','You have successfully logged out');
  res.redirect('/users/login');
}).catch(function(error) {
  // An error happened.
  console.log('logout problem');
  console.log(error.message);
  req.flash('error_msg','err.message');
  res.redirect('/users/login');
});*/
});
module.exports=router;