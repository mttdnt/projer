import React, { Component } from 'react';
import '../App.css';
import { Input, Button, Card, Icon } from 'react-materialize';
import axios from 'axios';

class Login extends Component { 

    constructor(props){
        super(props);

        this.state = {
            email: null,
            password: null,
            project: null,
            loggedIn: false,
            user: null
        }
    }

    onFormChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    onLogin = async () => {

        try{
            const login = await axios.post("http://18.221.174.71:5000/user/login",{
                email: this.state.email,
                password: this.state.password,
                project: this.state.project
            });

            const setProject  = await axios.post("http://18.221.174.71:5000/project/setProject",{
                email: this.state.email,
                password: this.state.password,
                project: this.state.project
            });

            this.props.setUser(this.state.email,this.state.password, this.state.project);
        }catch(e){
            alert("Invalid Credentials")
        }
    }


    render() {
        return (
        <Card style={styles.loginPane}>  
            <span style={styles.iconInput}><Icon medium style={styles.icon}>email</Icon><input name="email" label="Email" value={this.state.email} onChange={this.onFormChange} placeholder="Email" style={styles.input}/></span>
            <span style={styles.iconInput}><Icon medium style={styles.icon}>vpn_key</Icon><input name="password" type="password" label="Password" value={this.state.password} onChange={this.onFormChange} placeholder="Password" style={styles.input}/></span>
            <span style={styles.iconInput}><Icon medium style={styles.icon}>folder</Icon><input name="project" label="Project" value={this.state.project}  onChange={this.onFormChange} placeholder="Project" style={styles.input}/></span>
            <Button waves="light" onClick={this.onLogin}>Login</Button>
        </Card>
        );
    }
}

export default Login;

const styles = {
    loginPane: {
        "width": "50%",
        "left": "25%",
        "position": "absolute",
        "marginTop": "5rem"
    },
    iconInput: {
        "display": "flex"
    },
    icon: {
        "float": "left"
    },
    input: {
        "marginLeft": "5rem"
    }
  };
  
