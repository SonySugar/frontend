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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CSVLink } from "react-csv";
import CloseIcon from '@material-ui/icons/Close';
import Visibility from '@material-ui/icons/Visibility';
import Edit from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaFileExcel, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { FarmersCheckBox } from '../../App/components/Checkbox/farmerscheckbox';
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


const ticket_report_header = [
    { label: "Ticket No", key: "id" },
    { label: "Category", key: "category" },
    { label: "Status", key: "status" },
    { label: "Description", key: "description" },
    { label: "Priority", key: "priority" },
    { label: "Created by", key: "createdby" },
    { label: "Contact", key: "contact" },
    { label: "Date created", key: "datecreated" }
];

class ScheduleSms extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            scheduled_sms: [],
            scheduled_sms_temp: [],
            groups: [],
            contacts: [],
            open: false,
            closesession: false,
            id: '',
            message: '',
            filteredContacts: [],
            _notificationSystem: null,
            date_created: '',
            updated_role: '',
            selected_group: "",
            show_progress_status: false,
            query_status_url: '',
            openConfirm: false,
            ticket_report: [],
            date_from: '',
            date_to: '',
            startdate:'',
            pageNum: 0,
            pageCount: 1,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getScheduledSms(0);
        await this.getContactGroups();
        await this.getAllContacts();
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
    async SendSms() {
        //call API
        this.setState({ show_progress_status: true, open: false});
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("send_sms")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to send sms. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let phoneNumbers = [];
            this.state.contacts.forEach(u => {
                if (u.checked) {
                    let combinedData = u.phonenumber + "|" + u.firstname;
                    phoneNumbers.push(combinedData)
                }
            });
    

        if(phoneNumbers.length == 0){
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "Please select at least one contact to send sms",
                level: 'error',
                autoDismiss: 5
            });
        }else{
            let params = {}
            let endpoint = "schedule/sms";
            params["message"] = this.state.message;
            params["recipients"] = phoneNumbers;
            params["scheduledate"] = this.formatDate(this.state.startdate);

            let apiResponse = await APIService.makePostRequest(endpoint, params);
            if (apiResponse.success) {
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.setState({ show_progress_status: false, selected_template: "", message: ""});
            } else {
                this.setState({ show_progress_status: false });
                notification.addNotification({
                    message: apiResponse.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }
            this.getScheduledSms(0);
        }
    }
    }
    async getScheduledSms(pagenum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("scheduled_sms/" + pagenum + "/" + 10);
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ scheduled_sms: apiResponse, scheduled_sms_temp: apiResponse });


        }

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
    async getAllContacts() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("contacts");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            this.setState({ contacts: apiResponse, filteredContacts: apiResponse});


        }
    }



    cellButton(row) {
        const { classes } = this.props;
        var toggleMessage = "Cancel all requests under this batch" +row.batchid;
        return (

            <IconButton onClick={() =>
                this.onClickSmsSelected(row)
            } >
                <DeleteIcon style={{ color: "red" }}/>
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

    closeConfirmDialog() {
        this.setState({ openConfirm: false });

    }
    openConfirmDialog() {
        this.setState({ openConfirm: true });
        this.closeUpdateDialog();
    }
    openDeleteDialog(cell, row, enumObject, rowIndex) {
        this.setState({
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        });
    }
    onClickSmsSelected(row) {
        this.setState({
            id: row.id,
            batchid: row.batchid,
            status: row.status
        });
        this.openUpdateDialog();
    }


    
    getFormatedStartDate(val) {

        let date = new Date(val);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dt = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();

        if (dt < 10) {
            dt = '0' + dt;
        }
        if (month < 10) {
            month = '0' + month;
        }

        if (hour < 10) {
            hour = '0' + hour;
        }
        if (mins < 10) {
            mins = '0' + mins;
        }

        let concatTime = year + '-' + month + '-' + dt + ' ' + hour + ':' + mins;
        return concatTime;
    }
    dateConverter(val) {
        let date = val;
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dt = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();

        if (dt < 10) {
            dt = '0' + dt;
        }
        if (month < 10) {
            month = '0' + month;
        }

        if (hour < 10) {
            hour = '0' + hour;
        }
        if (mins < 10) {
            mins = '0' + mins;
        }

        let concatTime = year + '-' + month + '-' + dt

        return concatTime;
    }



    handleReportSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.scheduled_sms.filter(s => {
            return s.batchid.includes(value);
        });
        this.setState({
            scheduled_sms_temp: searchResult
        });
    }

    async AddPage() {
        this.setState({ show_progress_status: true });
        var add = this.state.pageNum;
        var count = this.state.pageCount;
        add++;
        count++;
        this.setState({
            pageNum: add,
            pageCount: count
        });
        await this.getTickets(add);
        this.setState({ show_progress_status: false });
    }
    async RemovePage() {
        var add = this.state.pageNum;
        var count = this.state.pageCount;
        if (this.state.pageNum > 0) {
            this.setState({ show_progress_status: true });
            add--;
            count--;
            this.setState({
                pageNum: add,
                pageCount: count
            });
            await this.getTickets(add);
            this.setState({ show_progress_status: false });
        }
    }

    formatDate(val) {
        return format(new Date(val), "dd-MM-yyyy HH:mm");
    }
    smsStatus(row) {
        if (row.status == "pending")
            return <Td style={{ color: 'red' }}>{row.status}</Td>

        return <Td style={{ color: 'green' }}>{row.status}</Td>

    }
    handleCheckOthersChildElement = event => {
        let contact = this.state.contacts;
        contact.forEach(f => {
            if (f.id == event.target.value)
                f.checked = event.target.checked;
        });
        this.setState({ contacts: contact });
    };

    selectedGroup(e){
        if(e.target.value == ''){
            this.setState({ contacts: this.state.filteredContacts });
        }
        this.setState({ show_contact_list: true });
        this.setState({ selected_group: e.target.value });
        let contacts = this.state.filteredContacts;
        let filtered = contacts.filter(c => c.contactgroup == e.target.value);
        this.setState({ contacts: filtered });
    }
    handleAllOthersChecked = event => {
        let contact = this.state.contacts;
        contact.forEach(f => (f.checked = event.target.checked));
        this.setState({ contacts: contact });
    };
    setStartDate(e) {


        this.setState({
          startdate: e
        })
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
                        <Card title='Scheduled sms' isOption>
                            
                        <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    this.openAddDialog()
                                }
                            >
                                Schedule sms
                            </Button>

                            <div className="card-body text-center">
                                <IconButton onClick={() =>
                                    this.RemovePage()
                                } >
                                    <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                                </IconButton>

                                <IconButton onClick={() =>
                                    this.AddPage()
                                } >
                                    <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                                </IconButton>
                                <p>Page {this.state.pageCount}</p>
                            </div>

                            <div className="input-group mb-3">
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by Batch Id" onChange={e => this.handleReportSearch(e)} />
                    </div>
                    <br />
                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid', fontWeight: 'bold' }}>
                                        <Th>Batch Id</Th>
                                        <Th>Phone Number</Th>
                                        <Th>Message</Th>
                                        <Th>Status</Th>
                                        <Th>Scheduled date</Th>
                                        <Th>Actions</Th>
                                    </Tr>

                                </Thead>
                                {this.state.scheduled_sms == null || this.state.scheduled_sms.length == 0 ? <Tbody>
                                </Tbody> : <Tbody>
                                    {this.state.scheduled_sms_temp.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td style={{ border: '1px solid' }}>
                                                    {u.batchid}
                                                </Td>
                                                <Td style={{ border: '1px solid' }}>
                                                    {u.phonenumber}
                                                </Td>
                                                <Td style={{ border: '1px solid' }}>
                                                    {u.message}
                                                </Td>
                                                <Td style={{ border: '1px solid' }}>
                                                    {u.status}
                                                </Td>
                                                <Td style={{ border: '1px solid' }}>{this.formatDate(u.scheduledtime)}</Td>
                                                <Td>
                                                    {this.cellButton(u)}
                                                </Td>



                                            </Tr>
                                        )
                                    )}
                                </Tbody>}
                            </Table>

                            <div className="card-body text-center">
                                <IconButton onClick={() =>
                                    this.RemovePage()
                                } >
                                    <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                                </IconButton>

                                <IconButton onClick={() =>
                                    this.AddPage()
                                } >
                                    <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                                </IconButton>
                                <p>Page {this.state.pageCustomCount}</p>
                            </div>
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
                    open={this.state.openConfirm}

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
                            <h3>Ticket Id #{this.state.id}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to close this ticket?</h4>



                        </div>
                        <Row>
                            <Col>
                                <div className="card-body text-center">
                                    <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeConfirmDialog() }}>No</button>
                                </div>
                            </Col>
                            {/*<Col>
                            <div className="card-body text-center">
                                <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.closeTicket() }}>Yes</button>
                            </div>
                            </Col>*/}
                        </Row>


                    </div>

                </Dialog>
                <Dialog
                    open={this.state.open}
                    onClose={this.closeAddDialog.bind(this)}
                    fullScreen
                >
                    <div className="card">
                        <div className="card-body text-left">
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.selected_group}
                                            onChange={this.selectedGroup.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select contact group
                                            </option>
                                            {this.state.groups.map((g, index) => (
                                                <option value={g.id} key={index}>
                                                    {g.name}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                            <Row>
                                <Table style={{ textAlign: "left" }}>
                                    <Tbody>
                                        <Tr key={0}>
                                            <Td>
                                                Check / Uncheck All
                                            </Td>
                                            <Td>
                                                <input
                                                    type="checkbox"
                                                    onClick={this.handleAllOthersChecked}
                                                    value="checkedall"
                                                />{" "}

                                            </Td>
                                        </Tr>

                                        {this.state.contacts.map(
                                            (contact) => {

                                                return (
                                                    <FarmersCheckBox handleCheckChildElement={this.handleCheckOthersChildElement}
                                                        {...contact}
                                                    />
                                                );
                                            })


                                        }
                                        <Tr>
                                            <Td>
                                            <div className="Picker">
                          <DatePicker selected={this.state.startdate} onChange={date => this.setStartDate(date)} placeholderText={this.state.startdate} dateFormat="dd-MM-yyyy HH:mm" showTimeSelect />
                        </div>
                                            </Td>
                                            <Td></Td>
                                            <Td></Td>

                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <textarea
                                                    className="form-control"
                                                    value={this.state.message}
                                                    onChange={(e) => this.handleChange(e, 'message')}
                                                    placeholder="Enter message here"
                                                ></textarea>
                                            </Td>
                                            <Td></Td>
                                            <Td></Td>
                                        </Tr>
                                        <Tr>
                                            <Td>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        this.closeAddDialog()
                                                    }
                                                >
                                                    Close/Dismiss
                                                </Button>
                                            </Td>
                                            <Td></Td>
                                            <Td>                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() =>
                                                        this.SendSms()
                                                    }
                                                >
                                                    Save
                                                </Button></Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </Row>
                        </div>
                    </div>

                </Dialog>

            </Aux>

        );
    }
}

export default ScheduleSms;