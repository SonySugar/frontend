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
class ContactGroups extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            groups: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            new_group_name: '',
            updated_group_name: '',
            update_group_id: '',
            _notificationSystem: null,
            role: '',
            updated_role: '',
            group_id: '',
            selectedflag: '',
            group_name: '',
            group_to_be_deleted: '',
            hidedialog: false,
            show_progress_status: false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getContactGroups();
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
    async getContactGroups() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("contactgroups");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ groups: apiResponse });


        }

    }

    cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickGroupSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update group' />
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

    onClickGroupSelected(row) {
        this.setState({
            updated_group_name: row.name,
            update_group_id: row.id,

        });
        this.openUpdateDialog();
    }

    async saveContactGroup() {
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("create_contact_group")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to create a contact group. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            if (this.state.group_name == null || this.state.group_name === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter category name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let params = {};
                params["name"] = this.state.group_name

                let result = await APIService.makePostRequest("contactgroup/save", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeAddDialog();
                    this.setState({
                        group_name: '',
                    });
                    this.getContactGroups();
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
    async updateContactGroup() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }
        if (!privilegeList.includes("update_contact_group")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to update contact group. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            if (this.state.updated_group_name == null || this.state.updated_group_name === '') {
                this.setState({ loggingIn: false });

                notification.addNotification({
                    message: 'Please enter group name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let params = {};
                params["name"] = this.state.updated_group_name;
                params["id"] = this.state.update_group_id;

                let result = await APIService.makePostRequest("contactgroup/save", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeUpdateDialog();
                    this.setState({
                        updated_group_name: '',
                        update_group_id: ''
                    });
                    this.getContactGroups();
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
                this.confirmDeleteContactGroup(row)
            }>

                <DeleteIcon style={{ color: "red" }} titleAccess='Delete group' />

            </IconButton>
        );
    }
    confirmDeleteContactGroup(row) {
        this.openDeleteContactGroup(row);
    }
    openDeleteContactGroup(row) {
        this.setState({
            openDelete: true,
            group_name: row.name,
            group_to_be_deleted: row.id
        })
    }
    async deleteContactGroup() {
        this.closeDeleteDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }
        console.log(privilegeList)

        if (!privilegeList.includes("delete_contact_group")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to delete a contact group. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["id"] = this.state.group_to_be_deleted


            let result = await APIService.makePostRequest("contactgroup/delete", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeDeleteDialog();
                this.setState({
                    group_to_be_deleted: ''
                });
                this.getContactGroups();
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
                        <Card title='Contact groups' isOption>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    this.openAddDialog()
                                }
                            >
                                Create Contact Group
                            </Button>

                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Name</Th>
                                        <Th>Update</Th>
                                        <Th>Delete</Th>

                                    </Tr>

                                </Thead>
                                {this.state.groups == null || this.state.groups.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        {this.state.type == null || this.state.type == "" ?
                                            <Td style={{ color: 'red' }}>No data available....</Td> : <Td style={{ color: 'blue' }}>Loading ....</Td>}
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.groups.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.name}
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
                            <h3>Create Contact Group</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Group name" value={this.state.group_name} onChange={e => this.handleChange(e, "group_name")} />
                                    </div>

                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className="card-body text-center">

                                        <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        this.closeAddDialog()
                                                    }
                                                >
                                                    Dismiss
                                                </Button>
                                    </div>
                                </Col>
                                <Col>
                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() =>
                                                        this.saveContactGroup()
                                                    }
                                                >
                                                    Save
                                                </Button>
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
                            <h3>Update Contact Group</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Group name" value={this.state.updated_group_name} onChange={e => this.handleChange(e, "updated_group_name")} />
                                    </div>


                                </Col>
                            </Row>
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
                                                        this.updateContactGroup()
                                                    }
                                                >
                                                    Save
                                                </Button>
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
                            <h3>{this.state.group_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this contact group?</h4>


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
                                        this.deleteContactGroup()
                                    }
                                >
                                    Delete group
                                </Button></Col>
                            </Row>


                        </div>



                    </div>

                </Dialog>
            </Aux>

        );
    }
}

export default ContactGroups;