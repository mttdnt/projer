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

const options = [{ value: 1, label: 1 }, { value: 2, label: 2 }, { value: 3, label: 3 }, { value: 4, label: 4 }, { value: 5, label: 5 }];

class ProjectSetup extends Component { 

    constructor(props){
        super(props);

        this.state = {
            sprints: 1,
            weeks: 1,
            dbSet: false,
            uploading: false,
            sprintsDate: null,
            url: null,
            team: null,
            parentEpic: null,
            storyPoint: null,
            project: null
        }
    }

    componentDidMount(){
        this.generateSprints(); 
    }

    setDB = async () =>{
        try{

            let sprintsObject = {};

            for(let j=0; j<this.state.sprints; j++){
                for(let k=0; k<this.state.weeks; k++){
                    sprintsObject[`S${j+1}-W${k+1}`] = 0;
                }
            }

            const response2 = await axios.post("/project/setProject",{
                email: this.props.email,
                password: this.props.password,
                project: this.state.project,
                team: this.state.team,
                url: this.state.url,
                parentEpic: this.state.parentEpic,
                storyPoint: this.state.storyPoint,
                sprints: this.state.sprints,
                weeks: this.state.weeks
            });

            const response3 = await axios.post("/team/setTeams",{
                email: this.props.email,
                password: this.props.password,
                project: this.state.project,
                sprints: sprintsObject
            });

            const response4 = await axios.post("/project/setSprintsTeams",{
                email: this.props.email,
                password: this.props.password,
                project: this.state.project,
                sprints: this.state.sprintsDate
            });

            const response5 = await axios.post("/epic/setEpics",{
                email: this.props.email,
                password: this.props.password,
                project: this.state.project
            });

            for(let i=0; i<response5.data.epics.length; i++){
                let response6 = await axios.post("/story/setStories",{
                    email: this.props.email,
                    password: this.props.password,
                    project: this.state.project,
                    epic: response5.data.epics[i].epic_key
                });
            }

            this.setState({dbSet: true, uploading: false});

        }catch(e){
            alert(e)      
        }

    }

    create = () => {
        if(this.state.project === null || 
            this.state.url === null || 
            this.state.team === null || 
            this.state.parentEpic === null || 
            this.state.storyPoint === null){
                alert('All fields need to be filled out');
            }else{
                this.setState({uploading: true});
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
                        {this.state.sprintsDate.map( (header, index) => <td>Start Date: <DatePicker id={index} onChange={(e) => this.onStartChange(e,index)} selected={this.state.sprintsDate[index].start}/></td>)}
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

        if(this.state.dbSet){
            return <Redirect to="/" />
        }

        if(this.state.uploading){
            this.setDB();
            return <div  style={styles.loader}><Preloader size='big'/></div>
        }

        return (
        <Card style={styles.projectSetting}>
            <input name="url" type='text' placeholder='Project URL' value={this.state.url} onChange={this.onFormChange}/>
            <input name="project" type='text' placeholder='Project Key' value={this.state.project} onChange={this.onFormChange}/>
            <input name="team" type='text' placeholder='Team Custom Field' value={this.state.team} onChange={this.onFormChange}/>
            <input name="parentEpic" type='text' placeholder='Epic Parent Custom Field' value={this.state.parentEpic} onChange={this.onFormChange}/>  
            <input name="storyPoint" type='text' placeholder='Story Point Custom Field' value={this.state.storyPoint} onChange={this.onFormChange}/>
            <h5>Number of Sprints</h5>
            <Dropdown options={options} onChange={this.onSprintSelect} value={options[this.state.sprints-1]}/>
            <h5>Weeks/Sprint</h5>
            <Dropdown options={options} onChange={this.onWeekSelect} value={options[this.state.weeks-1]}/>
            {this.state.sprintsDate? this.renderSprints(): null}
            <div style={styles.buttons}>
                <Button onClick={this.create}>Create Project</Button>
                <Button><Link style={styles.backBtnLink} to="/projects">Cancel</Link></Button>
            </div>
        </Card>
        );
    }
}

export default ProjectSetup;

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