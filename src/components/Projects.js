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

class ProjectSetup extends Component { 

    constructor(props){
        super(props);

        this.state = {
            loading: true,
            projects: null
        }
    }

    componentDidMount(){
        this.getProjects(); 
    }

    getProjects = async () =>{
        try{
            const response = await axios.post(process.env.REACT_APP_API+"/user/getProjects",{
                email: this.props.email,
                password: this.props.password
            });
            this.setState({loading: false, projects: response.data});

        }catch(e){
            console.log(e)       
        }
    }

    renderProjects = () =>{
        return this.state.projects.map( (project,index) => {
            let key=project.project_key;
            return <Card className="projectCard" onClick={()=>{this.props.setProject(key)}}>{project.project_key}</Card>
        })
    }

    render() {
        if(this.state.loading){
            return <div style={styles.loader}><Preloader size='big'/></div>
        }

        return (
            <div style={styles.centerItem}>
                <h3>Choose a Project</h3>
                <Button><Link style={styles.backBtnLink} to="/setup">Add New Project</Link></Button>
                {this.state.projects?this.renderProjects():null}
            </div>
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
    centerItem: {
        "position": "absolute",
        "left": "40%",
        "textAlign": "center"
    },
    buttons: {
        "marginTop": "2rem"
    }
}