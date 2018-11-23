import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Collection, CollectionItem, Card, Icon, Table } from 'react-materialize';
import axios from 'axios';
import { Redirect, Link } from 'react-router-dom';

class PriorityPlanner extends Component { 

    constructor(props){
        super(props);

        this.state = {
            epics: null,
            loading: true,
            prioritySubmit: false
        }
    }

    componentDidMount(){
        this.getProject();
    }

    getProject = async () => {

        try{
            const response = await axios.post(process.env.REACT_APP_API+"/project/getProject",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });
    
            this.setState({
                epics: response.data.epics,
                loading: false
            });
        }catch(e){
            console.error(e);
        }
    }

    setPriorities = async () => {

        try{
            for(let i=0; i<this.state.epics.length; i++){
                let response = await axios.post(process.env.REACT_APP_API+"/epic/updatePriority",{
                    email: this.props.email,
                    password: this.props.password,
                    project: this.props.project,
                    epicid: this.state.epics[i]._id,
                    priority: this.state.epics[i].priority
                });
            }
            this.setState({capacitiesSubmit: true});
        }catch(e){
            console.error(e);
        }
        
    }

    onPriorityChange = (e) => {
        let epics = JSON.parse(JSON.stringify(this.state.epics));
        epics[e.target.getAttribute("index")].priority = Number(e.target.value);
        this.setState({epics: epics});
    }

    renderEpics = () => {
        return this.state.epics.map( (epic, index) => {
            return(
                <tr>
                    <td><b>{epic.epic_key}</b></td>
                    <td>{epic.summary}</td>
                    <td>{epic.points}</td>
                    <td><input index={index} onChange={this.onPriorityChange} value={this.state.epics[index].priority}/></td>
                </tr>
            );
        });
    }

    render() {

        if(this.state.loading){
            return <div>Loading</div>
        }

        if(this.state.capacitiesSubmit){
            return <Redirect to="/dashboard" />
        }

        return (
        <Card style={styles.epics}>  
            <h3 style={styles.header}>Priority Planner</h3>

            <div style={styles.collection}>
                <Table striped={true} bordered={true}>
                    <thead>
                        <tr>
                            <td>Epic</td>
                            <td>Summary</td>
                            <td>Total Points</td>
                            <td>Priority</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderEpics()}
                    </tbody>
                </Table>
            </div>

            <div>
                <Button style={styles.backBtn} className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
                <Button onClick={this.setPriorities}>Save Priorities</Button>
            </div>
        </Card>
        );
    }
}

export default PriorityPlanner;

const styles = {
    backBtnLink: {
        "color": "#FFFFFF",
    },
    epics: {
        "width": "90%",
        "position": "absolute",
        "left": "5%",
        "marginTop": "1rem",
        "textAlign": "center",
        "position": "relative"     
    },
    header: {
        "margin": "0"
    },
    collection: {
        "maxHeight": "30rem",
        "overflow-y": "scroll",
        "width": "80%",
        "marginLeft": "10%"
    },
    backBtn: {
        "position": "absolute",
        "top": "0",
        "left": "0"
    }
}