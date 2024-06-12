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
class FileTemplates extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            template_list: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            new_filename:'',
            new_filetype:'',
            update_filetype:'',
            updated_file_name:'',
            delete_file_name:'',
            delete_file_id:'',
            update_file_id:'',
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
        let apiResponse = await APIService.makeApiGetRequest("templates");
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
            delete_file_id: row.id,
            delete_file_name: row.name
        }); 
    }
    onClickTemplateSelected(row){
        this.setState({
            update_file_id:row.id,
            update_filetype:row.type,
            updated_file_name:row.name,
            data: row.data
            
        });
        this.openUpdateDialog();
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

        if(!privilegeList.includes("delete_file_template")){
            this.setState({ show_progress_status: false });
            notification.addNotification({
              message: "You do not have the rights to delete a template. Please contact your Systems Administrator",
              level: 'error',
              autoDismiss: 5
            });  
        }else{
          let params = {};
          params["id"] = this.state.delete_file_id;
    
          let result = await APIService.makePostRequest("templates/delete", params);
          if (result.success) {
            notification.addNotification({
                message: result.message,
                level: 'success',
                autoDismiss: 5
              });
              this.closeDeleteDialog();
              this.setState({
                delete_file_id:'',
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
    handlerTypeChange(e) {
        this.setState({
            new_filetype: e.target.value
        });
    }
    uploadFile = async e => {
        const notification = this.notificationSystem.current;
        
          //check permissions
          let privilegeList = [];
          let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
          for(let k in privileges){
             
              privilegeList.push(privileges[k].mprivileges.privilege_name);
          }
  
          if(!privilegeList.includes("create_file_template")){
              this.setState({ show_progress_status: false });
              notification.addNotification({
                message: "You do not have the rights to create a template. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
              });  
          }else{
  
        this.setState({
            show_progress_status: true,
            open: false
        });
        const files = e.target.files;
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("type", this.state.new_filetype);
        formData.append("name", this.state.new_filename);
        formData.append("id", "");
    
        // clear the value
        e.target.value = null;
    
        let response = await APIService.uploadFile("templates/save", formData);
        console.log(response);
        if (response) {
        
          if (response.data && response.data.success) {
            notification.addNotification({
              message: response.data.message,
              level: 'success',
              autoDismiss: 5
            });
             this.setState({
               new_filename:'',
               new_filetype:'',
               show_actions:false,
             })
            // get uploaded clients
            this.getTemplates();
          } else {
            notification.addNotification({
              message: response.response.data.message,
              level: 'error',
              autoDismiss: 5
            });
          }
          this.setState({
            show_progress_status: false
          });
        } else {
          notification.addNotification({
            message: 'Something went wrong',
            level: 'error',
            autoDismiss: 5
          });
          this.setState({
            show_progress_status: false
          });
        }
    }
    
      };

      updateTemplate = async e => {
        const notification = this.notificationSystem.current;
        
          //check permissions
          let privilegeList = [];
          let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
          for(let k in privileges){
             
              privilegeList.push(privileges[k].mprivileges.privilege_name);
          }
  
          if(!privilegeList.includes("update_file_template")){
              this.setState({ show_progress_status: false });
              notification.addNotification({
                message: "You do not have the rights to update a template. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
              });  
          }else{
  
        this.setState({
            show_progress_status: true,
        });
        this.closeUpdateDialog();
        const files = e.target.files;
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("type", this.state.update_filetype);
        formData.append("name", this.state.updated_file_name);
        formData.append("id", this.state.update_file_id);
    
        // clear the value
        e.target.value = null;
    
        let response = await APIService.uploadFile("templates/save", formData);
        console.log(response);
        if (response) {
        
          if (response.data && response.data.success) {
            notification.addNotification({
              message: response.data.message,
              level: 'success',
              autoDismiss: 5
            });
             this.setState({
               new_filename:'',
               new_filetype:'',
               show_actions:false,
             })
            // get uploaded clients
            this.getTemplates();
          } else {
            notification.addNotification({
              message: response.response.data.message,
              level: 'error',
              autoDismiss: 5
            });
          }
          this.setState({
            show_progress_status: false
          });
        } else {
          notification.addNotification({
            message: 'Something went wrong',
            level: 'error',
            autoDismiss: 5
          });
          this.setState({
            show_progress_status: false
          });
        }
    }
    
      };
    render() {
        return (
            <Aux>
                  {this.state.show_progress_status && (<SpinnerDiv>
          <CircularProgress />
        </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
                <Row>
                    <Col>
                    <Card title='File Templates' isOption>
                          
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
                                <Th>Name</Th>
                                <Th>Type</Th>
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
                                            {u.name}
                                        </Td>
                                        <Td>
                                            {u.type == 'lar' ? 'Land Aquisition Request' : 'Temporary Contract Request'}
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
                            <h3>Upload file</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="File name" value={this.state.new_filename} onChange={e => this.handleChange(e, "new_filename")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.new_filetype}
                                            onChange={this.handlerTypeChange.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select template type
                                            </option>
                                            <option value="lar">
                                                Land Aquisition Request
                                            </option>

                                            <option value="tcr">
                                                Temporary Contract Request
                                            </option>
                                        </select>

                                    </div>
                                    <input
                      type="file"
                      id="myfile"
                      className="hidden"
                      style={{
                        display: "none",
                        cursor: "pointer"
                      }}
                      onChange={e => this.uploadFile(e)}
                    />
                    <label
                      htmlFor="myfile"
                      style={{
                        position: "relative",
                        top: "3px",
                        width: "193px",
                        height: "34px",
                        fontSize: "15px",
                        textAlign: "center",
                        backgroundColor: "rgb(0, 153, 51)",
                        color: "white",
                        borderRadius: ".25em",
                        cursor: "pointer",
                        padding: "6px 12px"
                      }}
                    >

                      Upload File
                    </label>
                                </Col>
                            </Row>


                        </div>
                        
                       
                    </div>

                                         
                </Dialog>

                <Dialog
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    maxWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Update Template</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="File name" value={this.state.updated_file_name} onChange={e => this.handleChange(e, "updated_file_name")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.update_filetype}
                                            onChange={e => this.handleChange(e, "update_filetype")}
                                        >
                                            <option value="">
                                                Select template type
                                            </option>
                                            <option value="lar">
                                                Land Aquisition Request
                                            </option>

                                            <option value="tcr">
                                                Temporary Contract Request
                                            </option>
                                        </select>

                                    </div>
                                </Col>
                            </Row>
                            <Row>
                            <div className="card-body text-center">
                                            <center>
                                                <embed src={`data:application/pdf;base64,${this.state.data}`} height={500} width={800} />
                                            </center>
                                        </div>
                            </Row>
                            <div className="card-body text-center">
                            <Row>
                            <input
                      type="file"
                      id="myfile"
                      className="hidden"
                      style={{
                        display: "none",
                        cursor: "pointer"
                      }}
                      onChange={e => this.updateTemplate(e)}
                    />
                    <label
                      htmlFor="myfile"
                      style={{
                        position: "relative",
                        top: "3px",
                        width: "193px",
                        height: "34px",
                        fontSize: "15px",
                        textAlign: "center",
                        backgroundColor: "rgb(0, 153, 51)",
                        color: "white",
                        borderRadius: ".25em",
                        cursor: "pointer",
                        padding: "6px 12px"
                      }}
                    >

                      Update Template
                    </label>
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
                            <h3>{this.state.delete_file_name}</h3>
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

export default FileTemplates;