import React from 'react';
import { Row, Col } from 'react-bootstrap';
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

import { FaTimes, FaSave, FaDoorOpen } from 'react-icons/fa';
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
class SchedularSettings extends React.Component {
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
            autostart:'',
            autostop:'',
            modified_by:'',
            _notificationSystem: null,
           
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
        let apiResponse = await APIService.makeApiGetRequest("shcedular_auto_setting/list");
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
    
      cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickConfigSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update' />
            </IconButton>

        );
    }
    autoModifier(val){
        if(val){
            return "True";
        }else{
            return "False";
        }
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
    onClickConfigSelected(row){
        let start = "false";
        let stop = "false";
        if(row.automatically_start==true){
            start = "true";
        }

        if(row.automatically_stop==true){
            stop = "true";
        }
        this.setState({
            id:row.id,
            autostop:stop,
            autostart:start,
            modified_by:row.modified_by,
          
            
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
          params["start"] = this.state.autostart;
          params["stop"] = this.state.autostop;

    
          let result = await APIService.makePostRequest("shcedular_auto_setting", params);
          if (result.success) {
            notification.addNotification({
                message: result.message,
                level: 'success',
                autoDismiss: 5
              });
              this.closeUpdateDialog();
              this.setState({
                id:'',
            autostart:'',
            autostop:'',
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
    handlerStartChange(e){
        this.setState({
        autostart:e.target.value
      });
      }

      handlerStopChange(e){
        this.setState({
        autostop:e.target.value
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
                    <Card title='Schedular settings' isOption>
                          
                    

  <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Auto start</Th>
                                <Th>Auto stop</Th>
                                <Th>Modified by</Th>
                                <Th>Update</Th>
                               

                            </Tr>

                        </Thead>
                        {this.state.configs==null || this.state.configs.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>Loading ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.configs.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {this.autoModifier(u.automatically_start)}
                                        </Td>
                                        <Td>
                                            {this.autoModifier(u.automatically_stop)}
                                        </Td>
                                        <Td>
                                            {u.modified_by}
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
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">
                        
                    <center><h3>Update Schedular settings</h3></center>
                        <div className="card-body text-left">
                           
                            <Row>
                               
                                <Col>
                                    
                                    <label style={{ color: '#000000' }}><b>Automatically start approved scheduled trainings</b></label>
                                    <div className="input-group mb-3">
                                    <select
                                        className="form-control"
                                        value={this.state.autostart}
                                        onChange={this.handlerStartChange.bind(
                                            this
                                        )}
                                      >
                                        <option value="">
                                          Select auto start options
                                        </option>
                                        <option value="true">
                                        Yes
                                        </option>

                                        <option value="false">
                                        No
                                        </option>
                                      </select>
                                     
                                    </div>

                                    <label style={{ color: '#000000' }}><b>Automatically stop scheduled trainings in session</b></label>
                                    <div className="input-group mb-3">
                                    <select
                                        className="form-control"
                                        value={this.state.autostop}
                                        onChange={this.handlerStopChange.bind(
                                            this
                                        )}
                                      >
                                        <option value="">
                                          Select autostop options
                                        </option>
                                        <option value="true">
                                        Yes
                                        </option>

                                        <option value="false">
                                        No
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
                                    <IconButton onClick={() => { this.updateConfigs() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                                </Row>
                                </div> 
                        </div>
                        
                       
                    </div>

                                         
                </Dialog>
               
            </Aux>
            
        );
    }
}

export default SchedularSettings;