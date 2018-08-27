const express = require('express');
const Router = express.Router;
const router = Router();
var rp = require('request-promise');
const User = require('../models/User');
const Project = require('../models/Project');
const Epic = require('../models/Epic');

router.post("/deleteEpics", async (req, res, next) =>  {

    const { email , password, project } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const project_doc = await Project.findOne({user_id: user._id, project_key: project});

            const deleted_docs = await Epic.deleteMany({project_id: project_doc._id});

            res.status(200).send({message: "success"});
        }else{
            next (new Error('unauthorized'));
        }
    }catch(e){
        next(e)
    }

});

router.post("/setEpics", async (req, res, next) =>  {

    let options = {rejectUnauthorized: false,
        uri: "",
        method: 'GET',
        auth: {'user': '',
        'pass': ''}
    };

    const { email , password, project } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            options.auth = {'user': email, 'pass': password}
            options.uri = findProject.project_url+"/rest/api/2/search?jql=project%3D%22"+project+"%22%20AND%20issuetype%3D%22Epic%22&"+"fields=*all";
                
            let result = await rp(options);
    
            result = JSON.parse(result);
            result = result["issues"];
    
            let epics = [];
    
            for(let i=0; i<result.length; i++){
                let newEpic = new Epic({
                    project_id: findProject._id,
                    epic_key: result[i]["key"],
                    summary: result[i]["fields"].summary,
                    priority: 0,
                    team: result[i]["fields"][findProject.team_field].value
                });

                epicDoc = await newEpic.save();

                epics.push(epicDoc._id);
            }

            const doc = await Project.findOneAndUpdate({user_id: user._id, project_key: project}, {epics: epics}, {new: true}).populate('epics');

            if(doc){
                res.status(200).send(doc);
            }else{
                next (new Error('Error Updating Selected Project'));
            }
        }else{
            next (new Error('unauthorized'));
        }
    }catch(e){
        next(e)
    }

});

router.post("/updatePriority", async (req, res, next) =>  {


    const { email , password, project, priority, epicid } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            if(findProject){

                const epic_doc = await Epic.findByIdAndUpdate({_id: epicid}, {priority: priority});

                res.status(200).send(epic_doc);
                
            }else{
                next (new Error('Project unavailable'));
            }
        }else{
            next(new Error("Unauthorized"));
        }
    }catch(e){
        next(e)
    }

});

router.post("/updateDependency", async (req, res, next) =>  {


    const { email , password, project, dependencies, epicid } = req.body;

    try{    
        const user = await User.findOne({ email });
 
        if(user && user.password === password){

            const findProject = await Project.findOne({user_id: user._id, project_key: project});

            if(findProject){

                const epic_doc = await Epic.findByIdAndUpdate({_id: epicid}, {dependencies: dependencies});

                res.status(200).send(epic_doc);
                
            }else{
                next (new Error('Project unavailable'));
            }
        }else{
            next(new Error("Unauthorized"));
        }
    }catch(e){
        next(e)
    }

});

module.exports = router;

