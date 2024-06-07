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
class BulkSmsConfigs extends React.Component {
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
            serviceurl: '',
            senderid: '',
            type: '',
            apikey: '',
            profileurl: '',
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
        let apiResponse = await APIService.makeApiGetRequest("/configs/kikosi");
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
    onClickConfigSelected(row) {
        this.setState({
            id: row.id,
            serviceurl: row.serviceurl,
            type: row.messagetype,
            senderid: row.sender,
            apikey: row.apikey,
            profileurl:row.profileurl

        });
        this.openUpdateDialog();
    }


    async updateConfigs() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("update_sms_configs")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to make sms config updates. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["id"] = this.state.id;
            params["serviceurl"] = this.state.serviceurl;
            params["sender"] = this.state.senderid;
            params["messagetype"] = this.state.type;
            params["apikey"] = this.state.apikey;
            params["profileurl"] = this.state.profileurl;


            let result = await APIService.makePostRequest("/configs/kikosi/update", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeUpdateDialog();
                this.setState({
                    id: '',
                    serviceurl: '',
                    senderid: '',
                    type: '',
                    apikey: ''
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
            smtpauth: e.target.value
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
                        <Card title='Bulk SMS Configurations' isOption>



                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Service endpoint</Th>
                                        <Th>Profile endpoint</Th>
                                        <Th>Sender Id</Th>
                                        <Th>ApiKey</Th>
                                        <Th>MessageType</Th>
                                        <Th>Update</Th>


                                    </Tr>

                                </Thead>
                                {this.state.configs == null || this.state.configs.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>No data available ......</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.configs.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.serviceurl}
                                                </Td>
                                                <Td>
                                                    {u.profileurl}
                                                </Td>
                                                <Td>
                                                    {u.sender}
                                                </Td>
                                                <Td>
                                                    {u.apikey}
                                                </Td>
                                                <Td>
                                                    {u.messagetype}
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

                        <center><h3>Update Sms Configurations</h3></center>
                        <div className="card-body text-left">

                            <Row>

                                <Col>
                                    <label style={{ color: '#000000' }}><b>Service endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Service endpoint" value={this.state.serviceurl} onChange={e => this.handleChange(e, "serviceurl")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Profile endpoint</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Profile endpoint" value={this.state.profileurl} onChange={e => this.handleChange(e, "profileurl")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Sender Id</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Sender Id" value={this.state.senderid} onChange={e => this.handleChange(e, "senderid")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Api Key</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Api key" value={this.state.apikey} onChange={e => this.handleChange(e, "apikey")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Message Type</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Message type" value={this.state.type} onChange={e => this.handleChange(e, "type")} />
                                    </div>

                                </Col>
                            </Row>

                        </div>
                        <div className="card-body text-center">

                            <Row key={0}>
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
                                            this.updateConfigs()
                                        }
                                    >
                                        Save
                                    </Button>
                                </Col>
                            </Row>

                        </div>


                    </div>


                </Dialog>

            </Aux>

        );
    }
}

export default BulkSmsConfigs;