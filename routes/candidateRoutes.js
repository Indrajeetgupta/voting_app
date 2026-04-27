const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const Candidate = require('./../models/candidate');


const checkAdminRole = async (userID) => {
    try{
        const user = await User.findById(userID);
         if(user.role === 'admin');
         return true;
    }catch(err){
        return false;
    }
}
  router.post('/', jwtAuthMiddleware ,async (req, res) => {
  try {

    if(! await checkAdminRole(req.user.id))
        return res.status(403).json({message: 'user does not admin role'});
    const data = req.body;

    const newCandidate = new Candidate(data);

    const response = await newCandidate.save();
    console.log('data saved');

    res.status(200).json({response: response});
} catch (err) {
    console.log(err);
    res.status(500).json({error: 'internal server error'})
}
})

router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try{
     if(! await checkAdminRole(req.user.id))
       return res.status(403).json({message: 'user does not admin role'});


   const candidateId = req.params.candidateId;
    const updateCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(candidateId, updateCandidateData, {
      new: true,
      runValidators: true,
    })

    if(!response){
      res.status(404).json({error: 'candidate not found'})
    }

    console.log('data updated');
    res.status(200).json(response);

  }catch(err) {
     console.log(err)
    res.status(500).json({error: 'Internal Server Error'});

  }
})


router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try{
     if(! await checkAdminRole(req.user.id))
       return res.status(403).json({message: 'user does not admin role'});


   const candidateId = req.params.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId)
    if(!response){
      res.status(404).json({error: 'candidate not found'})
    }

    console.log('candidate deleted');
    res.status(200).json(response);

  }catch(err) {
     console.log(err)
    res.status(500).json({error: 'Internal Server Error'});

  }
}) 

router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
  //admin can not vote
  //user can only vote once

  candidateId = req.params.candidateId;
  userId = req.user.id;

  try{
    const candidate = await Candidate.findById(candidateId);
    if(!candidate){
      return res.status(404).json({ message: 'Candidate not found'});
    }
    const user = await User.findById(userId);
    if(!user){
       return res.status(404).json({ message: 'user not found'});
    }

    if(user.isVoted){
      return res.status(403).json({ message: 'you have aleready voted'});
    }

    if(user.role == 'admin'){
      return res.status(404).json({ message: 'admin is not allowed'});
    }

    candidate.votes.push({user: userId})
    candidate.voteCount++;
    await candidate.save();

    //update the user document
    user.isVoted = true
    await user.save()

    res.status(200).json({message: 'vote recorded successfully'})

  }catch(err){
     console.log(err)
    res.status(500).json({error: 'Internal Server Error'});

  }
});


// vote count
router.get('/vote/count', async (req, res) => {
  try{
    const candidate = await Candidate.find().sort({voteCount: 'desc'});


     const voteRecord = candidate.map((data)=>{
      return {
        party: data.party,
        count: data.voteCount
      }
    });

    return res.status(200).json(voteRecord)
  }catch(err){
    console.log(err)
    res.status(500).json({error: 'Internal Server Error'});
   
  }
})
module.exports = router;
