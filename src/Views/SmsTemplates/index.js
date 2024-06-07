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
class SmsTemplates extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            template_list: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            new_template:'',
            new_title:'',
            new_description:'',
            update_title:'',
            update_template:'',
            update_description:'',
            delete_title:'',
            delete_template_id:'',
            update_template_id:'',
            _notificationSystem: null,
            show_progress_status:false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getTemplates();
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
    async getTemplates() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("sms_templates");
            if (apiResponse.status == 403) {
                this.setState({ closesession: true });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }else{
               
                    this.setState({ template_list: apiResponse });
                 
                    
            }
       
    }
     getTemplate(cell, row) {
        return cell.title;
      }
      getRole(cell, row) {
        return cell.role_name;
      }
      cellButton(row) {
       
        return (

            <IconButton onClick={() =>
                this.onClickTemplateSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update template' />
            </IconButton>


        );
    }
    deleteButton(row) {
        const { classes } = this.props;
        return (

           <IconButton onClick={() =>
                this.openDeleteDialog(row)
            }>

                <DeleteIcon style={{ color: "red" }} titleAccess='Delete template' />

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
            delete_template_id: row.id,
            delete_title: row.title
        }); 
    }
    onClickTemplateSelected(row){
        this.setState({
            update_template_id:row.id,
            update_title:row.title,
            update_template:row.template,
            update_description:row.description
            
        });
        this.openUpdateDialog();
    }
    

    async saveTemplate(){
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

         //check permissions
         let privilegeList = [];
         let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
         for(let k in privileges){
            
             privilegeList.push(privileges[k].mprivileges.privilege_name);
         }
 
         if(!privilegeList.includes("create_sms_template")){
             this.setState({ show_progress_status: false });
             notification.addNotification({
               message: "You do not have the rights to create an sms template. Please contact your Systems Administrator",
               level: 'error',
               autoDismiss: 5
             });  
         }else{
        if (this.state.new_title == null || this.state.new_title === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter department name',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["title"] = this.state.new_title;
            params["template"] = this.state.new_template;
            params["description"] = this.state.new_description;
    
          let result = await APIService.makePostRequest("sms_template/save", params);
          if (result.success) {
            notification.addNotification({
                message: 'Template saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeAddDialog();
              this.setState({
                  new_title:'',
                    new_template:'',
                    new_description:''
              });
              this.getTemplates();
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
    async updateTemplate(){
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

         //check permissions
         let privilegeList = [];
         let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
         for(let k in privileges){
            
             privilegeList.push(privileges[k].mprivileges.privilege_name);
         }
 
         if(!privilegeList.includes("update_sms_template")){
             this.setState({ show_progress_status: false });
             notification.addNotification({
               message: "You do not have the rights to make any updates to an sms template. Please contact your Systems Administrator",
               level: 'error',
               autoDismiss: 5
             });  
         }else{
        if (this.state.update_title == null || this.state.update_title === '') {
          this.setState({ loggingIn: false });
    
          notification.addNotification({
            message: 'Please enter department name',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["title"] = this.state.update_title
          params["id"] = this.state.update_template_id;
            params["template"] = this.state.update_template;
            params["description"] = this.state.update_description;
    
          let result = await APIService.makePostRequest("sms_template/save", params);
          if (result.success) {
            notification.addNotification({
                message: 'Template saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeUpdateDialog();
              this.setState({
                update_title:'',
                update_template_id:'',
                update_template: '',
                update_description: ''
              });
              this.getTemplates();
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
    async deleteTemplate(){
        this.closeDeleteDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

          //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for(let k in privileges){
           
            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if(!privilegeList.includes("delete_sms_template")){
            this.setState({ show_progress_status: false });
            notification.addNotification({
              message: "You do not have the rights to delete an sms template. Please contact your Systems Administrator",
              level: 'error',
              autoDismiss: 5
            });  
        }else{
          let params = {};
          params["id"] = this.state.delete_template_id;
    
          let result = await APIService.makePostRequest("sms_template/delete", params);
          if (result.success) {
            notification.addNotification({
                message: 'Template deleted',
                level: 'success',
                autoDismiss: 5
              });
              this.closeDeleteDialog();
              this.setState({
                update_template_id:'',
                update_description:'',
                update_title: '',
                update_template: ''
              });
              this.getTemplates();
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
                    <Card title='Templates' isOption>
                          
                    <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                    this.openAddDialog()
                }
            >
                Create Template
            </Button>
                           
  <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>title</Th>
                                <Th>Template</Th>
                                <Th>Update</Th>
                                <Th>Delete</Th>

                            </Tr>

                        </Thead>
                        {this.state.template_list==null || this.state.template_list.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>Loading ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.template_list.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.title}
                                        </Td>
                                        <Td>
                                            {u.template}
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
                            <h3>Create Template</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Title" value={this.state.new_title} onChange={e => this.handleChange(e, "new_title")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Template name e.g. Dear {name}, Please ensure that ..." value={this.state.new_template} onChange={e => this.handleChange(e, "new_template")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description of the template" value={this.state.new_description} onChange={e => this.handleChange(e, "new_description")} />
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
                    this.saveTemplate()
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
                            <h3>Update Template</h3>
                            <Row>
                               
                                <Col>
                                    
                                <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Title" value={this.state.update_title} onChange={e => this.handleChange(e, "update_title")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Template name e.g. Dear {name}, Please ensure that ..." value={this.state.update_template} onChange={e => this.handleChange(e, "update_template")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description of the template" value={this.state.update_description} onChange={e => this.handleChange(e, "update_description")} />
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
                    this.updateTemplate()
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
                            <h3>{this.state.delete_title}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this template?</h4>



                       
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
                    this.deleteTemplate()
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

export default SmsTemplates;