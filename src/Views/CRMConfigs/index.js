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
import EditIcon from '@material-ui/icons/Edit';

import { FaTimes, FaSave, FaDoorOpen } from 'react-icons/fa';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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
class CrmConfigs extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            configs: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            id: '',
            api_username: '',
            api_password: '',
            token_url: '',
            service_url: '',
            status_url: '',
            verification_url: '',
            categoriesurl:'',
            creation_url:'',
            _notificationSystem: null,


            show_progress_status: false,
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
        let apiResponse = await APIService.makeApiGetRequest("crmconfig/list");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ configs: apiResponse });


        }

    }

    cellButton(row) {

        return (

            <IconButton onClick={() =>
                this.onClickConfigSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update configs' />
            </IconButton>

        );
    }

    closeUpdateDialog() {
        this.setState({ openUpdate: false });
    }
    openUpdateDialog() {
        this.setState({ openUpdate: true });
    }

    closeAddDialog() {
        this.setState({ open: false });
    }
    openAddDialog() {
        this.setState({ open: true });
    }

    closeDeleteDialog() {
        this.setState({ openDelete: false });
    }
    openDeleteDialog(cell, row, enumObject, rowIndex) {
        this.setState({
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        });
    }
    onClickConfigSelected(row) {
        this.setState({
            id: row.id,
            api_username: row.apiusername,
            api_password: row.apipassword,
            token_url: row.tokenurl,
            service_url: row.serviceurl,
            status_url: row.ticketstatusurl,
            verification_url: row.verificationurl,
            categories: row.categoriesurl,
            creation_url: row.creationurl

        });
        this.openUpdateDialog();
    }


    async updateConfigs() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;


        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("update_api_configurations")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to make any updates. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {

            let params = {};
            params["id"] = this.state.id;
            params["api_username"] = this.state.api_username;
            params["api_password"] = this.state.api_password;
            params["service_url"] = this.state.service_url;
            params["token_url"] = this.state.token_url;
            params["status_url"] = this.state.status_url;
            params["verification_url"] = this.state.verification_url;
            params["categories_url"] = this.state.categories;
            params["creation_url"] = this.state.creation_url;

            let result = await APIService.makePostRequest("crmconfig/update", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeUpdateDialog();
                this.setState({
                    id: '',
                    api_username: '',
                    api_password: '',
                    service_url: '',
                    token_url: '',
                    categories_url:'',
                    creation_url:''
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
    handlerTypeChange(e) {
        this.setState({
            trx_type: e.target.value
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
                        <Card title='CRM Configurations' isOption>


                            {/*<BootstrapTable data={this.state.configs} striped hover>
      <TableHeaderColumn isKey dataField='id' hidden>ID</TableHeaderColumn>
      <TableHeaderColumn dataField='apiusername'>Username</TableHeaderColumn>
      <TableHeaderColumn dataField='apipassword'>Password</TableHeaderColumn>
      <TableHeaderColumn dataField='tokenurl'>Token endpoint</TableHeaderColumn>
      <TableHeaderColumn dataField='serviceurl'>Service endpoint</TableHeaderColumn>
      

      <TableHeaderColumn
                                         
                                            thStyle={{ verticalAlign: "top" }}
                                            dataField="button"
                                            dataFormat={this.cellButton.bind(this)}
                                        >
                                            Update Action
                        </TableHeaderColumn>
                    
                  </BootstrapTable>*/}

                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Username</Th>
                                        <Th>Password</Th>
                                        <Th>Token endpoint</Th>
                                        <Th>Service endpoint</Th>
                                        <Th>Update</Th>


                                    </Tr>

                                </Thead>
                                {this.state.configs.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>Loading ......</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.configs.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.apiusername}
                                                </Td>
                                                <Td>
                                                    {u.apipassword}
                                                </Td>
                                                <Td>
                                                    {u.tokenurl}
                                                </Td>
                                                <Td>
                                                    {u.serviceurl}
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

                        <center><h3>Update CRM API Configurations</h3></center>
                        <div className="card-body text-left">

                            <Row>

                                <Col>
                                    <label style={{ color: '#000000' }}><b>Username</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Username" value={this.state.api_username} onChange={e => this.handleChange(e, "api_username")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Password</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Password" value={this.state.api_password} onChange={e => this.handleChange(e, "api_password")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Token endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Token endpoint" value={this.state.token_url} onChange={e => this.handleChange(e, "token_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Service endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Service endpoint" value={this.state.service_url} onChange={e => this.handleChange(e, "service_url")} />
                                    </div>

                                    <label style={{ color: '#000000' }}><b>Customer verification endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Customer verification endpoint" value={this.state.verification_url} onChange={e => this.handleChange(e, "verification_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Customer creation endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Customer creation endpoint" value={this.state.creation_url} onChange={e => this.handleChange(e, "creation_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Query status endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Query status endpoint" value={this.state.status_url} onChange={e => this.handleChange(e, "status_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Ticket Categories url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Ticket categories" value={this.state.categories} onChange={e => this.handleChange(e, "categories")} />
                                    </div>

                                </Col>
                            </Row>
                        </div>
                        <div className="card-body text-center">
                           
                                    <Row key={0}>
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


                </Dialog>

            </Aux>

        );
    }
}

export default CrmConfigs;