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
class Merchants extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            merchant_list: [],
            template_list: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            new_merchant_name:'',
            updated_merchant_name:'',
            update_merchant_id:'',
            updated_status: false,
            contact: '',
            description: '',
            email: '',
            website: '',
            template:'',
            updated_contact: '',
            updated_email: '',
            updated_website: '',
            updated_description: '',
            updated_template:'',
            _notificationSystem: null,
            show_progress_status:false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getMerchants();
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
    async getMerchants() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("merchants");
            if (apiResponse.status == 403) {
                this.setState({ closesession: true });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }else{
               
                    this.setState({ merchant_list: apiResponse });
                    await this.getTemplates();
                    
            }
       
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
                this.onClickMerdchantSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update merchant' />
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
    onClickMerdchantSelected(row){
        this.setState({
            updated_merchant_name:row.name,
            update_merchant_id:row.id,
            updated_status:row.active,
            updated_contact:row.contact,
            updated_email:row.email,
            updated_website:row.website,
            updated_description:row.description,
            updated_template: row.template_id
            
        });
        this.openUpdateDialog();
    }
    

    async saveMerchant(){
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

       
        if (this.state.new_merchant_name == null || this.state.new_merchant_name === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter merchant name',
            level: 'warning',
            autoDismiss: 5
          });
        }else if (this.state.email == null || this.state.email === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter merchant email',
            level: 'warning',
            autoDismiss: 5
          });
        }else if (this.state.contact == null || this.state.contact === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter a valid phone number/contact',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
            params["name"] = this.state.new_merchant_name;
            params["contact"] = this.state.contact;
            params["description"] = this.state.description;
            params["email"] = this.state.email;
            params["website"] = this.state.website;
            params["template_id"] = parseInt(this.state.template);
    
          let result = await APIService.makePostRequest("merchant/save", params);
          if (result.success) {
            notification.addNotification({
                message: 'Merchant saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeAddDialog();
              this.setState({
                  new_merchant_name:''
              });
              this.getMerchants();
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
    async updateMerchant(){
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        
        if (this.state.updated_merchant_name == null || this.state.updated_merchant_name === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter merchant name',
            level: 'warning',
            autoDismiss: 5
          });
        }else if (this.state.updated_email == null || this.state.updated_email === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter merchant email',
            level: 'warning',
            autoDismiss: 5
          });
        }else if (this.state.updated_contact == null || this.state.updated_contact === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter a valid phone number/contact',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["name"] = this.state.updated_merchant_name
          params["id"] = this.state.update_merchant_id;
          params["contact"] = this.state.updated_contact;
          params["description"] = this.state.updated_description;
          params["email"] = this.state.updated_email;
          params["website"] = this.state.updated_website;
          params["active"] = this.state.updated_status;
          params["template_id"] = this.state.updated_template;
    
          let result = await APIService.makePostRequest("merchant/update", params);
          if (result.success) {
            notification.addNotification({
                message: 'Merchant saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeUpdateDialog();
              this.setState({
                updated_merchant_name:'',
                update_merchant_id:'',
                updated_template:'',
                updated_description:'',
                updated_contact:'',
                updated_website:'',
                updated_email:'',
                
              });
              this.getMerchants();
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
    handlerStatusChange(e) {
        this.setState({
            updated_status: e.target.value
        });
    }

    handlerTemplateChanges(e) {
        this.setState({
            template: e.target.value
        });
    }

    handlerUpdateTemplateChanges(e) {
        this.setState({
            updated_template: e.target.value
        });
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
                    <Card title='Merchants' isOption>
                          
                    <IconButton  onClick={() =>
                                    this.openAddDialog()
                                }>
                                <FaPlusCircle  style={{ color: "#04a9f5" }} size={50} title='Add department'/>
                            </IconButton>
                           
  <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Name</Th>
                                <Th>Active</Th>
                                <Th>Charges</Th>
                                <Th>Update</Th>
                                

                            </Tr>

                        </Thead>
                        {this.state.merchant_list==null || this.state.merchant_list.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>Loading ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.merchant_list.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.name}
                                        </Td>
                                        <Td>
                                            {u.active ? 'Yes' : 'No'}
                                        </Td>
                                        <Td>
                                            {u.charge_template.name}
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
                            <h3>Create Merchant</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Merchant name" value={this.state.new_merchant_name} onChange={e => this.handleChange(e, "new_merchant_name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Contact" value={this.state.contact} onChange={e => this.handleChange(e, "contact")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description" value={this.state.description} onChange={e => this.handleChange(e, "description")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Email address" value={this.state.email} onChange={e => this.handleChange(e, "email")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Website" value={this.state.website} onChange={e => this.handleChange(e, "website")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Attach a charge configuration</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.template}
                                            onChange={this.handlerTemplateChanges.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select a template
                                            </option>
                                            {this.state.template_list.map(
                                                (r, index) => (
                                                    <option
                                                        key={index}
                                                        value={r.id}
                                                    >
                                                        {r.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
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
                                    <IconButton onClick={() => { this.saveMerchant() }}>
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

                        <div className="card-body text-start">
                            <h3>Update Merchant</h3>
                            <Row>
                               
                                <Col>
                                    <label style={{ color: '#000000' }}><b>Merchant name</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Merchant name" value={this.state.updated_merchant_name} onChange={e => this.handleChange(e, "updated_merchant_name")} />
                                    </div>

                                    <label style={{ color: '#000000' }}><b>Merchant contact</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Merchant contact" value={this.state.updated_contact} onChange={e => this.handleChange(e, "updated_contact")} />
                                    </div>

                                    <label style={{ color: '#000000' }}><b>Merchant description</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Merchant description" value={this.state.updated_description} onChange={e => this.handleChange(e, "updated_description")} />
                                    </div>

                                    <label style={{ color: '#000000' }}><b>Merchant email address</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Merchant email address" value={this.state.updated_email} onChange={e => this.handleChange(e, "updated_email")} />
                                    </div>

                                    <label style={{ color: '#000000' }}><b>Merchant website</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Merchant website" value={this.state.updated_website} onChange={e => this.handleChange(e, "updated_website")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Attach a charge configuration</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.updated_template}
                                            onChange={this.handlerUpdateTemplateChanges.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select a template
                                            </option>
                                            {this.state.template_list.map(
                                                (r, index) => (
                                                    <option
                                                        key={index}
                                                        value={r.id}
                                                    >
                                                        {r.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Merchant status</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.updated_status}
                                            onChange={this.handlerStatusChange.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select Merchant Status
                                            </option>
                                            <option value={false}>
                                                Inactive
                                            </option>

                                            <option value={true}>
                                                Active
                                            </option>
                                        </select>

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
                                    <IconButton onClick={() => { this.updateMerchant() }}>
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
                    <center>
                  <Lottie
                    loop
                    animationData={lottieJson}
                    play
                    style={{ width: 50, height: 50 }}
                  />
                </center>
                        <div className="card-body text-center">
                            <h3>{this.state.delete_dept_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this department?</h4>



                       
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

export default Merchants;