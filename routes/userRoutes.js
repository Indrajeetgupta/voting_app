const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


// person post
router.post('/signup', async (req, res) => {
  try {
    const data = req.body;

    if(data.role === 'admin') {

      const existingAdmin = await User.findOne({ role: 'admin' });   

       if (existingAdmin) {
        return res.status(403).json({
          message: 'Admin already exists. Only one admin allowed'
        });
      }
    } else {
      // ✅ Force default role
      data.role = 'voter';
    }

    const newUser = new User(data);
    const response = await newUser.save();
    console.log('data saved');
    const payload = {
      id: response.id,
      role: response.role
    }
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is : ", token);

    res.status(200).json({response: response, token: token});
} catch (err) {
    console.log(err);
    res.status(500).json({error: 'internal server error'})
}
})


//login route

router.post('/login', async (req,res) => {
  try{
    const {addharCardNumber, password} = req.body;

    const user = await User.findOne({addharCardNumber: addharCardNumber});

    if( !user || !(await user.comparePassword(password))){
      return res.status(401).json({error: 'Invalid username or password'});
    }

    // generate token

    const payload = {
      id: user.id,
    }

    const token = generateToken(payload);

    res.json({token})

  }catch(err){
    console.error(err);
    res.status(500).json({error: 'internal server error'})
  }
})

//profile route

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try{
    const userData = req.user;

    const userId = userData.id;
    const user = await person.findById(userId);

    res.status(200).json({user});

  }catch(err){
    console.log(err)
    res.status(500).json({error: 'internal server error'});
  }
})


router.put('/profile/password', async (req, res) => {
  try{
    const userId = req.user;
    const{currentPassword, newPassword} = res.body

     const user = await User.findById(userId);


      if(!(await user.comparePassword(currentPassword))){
      return res.status(401).json({error: 'Invalid username or password'});
      }

      user.password = newPassword;
      await user.save();


    console.log('password update');
    res.status(200).json({message: "password update"});

  }catch(err) {
     console.log(err)
    res.status(500).json({error: 'Internal Server Error'});

  }
})



module.exports = router;
