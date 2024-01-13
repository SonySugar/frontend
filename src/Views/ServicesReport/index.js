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
class ServiceReport extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            trx: [],
            trx_copy: [],
            training_requests: [],
            customer_complaints: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            id: '',
            receipt_no: '',
            amount: '',
            account_name: '',
            mobile_number: '',
            payment_code: '',
            service_type: '',
            requested_service_name: '',
            status: '',
            _notificationSystem: null,
            date_created: '',
            updated_role: '',
            show_progress_status: false,
            query_status_url: '',
            openConfirm: false,
            type: '',
            show_payment: false,
            show_training: false,
            show_complaints: false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getReport();

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
    async getReport() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("tickets/payment_generated");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ trx: apiResponse });


        }

    }





    cellButton(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <Button
                size="sm"
                variant="primary"
                onClick={() =>
                    this.onClickTicketSelected(cell, row, enumObject, rowIndex)
                }
            >
                More Details
            </Button>

        );
    }

    trainingName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
                {row.training_requests.trainings.module}
            </p>

        );
    }

    titleName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
                {row.customer_tickets.title}
            </p>

        );
    }

    categoryName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
                {row.customer_tickets.category.category_name}
            </p>

        );
    }

    requestDate(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        let startDate = this.getFormatedStartDate(row.training_requests.start_date);
        return (

            <p>
                {startDate}
            </p>



        );
    }

    customerName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
                {row.training_requests.created_by}
            </p>

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
    onClickTicketSelected(cell, row, enumObject, rowIndex) {
        this.setState({
            id: row.id,
            receipt_no: row.receipt_no,
            amount: row.amount,
            account_name: row.account_name,
            mobile_number: row.mobile_number,
            payment_code: row.payment_code,
            service_type: row.service_type,
            requested_service_name: row.requested_service_name,
            status: row.status,
            date_created: row.date_created,

        });
        this.openUpdateDialog();
    }


    handlerTypeChange(e) {
        let type = e.target.value;
        //set copy first to original
        let original = this.state.trx;
        let copy = [];
        copy = original;
        let val = copy.filter(t => {
            return t.service_type === type;
        });

        this.setState({
            trx_copy: val
        })
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

    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
                <Row>
                    <Col>
                        <Card title='Reports' isOption>

                            <div className="input-group mb-3">
                                <select
                                    className="form-control"
                                    value={this.state.type}
                                    onChange={this.handlerTypeChange.bind(
                                        this
                                    )}
                                >
                                    <option value="">
                                        Select report type
                                    </option>
                                    <option value="Augmented">
                                        Augmented
                                    </option>

                                    <option value="Training">
                                        Training
                                    </option>
                                </select>

                            </div>
                            <BootstrapTable data={this.state.trx_copy} striped hover exportCSV>
                                <TableHeaderColumn isKey dataField='id'>Record Id</TableHeaderColumn>
                                <TableHeaderColumn dataField='receipt_no'>Receipt No</TableHeaderColumn>
                                <TableHeaderColumn dataField='amount'>Amount</TableHeaderColumn>
                                <TableHeaderColumn dataField='account_name'>Account Name</TableHeaderColumn>
                                <TableHeaderColumn dataField='mobile_number'>Mobile Number</TableHeaderColumn>
                                <TableHeaderColumn dataField='payment_code'>Payment Mode</TableHeaderColumn>
                                <TableHeaderColumn dataField='requested_service_name'>Details</TableHeaderColumn>

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

            </Aux>

        );
    }
}

export default ServiceReport;