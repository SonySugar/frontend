import React, { Component } from 'react';
import { Dropdown, Row, Col, Button } from 'react-bootstrap';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'

import ChatList from './ChatList';
import Aux from "../../../../../hoc/_Aux";
import DEMO from "../../../../../store/constant";

import Avatar1 from '../../../../../assets/images/user/avatar-1.jpg';
import Avatar2 from '../../../../../assets/images/user/avatar-2.jpg';
import Avatar3 from '../../../../../assets/images/user/avatar-3.jpg';

import AuthenticationService from '../../../../../service/Authenticatonservice';
import CustomerAuthenticationservice from '../../../../../service/CustomerAuthenticationservice';
import { history } from "../../../history";
import { Dialog } from '@material-ui/core';

class NavRight extends Component {
    state = {
        listOpen: false,
        full_name:'',
        open: false,
        full_name: '',
        email: '',
        staff_id:'',
        phone_number: '',
        role:'',
        role_privileges: [],
        logintype: 'customer',
    };
 componentDidMount(){
      
    let loggedInuser = '';
    let email = '';
    let phone = '';
    let role = '';


     if(Object.keys(AuthenticationService.getUser()).length==0 && Object.keys(CustomerAuthenticationservice.getCustomer()).length==0){
      
       history.push("/");
       window.location.reload();
     }else{
        
    if(Object.keys(AuthenticationService.getUser()).length > 0){
       
        loggedInuser = AuthenticationService.getUser().data.systemUser.fullname;
        email = AuthenticationService.getUser().data.systemUser.email;
        phone = AuthenticationService.getUser().data.systemUser.phonenumber;
        //role = AuthenticationService.getUser().data.systemUser.roles.name;
        role = 'Admin';
        this.setState({ 
            logintype: 'admin'
        });
    }else if(Object.keys(CustomerAuthenticationservice.getCustomer()).length > 0){
        loggedInuser = CustomerAuthenticationservice.getCustomer().data.customer.firstname + " " + CustomerAuthenticationservice.getCustomer().data.customer.lastname;
        email = CustomerAuthenticationservice.getCustomer().data.customer.email;
        phone = CustomerAuthenticationservice.getCustomer().data.customer.phonenumber;
        role = 'Customer';
        this.setState({ 
            logintype: 'customer'
        });
    }
    this.setState({
        full_name:loggedInuser,
        email:email,
        phone_number:phone,
        role:role,
    })
}
 }


 async logout(){
    if(this.state.logintype=='admin'){
        AuthenticationService.logout();
    }else if(this.state.logintype=='customer'){
        CustomerAuthenticationservice.logout();
    }

 }
 async openProfile(){
     this.setState({
         open: true
     });
 }
 async closeProfile(){
    this.setState({
        open: false
    });
 }

    render() {

        return (
            <Aux>
                <ul className="navbar-nav ml-auto">
                    <li>
                      
                    </li>
                 
                    <li>
                        <Dropdown alignRight={!this.props.rtlLayout} className="drp-user">
                            <Dropdown.Toggle variant={'link'} id="dropdown-basic">
                                <i className="icon feather icon-settings"/>
                            </Dropdown.Toggle>
                            <Dropdown.Menu alignRight className="profile-notification">
                                <div className="pro-head">
                                    <img src={Avatar1} className="img-radius" alt="User Profile"/>
                                    <span>{this.state.full_name}</span>
                                    <a href="/" className="dud-logout" title="Logout"  onClick={() => { this.logout() }}>
                                        <i className="feather icon-log-out"/>
                                    </a>
                                </div>
                                <ul className="pro-body">
                                    <li><a href={DEMO.BLANK_LINK} className="dropdown-item" onClick={() => { this.openProfile() }}><i className="feather icon-user"/> Profile</a></li>
                                </ul>
                            </Dropdown.Menu>
                        </Dropdown>
                    </li>
                </ul>
                <Dialog
                    open={this.state.open}
                    onClose={this.closeProfile.bind(this)}
                    fullWidth

                >
                    

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>My Profile</h3>
                            <Row>
                               
                                <Col>

                                <div className="input-group mb-3" style={{backgroundColor: "white", fontWeight: "bold"}}>
                                    Full names
                                </div>
                                    
                                    <div className="input-group mb-3">
                                        
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Full name" value={this.state.full_name} readOnly />
                                    </div>
                                    <div className="input-group mb-3" style={{backgroundColor: "white", fontWeight: "bold"}}>
                                    Email
                                </div>
                                    

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Staff Id" value={this.state.staff_id} readOnly />
                                    </div>

                                    <div className="input-group mb-3" style={{backgroundColor: "white", fontWeight: "bold"}}>
                                    Phone number
                                </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Phone number" value={this.state.phone_number} readOnly />
                                    </div>

                                    <div className="input-group mb-3" style={{backgroundColor: "white", fontWeight: "bold"}}>
                                    Role name
                                </div>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Role" value={this.state.role} readOnly />
                                    </div>

                                    
                                    
                                </Col>
                            </Row>
                            <Row>
                            <Col>
                            <div className="card-body text-center">
                                <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeProfile() }}>CLOSE</button>
                            </div>
                            </Col>
                          
                        </Row> 
                        </div>
                        
                       
                    </div>
                    
                </Dialog>
            </Aux>
            
        );
        
    }
    
}

export default NavRight;
