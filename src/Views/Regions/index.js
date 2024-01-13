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
import CountiesCheckBox from '../../App/components/Checkbox/countiescheckbox';
import Visibility from '@material-ui/icons/Visibility';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { FaPlusCircle, FaTimes, FaSave, FaDoorOpen } from 'react-icons/fa';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

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
class Regions extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            allregions: [],
            region_counties: [],
            counties: [],
            selected_counties: [],
            compare_region_counties: [],
            openView: false,
            openAdd: false,
            checked_value: false,
            deleteregion: false,
            closesession: false,
            openUpdate: false,
            updateopen: false,
            _notificationSystem: null,
            region: '',
            updated_region: '',
            open: false,
            region_name: '',
            new_region_name: '',
            region_to_be_deleted: '',
            region_to_be_updated: '',
            dup_status: 'false',
            show_progress_status: false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getRegions();
        this.setState({ show_progress_status: false });


    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            this.logout();
        }

    }
    async getRegions() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("regions/allregions");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            this.setState({ allregions: apiResponse });
            await this.getAllCounties();

        }

    }

    async checkDuplicate(id) {
        //call API
        let status = "false";
        const notification = this.notificationSystem.current;
        let params = {};

        params["county_id"] = id
        let apiResponse = await APIService.makePostRequest("regions/check_duplicate", params);

        if (apiResponse.status === "false") {
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 10
            });
            status = "true";
        }
        this.setState({
            dup_status: status
        })
        return status;

    }
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getAllCounties() {
        //call API

        await APIService.makeApiGetRequest("regions/allcounties")
            .then(data => this.setState({ counties: data }));

    }
    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };

    getRegionName(cell, row) {
        return cell.region_name;
    }
    cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickUserSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update region' />
            </IconButton>

        );
    }
    deleteButton(row) {

        return (

            <IconButton onClick={() =>
                this.confirmDeleteRegion(row)
            }>

                <DeleteIcon style={{ color: "red" }} titleAccess='Delete system region' />

            </IconButton>


        );
    }
    cellCounties(row) {

        return (

            <IconButton onClick={() =>
                this.onClickCountyView(row)
            }>

                <Visibility style={{ color: "green" }} titleAccess='View counties' />

            </IconButton>

        );
    }
    async saveRegion() {
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("create_region")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to create a region. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            if (this.state.new_region_name == null || this.state.new_region_name === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter region name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {
                let selectedCounties = [];

                this.state.counties.forEach(pri => {
                    if (pri.is_checked == true) {
                        //check duplicate first
                        this.checkDuplicate(pri.id).then(val => {

                            if (val == "false") {
                                selectedCounties.push(pri.id);
                            }

                        });


                    }
                });
                await setTimeout(() => {
                    //check size of selected counties
                    if (selectedCounties.length == 0) {
                        notification.addNotification({
                            message: 'Cannot create the requested region. All selected counties already appear in other regions.',
                            level: 'warning',
                            autoDismiss: 10
                        });
                        this.getAllCounties();
                        this.setState({ show_progress_status: false });
                    } else {
                        let params = {};
                        params["region_name"] = this.state.new_region_name
                        params["counties"] = selectedCounties

                        APIService.makePostRequest("regions/create", params).then(result => {
                            if (result.success) {
                                notification.addNotification({
                                    message: 'Region saved',
                                    level: 'success',
                                    autoDismiss: 5
                                });
                                this.closeAddDialog();
                                this.removeItemAll();
                                this.setState({
                                    new_region_name: ''
                                });
                                this.getRegions();
                                this.getAllCounties();
                                this.setState({ show_progress_status: false });
                            } else {
                                this.setState({ show_progress_status: false });
                                notification.addNotification({
                                    message: result.message,
                                    level: 'error',
                                    autoDismiss: 5
                                });
                            }
                        });
                    }
                }, 10000);
            }
        }
    }
    async deleteRegion() {
        this.closeDeleteDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("delete_region")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to delete a region. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["id"] = this.state.region_to_be_deleted


            let result = await APIService.makePostRequest("regions/delete", params);
            if (result.success) {
                notification.addNotification({
                    message: 'Region deleted',
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeDeleteDialog();
                this.setState({
                    region_to_be_deleted: ''
                });
                this.getRegions();
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
    async updateRegion() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("update_region")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to make any updates to a region. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let list = [];
            for (let k in this.state.counties) {
                if (this.state.counties[k].checked) {
                    list.push(this.state.counties[k].id);
                }
            }

            let params = {};
            params["id"] = this.state.region_to_be_updated;
            params["counties"] = list;


            let result = await APIService.makePostRequest("regions/update", params);
            if (result.success) {
                notification.addNotification({
                    message: 'Region updated',
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeUpdateDialog();
                this.setState({
                    region_to_be_updated: ''
                });
                this.getRegions();
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
    //clear all items from the privileges array
    removeItemAll() {
        var i = 0;
        while (i < this.state.selected_counties.length) {

            this.state.selected_counties.splice(i, 1);

            ++i;

        }
    }
    confirmDeleteRegion(row) {
        this.openDeleteRegion(row);
    }
    openDeleteRegion(row) {
        this.setState({
            deleteregion: true,
            region_name: row.region_name,
            region_to_be_deleted: row.id
        })
    }
    closeDeleteDialog() {
        this.setState({ deleteregion: false });
    }
    closeViewDialog() {
        this.setState({ openView: false });
    };
    openViewDialog() {
        this.setState({ openView: true });
    };

    closeAddDialog() {
        this.setState({ openAdd: false });
        this.removeItemAll();
    };
    openAddDialog() {
        this.setState({ openAdd: true });
    };
    openSessionDialog() {
        this.setState({ closesession: true });
    };
    closeUpdateDialog() {
        this.setState({ updateopen: false });
    }
    openUpdateDialog() {
        this.setState({ updateopen: true });
    }
    handlerCountyChanges(e) {

        this.checkDuplicate(e.target.value);


        if (e.target.checked) {
            this.state.selected_counties.push(e.target.value);
        }


        if (!e.target.checked) {
            //update array
            let index = this.state.selected_counties.indexOf(e.target.value);
            if (index > -1) {
                this.state.selected_counties.splice(index, 1);
            }
        }


    }

    onClickCountyView(row) {
        //Empty list first
        while (this.state.region_counties.length > 0) {
            this.state.region_counties.pop();
        }

        for (let k in row.mapping) {
            this.state.region_counties.push(row.mapping[k].mcounties.county)
        }

        this.setState({
            region_name: row.region_name
        });
        this.openViewDialog();
    }

    onClickUserSelected(row) {
        //Empty list first

        while (this.state.region_counties.length > 0) {
            this.state.region_counties.pop();
            this.state.compare_region_counties.pop();
        }

        for (let k in row.mapping) {
            this.state.region_counties.push(row.mapping[k].mcounties.county)
            this.state.compare_region_counties.push(row.mapping[k].mcounties.id)
            this.state.selected_counties.push(row.mapping[k].mcounties.id)

        }
        for (let j in this.state.counties) {
            if (this.state.compare_region_counties.includes(this.state.counties[j].id)) {

                this.state.counties[j]['checked'] = true;

            } else {
                this.state.counties[j]['checked'] = false;

            }


        }

        this.setState({
            region_name: row.region_name,
            region_to_be_updated: row.id
        });


        this.openUpdateDialog();
    }
    handleAllChecked = event => {
        let counties = this.state.counties;
        counties.forEach(counties => (counties.is_checked = event.target.checked));
        this.setState({ counties: counties });
    };

    handleCheckChildElement = event => {

        let counties = this.state.counties;
        counties.forEach(c => {
            if (c.id == event.target.value)
                c.is_checked = event.target.checked;
        });
        this.setState({ counties: counties });
    };
    renderList = () => {
        return (
            <div>
                <Table>
                    <Tbody>
                        {this.state.counties.map((privi, index) => (
                            <Tr key={index}>
                                <Td>
                                    {privi.county}
                                </Td>
                                <Td>
                                    <input
                                        type="checkbox"
                                        value={privi.id}
                                        checked={privi.checked}
                                        id={privi.id}
                                        name={privi.county}
                                        onChange={this.handlerCountyUpdateChanges}
                                    />
                                </Td>
                            </Tr>


                        )
                        )}
                    </Tbody>
                </Table>
            </div>
        )
    };
    handlerCountyUpdateChanges = e => {
        let itemVal = e.target.name;
        let checked = e.target.checked;
        this.checkDuplicate(e.target.value);
        this.setState(prevState => {
            let { counties, allChecked } = prevState;

            counties = counties.map(item =>
                item.county === itemVal ? { ...item, checked: checked } : item
            );
            allChecked = counties.every(item => item.checked);

            this.setState({ counties, allChecked });

            return { counties, allChecked };
        });
    }
    availability(pri) {

        if (this.state.compare_region_counties.includes(pri)) {

            return true;
        }
        return false;
    }

    render() {
        const tooltipStyle3 = {
            overflowY: "scroll",

        };
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
                <Row>
                    <Col>
                        <Card title='Regions' isOption>


                            <IconButton onClick={() =>
                                this.openAddDialog()
                            }>
                                <FaPlusCircle style={{ color: "#04a9f5" }} size={50} title='Add a region' />
                            </IconButton>

                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Name</Th>
                                        <Th>Counties</Th>
                                        <Th>Update</Th>
                                        <Th>Delete</Th>

                                    </Tr>

                                </Thead>
                                {this.state.allregions == null || this.state.allregions.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>No data available ......</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.allregions.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.region_name}
                                                </Td>

                                                <Td>{this.cellCounties(u)}</Td>
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
                    open={this.state.deleteregion}

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
                            <h3>{this.state.region_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this region?</h4>



                        </div>
                        <div className="card-body text-center">
                            <Row>
                                <Col>
                                    <IconButton onClick={() => { this.closeDeleteDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.deleteRegion() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                            </Row>
                        </div>


                    </div>

                </Dialog>


                <Dialog
                    open={this.state.openView}
                    onClose={this.closeViewDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>{this.state.role_name} Counties</h3>
                            <Table style={{ textAlign: 'left' }}>
                                <Tbody>
                                    {this.state.region_counties.map(
                                        (privi, index) => (
                                            <Tr key={index}>
                                                <Td>{privi}</Td>

                                            </Tr>
                                        )
                                    )}
                                </Tbody>
                            </Table>
                            <IconButton onClick={() => { this.closeViewDialog() }}>

                                <FaTimes size={50} title='Close' color='green' />
                            </IconButton>
                        </div>

                    </div>


                </Dialog>
                <Dialog
                    open={this.state.updateopen}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-left">
                            <h3>{this.state.region_name} COUNTIES</h3>
                            {this.renderList()}

                        </div>
                        <div className="card-body text-center">
                            <Row>
                                <Col>
                                    <IconButton onClick={() => { this.closeUpdateDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.updateRegion() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                            </Row>
                        </div>
                    </div>


                </Dialog>

                <Dialog
                    open={this.state.openAdd}
                    onClose={this.closeAddDialog.bind(this)}
                    fullWidth

                >

                    <div className="card" style={tooltipStyle3}>

                        <div className="card-body text-center">
                            <h3>Create Region</h3>
                            <Row>
                                <Col>
                                    <Table style={{ textAlign: 'left' }} striped={"true"} bordered={true} hover>
                                        <Tbody>
                                            <Tr key={0}>
                                                <Td>
                                                    Check / Uncheck All
                                                </Td>
                                                <Td>
                                                    <input
                                                        type="checkbox"
                                                        onClick={this.handleAllChecked}
                                                        value="checkedall"
                                                    />{" "}

                                                </Td>
                                            </Tr>
                                        </Tbody>

                                        {this.state.counties.map(
                                            (pri) => {

                                                return (

                                                    <CountiesCheckBox handleCheckChildElement={this.handleCheckChildElement}
                                                        {...pri}
                                                    />

                                                );
                                            })


                                        }
                                    </Table>

                                </Col>
                                <Col>
                                    <p className="mb-4">Region name</p>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Region name" value={this.state.new_region_name} onChange={e => this.handleChange(e, "new_region_name")} />
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
                                        <IconButton onClick={() => { this.saveRegion() }}>
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

export default Regions;