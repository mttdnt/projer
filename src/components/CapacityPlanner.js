import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Card, Icon } from 'react-materialize';
import axios from 'axios';
import { Redirect, Link } from 'react-router-dom';

class CapacityPlanner extends Component { 

    constructor(props){
        super(props);

        this.state = {
            epics: null,
            teams: null,
            sprints: null,
            loading: true,
            capacitiesSubmit: false
        }
    }

    componentDidMount(){
        this.getProject();
    }

    getProject = async () => {

        try{
            const response = await axios.post("/project/getProject",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project
            });
    
            this.setState({
                epics: response.data.epics,
                teams: response.data.teams,
                sprints: response.data.sprints,
                loading: false
            });
        }catch(e){
            console.error(e);
        }
    }

    setCapacities = async () => {
        
        for(let i=0; i<this.state.teams.length; i++){
            let response = await axios.post("/teams/updateCapacities",{
                email: this.props.email,
                password: this.props.password,
                project: this.props.project,
                teamid: this.state.teams[i]._id,
                capacities: this.state.teams[i].capacities
            });
        }
        this.setState({capacitiesSubmit: true});
    }

    onCapacityChange = (e) => {
        let teams = JSON.parse(JSON.stringify(this.state.teams));
        teams[e.target.getAttribute("teamindex")]["capacities"][e.target.getAttribute("sprint")] = Number(e.target.value);

        if(!isNaN(e.target.value)){
            this.setState({teams: teams});
        }
    }

    renderSprintHeaders = () =>{
        return this.state.sprints.map( sprint => {
            return <td>{sprint}</td>
        });
    }

    renderTableBody = () => {
        return this.state.teams.map( (team, index) =>{
            return(
                <tr>
                    <td>{team.name}</td>
                    {Object.keys(team.capacities).map( (sprint) =>
                        <td><input teamindex={index} sprint={sprint} onChange={this.onCapacityChange} value={this.state.teams[index]["capacities"][sprint]}/></td>
                    )}
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
        <div className="App">  
            <Card style={styles.capacityTable}>
                <h3 style={styles.header}>Capacity Planner</h3>
                <table>
                    <thead>
                        <tr>
                            <td></td>
                            {this.renderSprintHeaders()}
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderTableBody()}
                    </tbody>
                </table>
                <Button className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
                <Button onClick={this.setCapacities}>Save Capacities</Button>
            </Card>
        </div>
        );
    }
}

export default CapacityPlanner;

const styles = {
    backBtnLink: {
        "color": "#FFFFFF",
    },
    capacityTable: {
        "width": "90%",
        "position": "absolute",
        "left": "5%",
        "marginTop": "1rem",
        "overflowX": "scroll", 
        "textAlign": "center"    
    },
    header: {
        "margin": "0"
    }
};
