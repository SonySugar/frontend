import React from 'react';
import { Row, Col, Button, Image } from 'react-bootstrap';
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
import { CSVLink } from "react-csv";
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaFileExcel, FaTimes, FaUserPlus, FaSave, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { Buffer } from 'buffer';




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
const headers = [
    { label: "Request Id", key: "requestid" },
    { label: "Status", key: "status" },
    { label: "Remarks", key: "remarks" },
    { label: "Contract type", key: "contracttype" },
    { label: "Plot size", key: "plotsize" },
    { label: "Sublocation", key: "sublocation" },
    { label: "Distance", key: "distance" },
    { label: "Zone", key: "zone" },
    { label: "Site", key: "site" },
    { label: "Crop cycle", key: "cropcycle" },
    { label: "Age", key: "age" },
    { label: "Updated by", key: "updatedby" },
    { label: "Request by", key: "requestby" },
    { label: "Contact", key: "contact" },
    { label: "Date created", key: "datecreated" },

];
class Lar extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            lar: [],
            lar_temp: [],
            sysroles: [],
            files: [],
            role_privileges: [],
            all_privileges: [],
            selected_privileges: [],
            compare_role_privileges: [],
            openView: false,
            openAdd: false,
            hover: false,
            checked_value: false,
            closesession: false,
            openUpdate: false,
            updateopen: false,
            _notificationSystem: null,
            requestid: '',
            contracttype: '',
            plotsize: '',
            sublocation: '',
            distance: '',
            zone: '',
            site: '',
            updated_hover: false,
            open: false,
            cropcycle: '',
            age: '',
            requestby: '',
            contact: '',
            id: '',
            status: '',
            remarks: '',
            blobURL: '',
            showmoremessage: 'Click here to show more details',
            disabled: false,
            show_progress_status: false,
            showmore: false,
            showbtn: true,
            showdocmessage: 'Click here to show uploaded documents',
            showdocs: false,
            report: [],
            pageNum: 0,
            pageCount: 1,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getLar(0);
        await this.getLarReport();
        this.setState({ show_progress_status: false });
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            this.logout();
        }

    }
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getLar(pagenum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("land_aq_requests/" + pagenum + "/10");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            this.setState({ lar: apiResponse, lar_temp: apiResponse });




        }
    }
    async getLarReport() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("land_aq_requests");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            //create report

            apiResponse.forEach(r => {
                let params = {};
                params["requestid"] = r.requestid;
                params["status"] = r.status;
                params["remarks"] = r.remarks;
                params["contracttype"] = r.contracttype;
                params["plotsize"] = r.plotsize;
                params["sublocation"] = r.sublocation;
                params["distance"] = r.distance;
                params["zone"] = r.zone;
                params["site"] = r.site;
                params["cropcycle"] = r.cropcycle;
                params["age"] = r.age;
                params["updatedby"] = r.system_user !== null ? r.system_user.username : "None"
                params["requestby"] = r.farmer.firstname + " " + r.farmer.lastname;
                params["contact"] = r.farmer.phonenumber_one;
                params["datecreated"] = r.datecreated;
                this.state.report.push(params);

            });


        }
    }

    async updateLar() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("update_lar_status")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to update land aquisition request status. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {

            if (this.state.remarks == null || this.state.remarks === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter remarks',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else if (this.state.updated_phone_number === 'submitted') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Status should not remain as submitted',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let params = {};
                params["id"] = this.state.id;
                params["status"] = this.state.status;
                params["remarks"] = this.state.remarks;

                let result = await APIService.makePostRequest("land_aq_request/update", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeUpdateDialog();
                    this.setState({
                        id: '',
                        status: '',
                        remarks: '',

                    });
                    this.getLar(0);
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

    async getAllPrivileges() {
        //call API

        await APIService.makeApiGetRequest("privileges")
            .then(data => this.setState({ all_privileges: data }));

    }

    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };

    closeUpdateDialog() {
        this.setState({
            openUpdate: false,
            updated_hover: false,
            showmore: false
        });
    }
    openSessionDialog() {
        this.setState({ closesession: true });
    };
    cellButton(row) {
        const { classes } = this.props;
        return (
            <IconButton onClick={() =>
                this.onClickLarSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='More Actions' />
            </IconButton>

        );
    }


    async onClickLarSelected(row) {
        this.setState({
            id: row.id,
            requestid: row.requestid,
            contracttype: row.contracttype,
            plotsize: row.plotsize,
            sublocation: row.sublocation,
            distance: row.distance,
            zone: row.zone,
            site: row.site,
            cropcycle: row.cropcycle,
            age: row.age,
            requestby: row.farmer.firstname + " " + row.farmer.lastname,
            contact: row.farmer.phonenumber_one,
            status: row.status,
            remarks: row.remarks,
            openUpdate: true,
            updated_hover: true,
        });
        if (row.status == "rejected" || row.status == "approved") {
            this.setState({
                showbtn: false
            })
        } else {
            this.setState({
                showbtn: true
            })
        }
        let fileData = [];
        row.files.forEach(f => {
            let param = {}
            param["filename"] = f.fileName
            param["data"] = f.data
            fileData.push(param)
        });
        console.log(fileData)
        this.setState({
            files: fileData
        })


    }

    handleLarSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.lar.filter(s => {
            return s.requestid.includes(value) || s.status.includes(value) || s.farmer.phonenumber_one.includes(value) || s.farmer.firstname.includes(value);
        });
        this.setState({
            lar_temp: searchResult
        });

    }
    // define a generatePDF function that accepts a tickets argument
    generatePDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["RequestId", "Status", "RequestBy", "Contact", "DateCreated"];
        // define an empty array of rows
        const tableRows = [];

        // for each ticket pass all its data into an array
        this.state.report.forEach(ticket => {
            const ticketData = [
                ticket.requestid,
                ticket.status,
                ticket.requestby,
                ticket.contact,
                // called date-fns to format the date on the ticket
                format(new Date(ticket.datecreated), "yyyy-MM-dd")
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });


        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Sonysugar Land Aquisition Requests", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`Land_Aquisition_Requests${dateStr}.pdf`);
    };
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
        await this.getLar(add);
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
            await this.getLar(add);
            this.setState({ show_progress_status: false });
        }
    }
    showMoreDetails() {
        if (this.state.showmore) {
            this.setState({ showmoremessage: 'Click here to show more details', showmore: false })
        } else {
            this.setState({ showmoremessage: 'Hide details', showmore: true })
        }

    }
    showDocDetails() {
        if (this.state.showdocs) {
            this.setState({ showdocmessage: 'Click here to show uploaded documents', showdocs: false })
        } else {
            this.setState({ showdocmessage: 'Hide documents', showdocs: true })
        }

    }
    getFormattedStatus(val) {
        if (val == "rejected") {
            return <Td style={{ color: 'red' }}>{val}</Td>
        }

        if (val == "approved") {
            return <Td style={{ color: 'green' }}>{val}</Td>
        }

        if (val == "in review") {
            return <Td style={{ color: 'orange' }}>{val}</Td>
        }

        return <Td>{val}</Td>
    }
    render() {

        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />


                <Card title='Land Aquisition requests' isOption>




                    <br />
                    <br />
                    <CSVLink data={this.state.report} headers={headers} filename='Land_Aquisition_Requests.csv'>

                        <FaFileExcel size={50} color='green' title='Download LandAquisition requests' />
                    </CSVLink>
                    <IconButton onClick={() =>
                        this.generatePDF()
                    }>
                        <FaFilePdf title='Download LandAquisition requests' size={50} color='red' />
                    </IconButton>
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
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by request Id or status or contact" onChange={e => this.handleLarSearch(e)} />
                    </div>
                    <p>Page {this.state.pageCount}</p>
                    <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>RequestId</Th>
                                <Th>Status</Th>
                                <Th>Name</Th>
                                <Th>Contact</Th>
                                <Th>Action</Th>

                            </Tr>

                        </Thead>
                        {this.state.lar_temp == null || this.state.lar_temp.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>No data available ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.lar_temp.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.requestid}
                                        </Td>
                                        <Td>
                                            {this.getFormattedStatus(u.status)}
                                        </Td>
                                        <Td>
                                            {u.farmer.firstname} {u.farmer.lastname}
                                        </Td>
                                        <Td>
                                            {u.farmer.phonenumber_one}
                                        </Td>
                                        <Td>{this.cellButton(u)}</Td>
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
                        <p>Page {this.state.pageCount}</p>
                    </div>


                </Card>




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
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    maxWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Update Land Aquisition Request</h3>
                            <Row>
                                <p><b style={{ color: 'brown' }} onClick={() => { this.showMoreDetails() }}>{this.state.showmoremessage}</b></p>
                            </Row>
                            <br />
                            {this.state.showmore ? <Row>

                                <label style={{ color: '#000000' }}><b>Request Id</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.requestid} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Contract type</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.contracttype} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Plot size</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.plotsize} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Sub location</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.sublocation} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Distance</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.distance} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Zone</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.zone} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Site</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.site} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Crop cycle</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.cropcycle} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Age</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.age} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Request by</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.requestby} readOnly />
                                </div>

                                <label style={{ color: '#000000' }}><b>Contact</b></label>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} value={this.state.contact} readOnly />
                                </div>
                            </Row> : null}
                            <Row>
                                <label style={{ color: '#000000' }}><b>Status</b></label>
                                <div className="input-group mb-3">
                                    <select
                                        className="form-control"
                                        value={this.state.status}
                                        onChange={e => this.handleChange(e, "status")}
                                    >
                                        <option value="submitted">
                                            Submitted
                                        </option>

                                        <option value="in review">
                                            In review
                                        </option>
                                        <option value="rejected">
                                            Rejected
                                        </option>
                                        <option value="approved">
                                            Approved
                                        </option>
                                    </select>
                                </div>
                                <label style={{ color: '#000000' }}><b>Remarks</b></label>
                                <div className="input-group mb-3">

                                    <textarea
                                        className="form-control"
                                        value={this.state.remarks}
                                        style={{ height: '200px', width: '600px' }}
                                        onChange={e => this.handleChange(e, "remarks")}
                                    ></textarea>
                                </div>

                            </Row>
                            <Row>
                                <p><b style={{ color: 'brown' }} onClick={() => { this.showDocDetails() }}>{this.state.showdocmessage}</b></p>
                            </Row>
                            {this.state.showdocs ? <Row>
                                {this.state.files.map(
                                    f => (
                                        <div className="card-body text-center">
                                            <center>
                                                {f.filename.includes(".pdf") ? <embed src={`data:application/pdf;base64,${f.data}`} height={500} width={800} /> : f.filename.includes(".jpg") ? <img src={`data:image/jpeg;base64,${f.data}`} height={500} width={800} /> : f.filename.includes(".jpeg") ? <img src={`data:image/jpeg;base64,${f.data}`} height={500} width={800} /> : <img src={`data:image/png;base64,${f.data}`} height={500} width={800} />}
                                            </center>
                                        </div>
                                    )
                                )}
                            </Row> : null}
                            <br />
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
                                    {this.state.showbtn ? <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() =>
                                            this.updateLar()
                                        }
                                    >
                                        Save
                                    </Button> : null}

                                </Col>
                            </Row>






                        </div>


                    </div>




                </Dialog>

            </Aux>
        );
    }
}

export default Lar;