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
class Departments extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            dept_list: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            new_dept_name:'',
            updated_dept_name:'',
            delete_dept_name:'',
            delete_dept_id:'',
            update_dept_id:'',
            username: '',
            phonenumber: '',
            fullnames: '',
            updated_fullnames: '',
            updated_phonenumber: '',
            updated_user_id: '',
            _notificationSystem: null,
            role:'',
            updated_role:'',
            show_progress_status:false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getDepartments();
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
    async getDepartments() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("departments");
            if (apiResponse.status == 403) {
                this.setState({ closesession: true });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }else{
               
                    this.setState({ dept_list: apiResponse });
                 
                    
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
                this.onClickDepartmentSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update department' />
            </IconButton>


        );
    }
    deleteButton(row) {
        const { classes } = this.props;
        return (

           <IconButton onClick={() =>
                this.openDeleteDialog(row)
            }>

                <DeleteIcon style={{ color: "red" }} titleAccess='Delete department' />

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
    onClickDepartmentSelected(row){
        this.setState({
            updated_dept_name:row.dept_name,
            update_dept_id:row.id,
            
        });
        this.openUpdateDialog();
    }
    

    async saveDepartment(){
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

         //check permissions
         let privilegeList = [];
         let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
         for(let k in privileges){
            
             privilegeList.push(privileges[k].mprivileges.privilege_name);
         }
 
         if(!privilegeList.includes("create_department")){
             this.setState({ show_progress_status: false });
             notification.addNotification({
               message: "You do not have the rights to create a department. Please contact your Systems Administrator",
               level: 'error',
               autoDismiss: 5
             });  
         }else{
        if (this.state.new_dept_name == null || this.state.new_dept_name === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter department name',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["dept_name"] = this.state.new_dept_name
    
          let result = await APIService.makePostRequest("department/save", params);
          if (result.success) {
            notification.addNotification({
                message: 'Department saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeAddDialog();
              this.setState({
                  new_dept_name:''
              });
              this.getDepartments();
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
    }
    async updateDepartment(){
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

         //check permissions
         let privilegeList = [];
         let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
         for(let k in privileges){
            
             privilegeList.push(privileges[k].mprivileges.privilege_name);
         }
 
         if(!privilegeList.includes("update_department")){
             this.setState({ show_progress_status: false });
             notification.addNotification({
               message: "You do not have the rights to make any updates to a department. Please contact your Systems Administrator",
               level: 'error',
               autoDismiss: 5
             });  
         }else{
        if (this.state.updated_dept_name == null || this.state.updated_dept_name === '') {
          this.setState({ loggingIn: false });
    
          notification.addNotification({
            message: 'Please enter department name',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["department_name"] = this.state.updated_dept_name
          params["id"] = this.state.update_dept_id;
    
          let result = await APIService.makePostRequest("department/update", params);
          if (result.success) {
            notification.addNotification({
                message: 'Department saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeUpdateDialog();
              this.setState({
                updated_dept_name:'',
                update_dept_id:''
              });
              this.getDepartments();
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
    }
    async deleteDepartment(){
        this.closeDeleteDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

          //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for(let k in privileges){
           
            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if(!privilegeList.includes("delete_department")){
            this.setState({ show_progress_status: false });
            notification.addNotification({
              message: "You do not have the rights to delete a department. Please contact your Systems Administrator",
              level: 'error',
              autoDismiss: 5
            });  
        }else{
          let params = {};
          params["id"] = this.state.delete_dept_id;
    
          let result = await APIService.makePostRequest("department/delete", params);
          if (result.success) {
            notification.addNotification({
                message: 'Department deleted',
                level: 'success',
                autoDismiss: 5
              });
              this.closeDeleteDialog();
              this.setState({
                updated_dept_name:'',
                delete_dept_id:''
              });
              this.getDepartments();
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
                    <Card title='Departments' isOption>
                          
                    <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                    this.openAddDialog()
                }
            >
                Create Departments
            </Button>
                           
  <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Name</Th>
                                <Th>Update</Th>
                                <Th>Delete</Th>

                            </Tr>

                        </Thead>
                        {this.state.dept_list==null || this.state.dept_list.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>Loading ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.dept_list.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.department_name}
                                        </Td>
                                        
                                        <Td>{this.cellButton(u)}</Td>
                                        <Td>{this.deleteButton(u)}</Td>
                                    
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
                    <center>
                  <Lottie
                    loop
                    animationData={lottieJson}
                    play
                    style={{ width: 50, height: 50 }}
                  />
                </center>
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
                            <h3>Create Department</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Department name" value={this.state.new_dept_name} onChange={e => this.handleChange(e, "new_dept_name")} />
                                    </div>
                                </Col>
                            </Row>
                            <div className="card-body text-center">
                            <Row>
                            <Col>
                            <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                    this.closeAddDialog()
                }
            >
                Dismiss
            </Button>
                                </Col>
                                <Col>
                                <Button
                size="sm"
                variant="primary"
                onClick={() =>
                    this.saveDepartment()
                }
            >
                Save
            </Button>
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
                            <h3>Update Department</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Department name" value={this.state.updated_dept_name} onChange={e => this.handleChange(e, "updated_dept_name")} />
                                    </div>
                                </Col>
                            </Row>
                            <div className="card-body text-center">
                            <Row>
                            <Col>
                            <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                    this.closeUpdateDialog()
                }
            >
                Dismiss
            </Button>
                                </Col>
                                <Col>
                                <Button
                size="sm"
                variant="primary"
                onClick={() =>
                    this.updateDepartment()
                }
            >
                Save
            </Button>
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
                            <h4>Are you sure you want to delete this department?</h4>



                       
                        <Table>
                                <Tbody>
                                    <Tr key={0}>
                                        <Td>                    <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                    this.closeDeleteDialog()
                }
            >
                Dismiss
            </Button></Td>
                                        <Td>                     <Button
                size="sm"
                variant="primary"
                onClick={() =>
                    this.deleteDepartment()
                }
            >
                Delete
            </Button></Td>
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

export default Departments;