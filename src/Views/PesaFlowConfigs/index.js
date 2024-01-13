import React from 'react';
import { Row, Col, Table, Button } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog, DialogContent, DialogActions } from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import Authenticatonservice from '../../service/Authenticatonservice';

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
class PesaFlowConfigs extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            configs: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            id:'',
            api_key:'',
            api_secret:'',
            service_id:'',
            client_id:'',
            merchant_id:'',
            notification_url:'',
            ecitizen_payment_api:'',
            ecitizen_status_api:'',
            callback_url:'',
            _notificationSystem: null,
            role:'',
            
            show_progress_status:false,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getConfigs();
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
    async getConfigs() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("ecitizenconfig/list");
            if (apiResponse.status == 403) {
                this.setState({ closesession: true });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }else{
               
                    this.setState({ configs: apiResponse });
                 
                    
            }
       
    }
    
      cellButton(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <Button
            size="sm"
            variant="primary"
            onClick={() =>
                this.onClickConfigSelected(cell, row, enumObject, rowIndex)
            }
        >
            Update
        </Button>

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
    onClickConfigSelected(cell, row, enumObject, rowIndex){
        this.setState({
            id:row.id,
            client_id:row.client_id,
            service_id:row.service_id,
            callback_url:row.callback_url,
            api_secret: row.api_secret,
            api_key: row.api_key,
            merchant_id: row.merchant_id,
            notification_url: row.notification_url,
            ecitizen_payment_api:row.ecitizen_payment_api,
            ecitizen_status_api:row.ecitizen_status_api
            
        });
        this.openUpdateDialog();
    }
    

    async updateConfigs(){
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
 
         //check permissions
         let privilegeList = [];
         let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
         for(let k in privileges){
            
             privilegeList.push(privileges[k].mprivileges.privilege_name);
         }
 
         if(!privilegeList.includes("update_api_configurations")){
             this.setState({ show_progress_status: false });
             notification.addNotification({
               message: "You do not have the rights to make any updates. Please contact your Systems Administrator",
               level: 'error',
               autoDismiss: 5
             });  
         }else{
          let params = {};
          params["id"] = this.state.id;
          params["service_id"] = this.state.service_id;
          params["api_key"] = this.state.api_key;
          params["callback_url"] = this.state.callback_url;
          params["api_secret"] = this.state.api_secret;
          params["merchant_id"] = this.state.merchant_id;
          params["client_id"] = this.state.client_id;
          params["notification_url"] = this.state.notification_url;
          params["status_url"] = this.state.ecitizen_status_api;
          params["payment_url"]=this.state.ecitizen_payment_api;
    
          let result = await APIService.makePostRequest("ecitizenconfig/update", params);
          if (result.success) {
            notification.addNotification({
                message: result.message,
                level: 'success',
                autoDismiss: 5
              });
              this.closeUpdateDialog();
              this.setState({
                id:'',
                service_id:'',
                api_key:'',
                callback_url:'',
                api_secret:'',
                merchant_id: '',
                client_id: '',
                notification_url: '',
                ecitizen_status_api: '',
                ecitizen_payment_api:'',
              });
              this.getConfigs();
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
    handlerTypeChange(e){
        this.setState({
          trx_type:e.target.value
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
                    <Card title='Ecitizen Configurations' isOption>
                          
                        
                            <BootstrapTable data={this.state.configs} striped hover>
      <TableHeaderColumn isKey dataField='id' hidden>ID</TableHeaderColumn>
      <TableHeaderColumn dataField='client_id'>Client Id</TableHeaderColumn>
      <TableHeaderColumn dataField='service_id'>Service Id</TableHeaderColumn>
      <TableHeaderColumn dataField='api_key'>Key</TableHeaderColumn>
      <TableHeaderColumn dataField='api_secret'>API Secret</TableHeaderColumn>
      

      <TableHeaderColumn
                                         
                                            thStyle={{ verticalAlign: "top" }}
                                            dataField="button"
                                            dataFormat={this.cellButton.bind(this)}
                                        >
                                            Update Action
                        </TableHeaderColumn>
                    
  </BootstrapTable>
                            
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
                            <button className="btn btn-danger shadow-2 mb-4" onClick={() => { this.logout() }}>Exit</button>
                        </div>


                    </div>

                </Dialog>

               

                <Dialog
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">
                        
                    <center><h3>Update Ecitizen API Configurations</h3></center>
                        <div className="card-body text-left">
                           
                            <Row>
                               
                                <Col>
                                   <label style={{ color: '#000000' }}><b>Client Id</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Client Id" value={this.state.client_id} onChange={e => this.handleChange(e, "client_id")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Merchant Id</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Merchant Id" value={this.state.merchant_id} onChange={e => this.handleChange(e, "merchant_id")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Service Id</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Service Id" value={this.state.service_id} onChange={e => this.handleChange(e, "service_id")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Api Key</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Api Key" value={this.state.api_key} onChange={e => this.handleChange(e, "api_key")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Api Secret</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Api Secret" value={this.state.api_secret} onChange={e => this.handleChange(e, "api_secret")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Payment endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Payment endpoint" value={this.state.ecitizen_payment_api} onChange={e => this.handleChange(e, "ecitizen_payment_api")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Query transaction status endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Query transaction status endpoint" value={this.state.ecitizen_status_api} onChange={e => this.handleChange(e, "ecitizen_status_api")} />
                                    </div>

                                    <label style={{ color: '#000000' }}><b>Call back url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Call back url" value={this.state.callback_url} onChange={e => this.handleChange(e, "callback_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Notification endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Notification endpoint" value={this.state.notification_url} onChange={e => this.handleChange(e, "notification_url")} />
                                    </div>
                                  
                                </Col>
                            </Row>
                            <Row>
                            <Col>
                            <div className="card-body text-center">
                                <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeUpdateDialog() }}>Dismiss</button>
                            </div>
                            </Col>
                            <Col>
                            <div className="card-body text-center">
                                <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.updateConfigs() }}>Save</button>
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

export default PesaFlowConfigs;