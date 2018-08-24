import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Collection, CollectionItem, Card, Icon, Modal, Table} from 'react-materialize';
import axios from 'axios';
import { Redirect, Link } from 'react-router-dom';
import Dropdown from 'react-dropdown';

class DependencyPlanner extends Component { 

    constructor(props){
        super(props);

        this.state = {
            epics: null,
            loading: true,
            dependencySubmit: false,
            selectedEpic: null,
            options: null,
            modalOpen: false
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
                loading: false
            });
        }catch(e){
            console.error(e);
        }
    }

    setDependencies = async () => {
        try{
            for(let i=0; i<this.state.epics.length; i++){
                let response = await axios.post("/epic/updateDependency",{
                    email: this.props.email,
                    password: this.props.password,
                    project: this.props.project,
                    epicid: this.state.epics[i]._id,
                    dependencies: this.state.epics[i].dependencies
                });
            }
            this.setState({dependenciesSubmit: true});
        }catch(e){
            console.error(e);
        }
    }

    addDependency = (e) => {
        let newEpics = JSON.parse(JSON.stringify(this.state.epics));
        let newOptions = this.state.options.filter( (option) => option!==e.value);

        newEpics[this.state.selectedEpic].dependencies.push(e.value);

        this.setState({epics: newEpics, options: newOptions});
    }

    removeDependency = (dependency) => {
        let newEpics = JSON.parse(JSON.stringify(this.state.epics));
        let newOptions = this.state.options.slice();
        newOptions.push(dependency);

        let newDependencies = newEpics[this.state.selectedEpic].dependencies
         
        newDependencies = newDependencies.filter( (oldDependency) => {
            return oldDependency!==dependency
        });

        newEpics[this.state.selectedEpic].dependencies = newDependencies;

        this.setState({epics: newEpics, options: newOptions});
    }

    renderEpics = () => {
        return this.state.epics.map( (epic, index) => {
            return(
                <tr>
                    <td><b>{epic.epic_key}</b></td>
                    <td>{epic.summary}</td>
                    <td>
                        <ul>
                            {this.state.epics[index].dependencies.map( (dependency) => <li>{dependency}</li>)}
                        </ul>
                        <Button small className='red' waves='light' onClick={ 
                            () => {
                                let options =  [];
                                this.state.epics.forEach( (epic, findex) =>{
                                    if(index!==findex && !this.state.epics[index].dependencies.includes(epic.epic_key)){
                                        options.push(epic.epic_key);
                                    }
                                });
                                this.setState({selectedEpic: index, modalOpen: true, options: options});
                            }}>Edit</Button>
                    </td>
                </tr>
            );
        });
    }

    render() {

        if(this.state.loading){
            return <div>Loading</div>
        }

        if(this.state.dependenciesSubmit){
            return <Redirect to="/dashboard" />
        }

        return (
        <Card style={styles.epics}>  
            <h3 style={styles.header}>Dependencies Planner</h3>

            <div style={styles.collection}>
                <Table striped={true} bordered={true}>
                    <thead>
                        <tr>
                            <td>Epic</td>
                            <td>Summary</td>
                            <td>Dependencies</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderEpics()}
                    </tbody>
                </Table>
            </div>

            <div>
                <Button style={styles.backBtn} className="green"><Link to="/dashboard" style={styles.backBtnLink}><Icon tiny>arrow_back</Icon></Link></Button>
                <Button onClick={this.setDependencies}>Save Dependencies</Button>
            </div>

            {this.state.selectedEpic!==null?
            <Modal 
            open={this.state.modalOpen} 
            actions={[<Button onClick={()=>this.setState({modalOpen: false})}>Close</Button>]} 
            header={this.state.epics[this.state.selectedEpic].epic_key}
            modalOptions={{dismissible:false}}
            >
                <Dropdown options={this.state.options} placeholder="Select an Epic" onChange={this.addDependency}/>
                <div style={styles.modalCollection}>
                <Collection>
                        {this.state.epics[this.state.selectedEpic].dependencies.map( (dependency) => 
                        <CollectionItem>{dependency}<Button icon='remove' small flat onClick={() => this.removeDependency(dependency) }/></CollectionItem>
                        )}
                </Collection>      
                </div>        
            </Modal>
            :
            null
            }
           
        </Card>
        );
    }
}

export default DependencyPlanner;

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
        "width": "100%",
    },
    modalCollection: {
        "height": "10rem",
        "overflow-y": "scroll",
        "width": "100%",
    },
    backBtn: {
        "position": "absolute",
        "top": "0",
        "left": "0"
    }
}