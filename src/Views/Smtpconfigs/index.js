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
class SmtpConfigs extends React.Component {
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
            host: '',
            username: '',
            password: '',
            fromemail: '',
            port: '',
            smtpauth: '',
            fromname: '',
            _notificationSystem: null,
            role: '',
            updated_role: '',
            show_progress_status: false,
            query_status_url: '',
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
        let apiResponse = await APIService.makeApiGetRequest("configs/smtp");
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
            host: row.host,
            username: row.username,
            password: row.password,
            fromemail: row.fromemail,
            port: row.port,
            smtpauth: row.smtpauth,
            fromname: row.fromname,

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

        if (!privilegeList.includes("smtp_configs")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to make smtp updates. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {

            let params = {};
            params["id"] = this.state.id;
            params["host"] = this.state.host;
            params["username"] = this.state.username;
            params["password"] = this.state.password;
            params["fromemail"] = this.state.fromemail;
            params["fromname"] = this.state.fromname;
            params["port"] = this.state.port;
            params["smtpauth"] = this.state.smtpauth;


            let result = await APIService.makePostRequest("configs/smtp/update", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeUpdateDialog();
                this.setState({
                    id: '',
                    host: '',
                    username: '',
                    password: '',
                    fromemail: '',
                    port: '',
                    smtpauth: '',
                    fromname: '',
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
                        <Card title='Smtp Configurations' isOption>



                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Smtp host</Th>
                                        <Th>Smtp port</Th>
                                        <Th>Email from</Th>
                                        <Th>Update</Th>


                                    </Tr>

                                </Thead>
                                {this.state.configs==null || this.state.configs.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>No data available ......</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.configs.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.host}
                                                </Td>
                                                <Td>
                                                    {u.port}
                                                </Td>
                                                <Td>
                                                    {u.fromemail}
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

                        <center><h3>Update Smtp Configurations</h3></center>
                        <div className="card-body text-left">

                            <Row>

                                <Col>
                                    <label style={{ color: '#000000' }}><b>Smtp host</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Smtp host" value={this.state.host} onChange={e => this.handleChange(e, "host")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Smtp port</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Smtp port" value={this.state.port} onChange={e => this.handleChange(e, "port")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Email from</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Email from" value={this.state.fromemail} onChange={e => this.handleChange(e, "fromemail")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>From</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="From" value={this.state.fromname} onChange={e => this.handleChange(e, "fromname")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>User name</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Username" value={this.state.username} onChange={e => this.handleChange(e, "username")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Password</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Password" value={this.state.password} onChange={e => this.handleChange(e, "password")} />
                                    </div>


                                    <label style={{ color: '#000000' }}><b>Smtp authorization flag</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.smtpauth}
                                            onChange={this.handlerTypeChange.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select authorization flag
                                            </option>
                                            <option value="yes">
                                                Use authorization
                                            </option>

                                            <option value="no">
                                                Don't use authorization
                                            </option>
                                        </select>

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

export default SmtpConfigs;