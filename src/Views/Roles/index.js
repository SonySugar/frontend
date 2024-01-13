import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";

import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog, IconButton } from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import Authenticatonservice from '../../service/Authenticatonservice';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import { FaPlusCircle, FaTimes, FaSave, FaDoorOpen } from 'react-icons/fa';
var custom_notification_style = {
    NotificationItem: { // Override the notification item
        DefaultStyle: { // Applied to every notification, regardless of the notification level
            margin: '10px 5px 2px 1px'
        },

        warning: {
            color: 'white',
            backgroundColor: "orange",
            textStyle: "bold"
        },
        error: {
            color: 'white',
            backgroundColor: "red",
            textStyle: "bold"
        },
        success: {
            color: 'white',
            backgroundColor: "green",
            textStyle: "bold"
        }
    }
}
const SpinnerDiv = styled.div`
text-align: center;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: RGBA(0, 0, 0, 0.2);
display: grid;
place-items: center;
z-index: 10;
`;
class Roles extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            roles_list: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            name:'',
            updated_name:'',
            update_role_id:'',
            _notificationSystem: null,
            show_progress_status:false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getRoles();
        this.setState({ show_progress_status: false });
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
           this.logout();
        }
    }
    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getRoles() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("roles");
            if (apiResponse.status == 403) {
                this.setState({ closesession: true });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }else{
               
                    this.setState({ roles_list: apiResponse });
                 
                    
            }
       
    }
     getDepartment(cell, row) {
        return cell.dept_name;
      }
      getRole(cell, row) {
        return cell.role_name;
      }
      cellButton(row) {
       
        return (

            <IconButton onClick={() =>
                this.onClickRoleSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update department' />
            </IconButton>


        );
    }

    closeUpdateDialog(){
        this.setState({ openUpdate: false }); 
    }
    openUpdateDialog(){
        this.setState({ openUpdate: true }); 
    }

    closeAddDialog(){
        this.setState({ open: false }); 
    }
    openAddDialog(){
        this.setState({ open: true }); 
    }

    closeDeleteDialog(){
        this.setState({ openDelete: false }); 
    }
    openDeleteDialog(row){
        this.setState({ 
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        }); 
    }
    onClickRoleSelected(row){
        this.setState({
            updated_role_name:row.name,
            update_role_id:row.id,
            
        });
        this.openUpdateDialog();
    }
    

    async saveRole(){
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        
        if (this.state.name == null || this.state.name === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter role name',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["name"] = this.state.name
    
          let result = await APIService.makePostRequest("role/save", params);
          if (result.success) {
            notification.addNotification({
                message: 'Role saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeAddDialog();
              this.setState({
                  name:''
              });
              this.getRoles();
              this.setState({ show_progress_status: false });
          } else {
            this.setState({ show_progress_status: false });
            notification.addNotification({
              message: result.message,
              level: 'error',
              autoDismiss: 5
            });
          }
        }
    
    }
    async updateRole(){
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        if (this.state.updated_role_name == null || this.state.updated_role_name === '') {
          this.setState({ loggingIn: false });
    
          notification.addNotification({
            message: 'Please enter role name',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["name"] = this.state.updated_role_name
          params["id"] = this.state.update_role_id;
    
          let result = await APIService.makePostRequest("role/update", params);
          if (result.success) {
            notification.addNotification({
                message: 'Role saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeUpdateDialog();
              this.setState({
                updated_role_name:'',
                update_role_id:''
              });
              this.getRoles();
              this.setState({ show_progress_status: false });
          } else {
            this.setState({ show_progress_status: false });
            notification.addNotification({
              message: result.message,
              level: 'error',
              autoDismiss: 5
            });
          }
        }
    
    }
    
    render() {
        return (
            <Aux>
                  {this.state.show_progress_status && (<SpinnerDiv>
          <CircularProgress />
        </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
                <Row>
                    <Col>
                    <Card title='Roles' isOption>
                          
                    <IconButton  onClick={() =>
                                    this.openAddDialog()
                                }>
                                <FaPlusCircle  style={{ color: "#04a9f5" }} size={50} title='Add role'/>
                            </IconButton>
                           
  <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Name</Th>
                                <Th>Created by</Th>
                                <Th>Update</Th>
                                

                            </Tr>

                        </Thead>
                        {this.state.roles_list==null || this.state.roles_list.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>Loading ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.roles_list.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.name}
                                        </Td>
                                        <Td>
                                            {u.createdby}
                                        </Td>
                                        
                                        <Td>{this.cellButton(u)}</Td>
                                        
                                    
                                    </Tr>
                                )
                            )}
                        </Tbody>}
                    </Table>

                            
                        </Card>
                       
 
                    </Col>
                </Row>
                <Dialog
                    open={this.state.closesession}

                    fullWidth

                >

                    <div className="card">
                        <div className="card-body text-center">
                            <h3>Your session has expired</h3>
                            <br />
                            <br />
                            <h4>Please log in again</h4>



                        </div>
                        <div className="card-body text-center">
                        <IconButton onClick={() => { this.logout() }}>

<FaDoorOpen size={50} title='Exit' color='red' />
</IconButton>
                        </div>


                    </div>

                </Dialog>

                <Dialog
                    open={this.state.open}
                    onClose={this.closeAddDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Create Role</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Role name" value={this.state.name} onChange={e => this.handleChange(e, "name")} />
                                    </div>
                                </Col>
                            </Row>
                            <div className="card-body text-center">
                            <Row>
                            <Col>
                                    <IconButton onClick={() => { this.closeAddDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.saveRole() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                                </Row>
                                </div>


                        </div>
                        
                       
                    </div>

                                         
                </Dialog>

                <Dialog
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Update Role</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Role name" value={this.state.updated_role_name} onChange={e => this.handleChange(e, "updated_role_name")} />
                                    </div>
                                </Col>
                            </Row>
                            <div className="card-body text-center">
                            <Row>
                            <Col>
                                    <IconButton onClick={() => { this.closeUpdateDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.updateRole() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                                </Row>
                                </div>


                        </div>
                        
                       
                    </div>

                                         
                </Dialog>
                <Dialog
                    open={this.state.openDelete}

                    fullWidth

                >

                    <div className="card">
                        <div className="card-body text-center">
                            <h3>{this.state.delete_dept_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this role?</h4>



                       
                        <Table>
                                <Tbody>
                                    <Tr key={0}>
                                        <Td><IconButton onClick={() => { this.closeDeleteDialog() }}>

                                            <FaTimes size={50} title='Cancel' color='green' />
                                        </IconButton></Td>
                                        <Td> <IconButton onClick={() => { this.deleteDepartment() }}>
                                            <FaSave color='red' size={50} title='Save' />
                                        </IconButton></Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                            </div>

                    </div>

                </Dialog>
            </Aux>
            
        );
    }
}

export default Roles;