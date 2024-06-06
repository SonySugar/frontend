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
import { FaTimes, FaSave, FaDoorOpen, Fa } from 'react-icons/fa';

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
class TicketConfigs extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            categories: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            new_category_name:'',
            new_mail_to:'',
            updated_category_name:'',
            update_category_id:'',
            updated_description:'',
            category_name: '',
            description: '',
            _notificationSystem: null,
            role:'',
            updated_role:'',
            cat_id:'',
            selectedflag:'',
            category_name: '',
            category_to_be_deleted: '',
            hidedialog:false,
            show_progress_status:false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getCategories();
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
    async getCategories() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("farmers/ticket_category");
            if (apiResponse.status == 403) {
                this.setState({ closesession: true });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }else{
               
                    this.setState({ categories: apiResponse });
                 
                    
            }
       
    }
     
      cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickCategorySelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update category' />
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
    
    onClickCategorySelected(row){
        this.setState({
            updated_category_name:row.category,
            updated_description: row.description,
            update_category_id:row.id,
            
        });
        this.openUpdateDialog();
    }
    
    async saveCategory(){
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        if (this.state.category_name == null || this.state.category_name === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter category name',
            level: 'warning',
            autoDismiss: 5
          });
        }else  if (this.state.description == null || this.state.description === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter description',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["category"] = this.state.category_name
          params["description"] = this.state.description
    
          let result = await APIService.makePostRequest("ticket_category/save", params);
          if (result.success) {
            notification.addNotification({
                message: 'Category saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeAddDialog();
              this.setState({
                category:'',
                description:''
              });
              this.getCategories();
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
    async updateCategory(){
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

          //check permissions
          let privilegeList = [];
          let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
          for(let k in privileges){
             
              privilegeList.push(privileges[k].mprivileges.privilege_name);
          }
       if(!privilegeList.includes("update_ticket_configs")){
           this.setState({ show_progress_status: false });
           notification.addNotification({
             message: "You do not have the rights to update ticket category. Please contact your Systems Administrator",
             level: 'error',
             autoDismiss: 5
           });  
       }else{
        if (this.state.updated_category_name == null || this.state.updated_category_name === '') {
          this.setState({ loggingIn: false });
    
          notification.addNotification({
            message: 'Please enter category name',
            level: 'warning',
            autoDismiss: 5
          });
        }else if(this.state.updated_description == null || this.state.updated_description === '') {
            this.setState({ loggingIn: false });
      
            notification.addNotification({
              message: 'Please enter description',
              level: 'warning',
              autoDismiss: 5
            });
          }else {
    
          let params = {};
          params["category"] = this.state.updated_category_name;
          params["description"] = this.state.updated_description
          params["id"] = this.state.update_category_id;
    
          let result = await APIService.makePostRequest("ticket_category/save", params);
          if (result.success) {
            notification.addNotification({
                message: 'Category saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeUpdateDialog();
              this.setState({
                updated_category_name:'',
                updated_mail_to:'',
                update_category_id:''
              });
              this.getCategories();
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
    deleteButton(row) {
        const { classes } = this.props;
        return (


<IconButton onClick={() =>
    this.confirmDeleteCategory(row)
}>

    <DeleteIcon style={{ color: "red" }} titleAccess='Delete category' />

</IconButton>
        );
    }
    confirmDeleteCategory(row) {
        this.openDeleteCategory(row);
    }
    openDeleteCategory(row) {
        this.setState({
            openDelete: true,
            category_name: row.category,
            category_to_be_deleted: row.id
        })
    }
    async deleteCategory() {
        this.closeDeleteDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

          //check permissions
          let privilegeList = [];
          let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
          for(let k in privileges){
             
              privilegeList.push(privileges[k].mprivileges.privilege_name);
          }
          console.log(privilegeList)

        if (!privilegeList.includes("delete_category")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to delete a ticket category. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["id"] = this.state.category_to_be_deleted


            let result = await APIService.makePostRequest("ticket_category/delete", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeDeleteDialog();
                this.setState({
                    category_to_be_deleted: ''
                });
                this.getCategories();
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
                    <Card title='Ticket Categories' isOption>
                    <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                    this.openAddDialog()
                }
            >
                Create Category
            </Button>   

  <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Category</Th>
                                <Th>Description</Th>
                                <Th>Created by</Th>
                                <Th>Update</Th>
                                <Th>Delete</Th>
                                
                            </Tr>

                        </Thead>
                        {this.state.categories==null ||this.state.categories.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                {this.state.type==null || this.state.type==""?
                                <Td style={{color:'red'}}>No data available....</Td>:<Td style={{color:'blue'}}>Loading ....</Td>}
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.categories.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.category}
                                        </Td>
                                        <Td>
                                            {u.description}
                                        </Td>
                                        <Td>
                                            {u.system_user !== null ? u.system_user.username: "System"}
                                        </Td>
                                        <Td>
                                        {this.cellButton(u)}
                                        </Td>  
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
                            <h3>Create Category</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Category name" value={this.state.category_name} onChange={e => this.handleChange(e, "category_name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description" value={this.state.description} onChange={e => this.handleChange(e, "description")} />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                            <Col>
                            <div className="card-body text-center">
                                <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeAddDialog() }}>Dismiss</button>
                            </div>
                            </Col>
                            <Col>
                            <div className="card-body text-center">
                                <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.saveCategory() }}>Save</button>
                            </div>
                            </Col>
                        </Row> 
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
                            <h3>Update Category</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Category name" value={this.state.updated_category_name} onChange={e => this.handleChange(e, "updated_category_name")}/>
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description" value={this.state.updated_description} onChange={e => this.handleChange(e, "updated_description")} />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                            <Col>
                                    <IconButton onClick={() => { this.closeUpdateDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.updateCategory() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                                </Row> 
                        </div>
                        
                       
                    </div>

                                         
                </Dialog>
                <Dialog
                    open={this.state.openDelete}

                    fullWidth

                >

                    <div className="card">
                        <center>
                        </center>
                        <div className="card-body text-center">
                            <h3>{this.state.category_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this category?</h4>

                         
                                    <Row key={0}>
                                        <Col>                    <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                    this.closeDeleteDialog()
                }
            >
                Dismiss
            </Button></Col>
                                        <Col>                     <Button
                size="sm"
                variant="primary"
                onClick={() =>
                    this.deleteCategory()
                }
            >
                Delete category
            </Button></Col>
                                    </Row>
                                

                        </div>
                     


                    </div>

                </Dialog>
            </Aux>
            
        );
    }
}

export default TicketConfigs;