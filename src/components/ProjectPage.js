import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Preloader, Card, Icon } from 'react-materialize';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const options = [{ value: 1, label: 1 }, { value: 2, label: 2 }, { value: 3, label: 3 }, { value: 4, label: 4 }, { value: 5, label: 5 }];

class ProjectPage extends Component { 

    constructor(props){
        super(props);

        this.state = {
            sprints: 1,
            weeks: 1,
            dbSet: false,
            uploading: false
        }
    }

    setDB = async () =>{
        try{

            let sprints = [];
            let sprintsObject = {};

            for(let j=0; j<this.state.sprints; j++){
                for(let k=0; k<this.state.weeks; k++){
                    sprints.push(`Sprint ${j+1} - Week ${k+1}`);
                    sprintsObject[`Sprint ${j+1} - Week ${k+1}`] = 0;
                }
            }

            const response1 = await axios.post("http://localhost:5000/teams/deleteTeams",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            const response2 = await axios.post("http://localhost:5000/teams/setTeams",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project,
                sprints: sprintsObject
            });

            const response3 = await axios.post("http://localhost:5000/project/setSprintsTeams",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project,
                sprints: sprints.slice()
            });

            const response4 = await axios.post("http://localhost:5000/epic/deleteEpics",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            const response5 = await axios.post("http://localhost:5000/epic/setEpics",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            const response6 = await axios.post("http://localhost:5000/stories/deleteStories",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            for(let i=0; i<response5.data.epics.length; i++){
                let response7 = await axios.post("http://localhost:5000/stories/setStories",{
                    email: this.props.email,
                    password: this.props.password,
                    project: this.props.project,
                    epic: response5.data.epics[i].epic_key
                });
            }

            this.setState({dbSet: true});

        }catch(e){
            console.log(e)       
        }

    }

    reset = () => {
        this.setState({uploading: true});
    }

    onSprintSelect = (e) => {
        this.setState({sprints: e.value})
    }
    onWeekSelect = (e) => {
        this.setState({weeks: e.value})
    }

    render() {

        if(this.state.dbSet){
            return <Redirect to="/dashboard" />
        }

        if(this.state.uploading){
            this.setDB();
            return <div  style={styles.loader}><Preloader size='big'/></div>
        }

        return (
        <Card style={styles.projectSetting}>  
            <h3>Number of Sprints</h3>
            <Dropdown options={options} onChange={this.onSprintSelect} value={options[this.state.sprints-1]}/>
            <h3>Weeks/Sprint</h3>
            <Dropdown options={options} onChange={this.onWeekSelect} value={options[this.state.weeks-1]}/>
            <div style={styles.buttons}>
                <Button className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
                <Button onClick={this.reset}>Reset Sprints</Button>
            </div>
        </Card>
        );
    }
}

export default ProjectPage;

const styles = {
    loader: {
        "position": "absolute",
        "top": "50%",
        "left": "50%"
    },
    backBtnLink: {
        "color": "#FFFFFF",
    },
    projectSetting: {
        "width": "90%",
        "position": "absolute",
        "left": "5%",
        "marginTop": "1rem"     
    },
    buttons: {
        "marginTop": "2rem"
    }
}