const express = require('express');
const Router = express.Router;
const router = Router();
var rp = require('request-promise');
const User = require('../models/User');
const Project = require('../models/Project');

router.post("/login", async (req, res, next) => {

  const { email , password } = req.body;

  try{    
      const user = await User.findOne({ email });

      if(user && user.password === password){
          res.status(200).json(user);
      }else{ 
          next (new Error('Unauthorized'));            
      }

  }catch(e){
      next(e)
  }
});

router.post("/signup", async (req, res, next) => {

  let options = {rejectUnauthorized: false,
      uri: "",
      method: 'GET',
      auth: {'user': '',
      'pass': ''}
  };

  const { email , password, url } = req.body;

  try{    
      const user = await User.findOne({ email });

      if(user && user.password === password){
          next(new Error('User already exists'));
      }else{ 
          options.auth = {'user': email, 'pass': password}
          options.uri = url;

          const result = await rp(options);

          const new_user = new User({
              email: email,
              password: password
          });

          const doc = await new_user.save();
          res.status(200).send(doc);
      }

  }catch(e){
      next(e);
  }
});

router.post("/getProjects", async (req, res, next) =>  {

  const { email , password} = req.body;

  try{    
      const user = await User.findOne({ email });

      if(user && user.password === password){

          const project_doc = await Project.find({user_id: user._id});

          res.status(200).send(project_doc);

      }else{
          next (new Error('Unauthorized'));
      }
  }catch(e){
      next(e);
  }
});

module.exports = router;

