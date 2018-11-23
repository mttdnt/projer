import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Preloader, Card, Icon } from 'react-materialize';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { runInThisContext } from 'vm';

const options = [{ value: 1, label: 1 }, { value: 2, label: 2 }, { value: 3, label: 3 }, { value: 4, label: 4 }, { value: 5, label: 5 }];

class ProjectEdit extends Component { 

    constructor(props){
        super(props);

        this.state = {
            sprints: 1,
            weeks: 1,
            uploading: false,
            sprintsDate: null,
            url: null,
            team: null,
            parentEpic: null,
            storyPoint: null,
            project: null,
            epics: null
        }
    }

    componentDidMount(){
        this.getProject()
    }

    getProject = async () => {

        try{
            const response = await axios.post(process.env.REACT_APP_API+"/project/getProject",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });
            
            this.setState({ 
                team: response.data.team_field,
                parentEpic: response.data.parentEpic_field,
                storyPoint: response.data.storyPoint_field,
                sprintsDate: response.data.sprints,
                sprints: response.data.sprintNumber,
                weeks: response.data.weekNumber,
                epics: response.data.epics
            });
        }catch(e){
            console.error(e);
        }
    }


    updateSprints = async () =>{
        try{

            let sprintsObject = {};

            for(let j=0; j<this.state.sprints; j++){
                for(let k=0; k<this.state.weeks; k++){
                    sprintsObject[`S${j+1}-W${k+1}`] = 0;
                }
            }

            const response1 = await axios.post(process.env.REACT_APP_API+"/team/deleteTeams",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            const response2 = await axios.post(process.env.REACT_APP_API+"team/setTeams",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project,
                sprints: sprintsObject
            });

            const response3 = await axios.post(process.env.REACT_APP_API+"/project/setSprintsTeams",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project,
                sprints: this.state.sprintsDate,
                sprintNumber: this.state.sprints,
                weekNumber: this.state.weeks
            });

            const response4 = await axios.post(process.env.REACT_APP_API+"/project/setBurndown",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project,
                burndown: null
            });

            alert('Sprint Stucture Updated')

        }catch(e){
            console.error(e)       
        }

    }

    updateEpics = async () => {
        try{
            const response4 = await axios.post(process.env.REACT_APP_API+"/epic/deleteEpics",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            const response5 = await axios.post(process.env.REACT_APP_API+"/epic/setEpics",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            const response6 = await axios.post(process.env.REACT_APP_API+"/story/deleteStories",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            for(let i=0; i<response5.data.epics.length; i++){
                let response7 = await axios.post(process.env.REACT_APP_API+"/story/setStories",{
                    email: this.props.email,
                    password: this.props.password,
                    project: this.props.project,
                    epic: response5.data.epics[i].epic_key
                });
            }

            alert('Epics Updated');
        }catch(e){
            console.error(e) 
        }
    }

    updateStories = async () => {
        try{
            const response6 = await axios.post(process.env.REACT_APP_API+"/story/deleteStories",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });

            for(let i=0; i<this.state.epics.length; i++){
                let response7 = await axios.post(process.env.REACT_APP_API+"/story/setStories",{
                    email: this.props.email,
                    password: this.props.password,
                    project: this.props.project,
                    epic: this.state.epics[i].epic_key
                });
            }

            alert('Stories Updated');
        }catch(e){
            console.error(e) 
        }
    }

    updateFields = async () => {
        if(this.state.project === "" || 
            this.state.url === "" || 
            this.state.team === "" || 
            this.state.parentEpic === "" || 
            this.state.storyPoint === ""){
                alert('All fields need to be filled out');
            }else{
                try{
                    const response = await axios.put(process.env.REACT_APP_API+"/project/fields",{
                        email: this.props.email,
                        password: this.props.password,
                        project: this.props.project,
                        team: this.state.team,
                        parentEpic: this.state.parentEpic,
                        storyPoint: this.state.storyPoint
                    });

                    alert('Updated Custom Fields')
                }catch(e){
                    console.error(e);
                }
            }
    }

    onSprintSelect = (e) => {
        this.setState({sprints: e.value}, () => this.generateSprints());
    }

    onWeekSelect = (e) => {
        this.setState({weeks: e.value}, () => this.generateSprints());
    }

    onStartChange = (e,index) =>{
        let newSprintsDate = this.state.sprintsDate;
        let end=new moment(e);
        end.add(7,'days');
        newSprintsDate[index].start=e;
        newSprintsDate[index].end=end;
        this.setState({sprintsDate: newSprintsDate});
    }

    generateSprints = () => {
        let sprints = [];

        for(let j=0; j<this.state.sprints; j++){
            for(let k=0; k<this.state.weeks; k++){
                sprints.push({name: `S${j+1}-W${k+1}`, start: moment(), end: moment().add(7, 'days')});
            }
        }

        this.setState({sprintsDate: sprints});

    }

    renderSprints = () => {
        return(
            <table>
                <thead>
                    <tr>
                        {this.state.sprintsDate.map( header => <td>{header.name}</td>)}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {this.state.sprintsDate.map( (header, index) => <td>Start Date: <DatePicker id={index} onChange={(e) => this.onStartChange(e,index)} selected={moment(this.state.sprintsDate[index].start)}/></td>)}
                    </tr>
                </tbody>
            </table>
        );
    }

    onFormChange = (e) =>{
        e.preventDefault();
        this.setState({[e.target.name]: e.target.value});
    }

    render() {

        if(this.state.uploading ){
            this.setDB();
            return <div  style={styles.loader}><Preloader size='big'/></div>
        }

        return (
        <Card style={styles.projectSetting}>
            <div style={styles.formArea}>
                    <div style={styles.formFields}>
                        <b>Team Custom Field</b><input name="team" type='text' placeholder='Team Custom Field' value={this.state.team} onChange={this.onFormChange}/>
                        <b>Parent Epic Custom Field</b><input name="parentEpic" type='text' placeholder='Parent Epic Custom Field' value={this.state.parentEpic} onChange={this.onFormChange}/>  
                        <b>Story Point Custom Field</b><input name="storyPoint" type='text' placeholder='Story Point Custom Field' value={this.state.storyPoint} onChange={this.onFormChange}/>
                        <Button onClick={this.updateFields}>Update Fields</Button>
                    </div>
                    <div style={styles.btnFields}>
                        <p>Click here to get the most up to date epics</p>
                        <Button style={styles.btn} onClick={this.updateEpics}>Update Epics</Button>
                        <br />
                        <p>Click here to get the most up to date stories</p>
                        <Button style={styles.btn} onClick={this.updateStories}>Update Stories</Button>
                    </div>
            </div>
            <div style={styles.sprintArea}>
                <h5>Number of Sprints</h5>
                <Dropdown options={options} onChange={this.onSprintSelect} value={options[this.state.sprints-1]}/>
                <h5>Weeks/Sprint</h5>
                <Dropdown options={options} onChange={this.onWeekSelect} value={options[this.state.weeks-1]}/>
                {this.state.sprintsDate? this.renderSprints(): null}
                <Button onClick={this.updateSprints}>Update Sprints</Button>
            </div>
            <Button style={styles.backBtn} className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
        </Card>
        );
    }
}

export default ProjectEdit;

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
    },
    backBtn: {
        "position": "absolute",
        "top": "0",
        "left": "0"
    },
    formFields: {
        "textAlign": "center",
        "width": "30%",
        "position": "absolute",
        "left": "10%"
    },
    btnFields: {
        "textAlign": "center",
        "width": "30%",
        "position": "absolute",
        "left": "50%",
    },
    btn: {
        "margin": "1rem 0"
    },
    formArea: {
        "display": "-webkit-box",
        "position": "relative",
        "marginBottom": "25rem"
    },
    sprintArea: {
        "textAlign": "center"
    },
}