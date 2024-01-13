import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
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
class ChargeTemplates extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            template_list: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            name:'',
            type:'',
            description:'',
            charge:'',
            updated_name:'',
            updated_type:'',
            updated_description:'',
            updated_charge:'',
            id: '',
            _notificationSystem: null,
            show_progress_status: false
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
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update region' />
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
    openDeleteDialog(cell, row, enumObject, rowIndex){
        this.setState({ 
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        }); 
    }
    onClickTemplateSelected(row){
        this.setState({
            updated_name:row.name,
            id:row.id,
            updated_description:row.description,
            updated_type:row.type,
            updated_charge:row.charge            
        });
        this.openUpdateDialog();
    }
    

    async saveTemplate(){
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        if (this.state.name == null || this.state.name === '') {
            this.setState({ show_progress_status: false });
    
          notification.addNotification({
            message: 'Please enter name',
            level: 'warning',
            autoDismiss: 5
          });
        }else {
    
          let params = {};
          params["name"] = this.state.name;
          params["type"] = this.state.type;
          params["description"] = this.state.description;
          params["charge"] = this.state.charge;
    
          let result = await APIService.makePostRequest("template/save", params);
          if (result.success) {
            notification.addNotification({
                message: 'Configuration saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeAddDialog();
              this.setState({
                  name:''
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
    async updateTemplate(){
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
          
    
          let params = {};
          params["name"] = this.state.updated_name;
          params["charge"] = this.state.updated_charge;
          params["description"] = this.state.updated_description;
          params["type"] = this.state.updated_type;
          params["id"] = this.state.id;
    
          let result = await APIService.makePostRequest("template/update", params);
          if (result.success) {
            notification.addNotification({
                message: 'Configuration saved',
                level: 'success',
                autoDismiss: 5
              });
              this.closeUpdateDialog();
              this.setState({
                name:'',
                id:''
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
    handlerTypeChange(e) {
        this.setState({
            type: e.target.value
        });
    }
    handlerUpdatedTypeChange(e) {
        this.setState({
            updated_type: e.target.value
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
                    <Card title='Charges configuration' isOption>
                          

  <IconButton  onClick={() =>
                                    this.openAddDialog()
                                }>
                                <FaPlusCircle  style={{ color: "#04a9f5" }} size={50} title='Add template'/>
                            </IconButton>
                           
  <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Name</Th>
                                <Th>Type</Th>
                                <Th>Charge</Th>
                                <Th>Update</Th>

                            </Tr>

                        </Thead>
                        {this.state.template_list==null||this.state.template_list.length == 0 ? <Tbody>
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
                                            {u.type}
                                        </Td>
                                        <Td>{u.charge}</Td>
                                  
                                        
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
                    <center>
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

                        <div className="card-body text-left">
                            <h3>Charge configuration</h3>
                            <Row>
                               
                                <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Name" value={this.state.name} onChange={e => this.handleChange(e, "name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description" value={this.state.description} onChange={e => this.handleChange(e, "description")} />
                                    </div>
                                    
                                    <div className="input-group mb-3">
                                        <input type="number" className="form-control" style={{ color: '#000000' }} placeholder="Charge" value={this.state.charge} onChange={e => this.handleChange(e, "charge")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Charge type</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.type}
                                            onChange={this.handlerTypeChange.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select Charge Type
                                            </option>
                                            <option value="percentage">
                                                Percentage
                                            </option>

                                            <option value="standard">
                                                Standard Fee
                                            </option>
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
                                    <IconButton onClick={() => { this.saveTemplate() }}>
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
                            <h3>Update Template</h3>
                            <Row>
                               
                            <Col>
                                    
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Name" value={this.state.updated_name} onChange={e => this.handleChange(e, "updated_name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="email" className="form-control" style={{ color: '#000000' }} placeholder="Description" value={this.state.updated_description} onChange={e => this.handleChange(e, "updated_description")} />
                                    </div>
                                    
                                    <div className="input-group mb-3">
                                        <input type="number" className="form-control" style={{ color: '#000000' }} placeholder="Charge" value={this.state.updated_charge} onChange={e => this.handleChange(e, "updated_charge")} />
                                    </div>
                                   
                                    <div className="input-group mb-3">
                                    <select
                                        className="form-control"
                                        value={this.state.updated_type}
                                        onChange={this.handlerUpdatedTypeChange.bind(
                                            this
                                        )}
                                      >
                                        <option value="">
                                        Select Charge Type
                                        </option>
                                        <option value="percentage">
                                        Percentage
                                        </option>
                                        <option value="standard">
                                        Standard Fee
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
                                    <IconButton onClick={() => { this.updateTemplate() }}>
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



                        </div>
                        <div className="card-body text-center">
                            <Row>
                            <Col>
                                    <IconButton onClick={() => { this.closeDeleteDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='green' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.activateDeactivateCorporate() }}>
                                        <FaSave color='red' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                                </Row>
                                </div>


                    </div>

                </Dialog>
            </Aux>
            
        );
    }
}

export default ChargeTemplates;