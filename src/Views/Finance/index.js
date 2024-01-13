import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog, DialogContent, DialogActions } from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import DatePicker from "react-datepicker";
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import "react-datepicker/dist/react-datepicker.css";
import Authenticatonservice from '../../service/Authenticatonservice';
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

class Finance extends React.Component {
  notificationSystem = React.createRef();
  constructor() {
    super();
    this.state = {
      training_list: [],
      training_list_temp: [],
      showlocation: false,
      open: false,
      openUpdate: false,
      countyName: '',
      openDelete: false,
      openEnd: false,
      closesession: false,
      training_id: '',
      schedule_list: [],
      schedule_list_temp: [],
      counties: [],
      startdate: '',
      enddate: '',
      county: '',
      fees: 0,
      previous_fee: 0,
      updated_fees: 0,
      updated_previous_fee: 0,
      updated_training_id: '',
      updated_enddate: '',
      updated_startdate: '',
      new_service_name: '',
      training_name: '',
      updated_new_service_name: '',
      delete_service_name: '',
      delete_service_id: '',
      update_service_id: '',
      _notificationSystem: null,
      role: '',
      updated_role: '',
      new_newfeetwo: '',
      new_previousfeetwo: '',
      new_newfeeone: '',
      new_previousfeeone: '',
      new_duration: '',
      new_service_name: '',
      update_new_duration: '',
      update_new_previousfeeone: '',
      update_new_service_name: '',

      update_new_newfeeone: '',
      updated_county: '',

      update_new_previousfeetwo: '',
      update_new_newfeetwo: '',
      training_type: '',
      delivery_mode: '',
      updated_delivery_mode: '',
      updated_training_type: '',
      no_of_participants: 1,
      updated_no_of_participants: 1,
      show_max_participants: false,
      show_progress_status: false
    }
  }
  async componentDidMount() {
    this.setState({ show_progress_status: true });
    this.checkLogin();
    await this.getServices();
    this.setState({ show_progress_status: false });
  }
  checkLogin() {
    if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
      this.logout();
    }
  }
  handleChange = (event, stateName) => {
    let fee = this.state.previous_fee;
    let updated_fee = this.state.updated_previous_fee;

    if (stateName === "no_of_participants") {

      this.setState({
        [stateName]: event.target.value,

      });
      if (event.target.value !== null && event.target.value > 0) {
        fee = fee * event.target.value;
      }
      this.setState({

        fees: fee
      });
    } else if (stateName === "updated_no_of_participants") {
      if (event.target.value !== null && event.target.value > 0) {
        updated_fee = updated_fee * event.target.value;
      }
      this.setState({
        [stateName]: event.target.value,
        updated_fees: updated_fee
      });
    } else {
      this.setState({
        [stateName]: event.target.value
      });
    }
  };
  logout() {

    const { from } = this.props.location.state || {
      from: { pathname: "/" }
    };
    this.props.history.push("/");

  }
  async getServices() {
    //call API
    const notification = this.notificationSystem.current;
    let apiResponse = await APIService.makeApiGetRequest("training/services");

    if (apiResponse.status == 403) {
      this.setState({ closesession: true });
      notification.addNotification({
        message: apiResponse.message,
        level: 'error',
        autoDismiss: 5
      });
    } else {

      this.setState({ training_list: apiResponse, training_list_temp: apiResponse });

      this.getScheduled();
      this.getCounties();
    }

  }
  async getScheduled() {
    //call API
    const notification = this.notificationSystem.current;
    let apiResponse = await APIService.makeApiGetRequest("schedule/list/unapproved");



    this.setState({ schedule_list: apiResponse, schedule_list_temp: apiResponse });


  }
  async getCounties() {
    //call API

    let apiResponse = await APIService.makeApiGetRequest("counties");
    this.setState({ counties: apiResponse });

  }
  getDepartment(cell, row) {
    return cell.dept_name;
  }
  getRole(cell, row) {
    return cell.role_name;
  }
  cellButton(row) {
    const { classes } = this.props;
    let disabled = false;
    if (row.status === "In session" || row.status === "Completed") {
      disabled = true;
    }
    return (

      <Button
        size="sm"
        variant="primary"
        disabled={disabled}
        onClick={() =>
          this.onClickServiceSelected(row)
        }
      >
        Update
      </Button>

    );
  }
  startTrainingButton(cell, row, enumObject, rowIndex) {
    const { classes } = this.props;
    let disabled = false;
    if (row.status === "Not started") {
      return (

        <Button
          size="sm"
          variant="success"
          onClick={() =>
            this.openStartDialog(cell, row, enumObject, rowIndex)
          }
        >
          Start
        </Button>

      );
    } else {

      let disabled = false;
      if (row.status === "Completed") {
        disabled = true;
      }
      return (

        <Button
          size="sm"
          variant="danger"
          disabled={disabled}
          onClick={() =>
            this.openEndDialog(cell, row, enumObject, rowIndex)
          }
        >
          End
        </Button>

      );
    }
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
  closeEndDialog() {
    this.setState({ openEnd: false });
  }
  openStartDialog(cell, row, enumObject, rowIndex) {

    let startDate = row.start_date.slice(0, 10);
    let endDate = row.end_date.slice(0, 10);
    this.setState({
      openDelete: true,
      training_id: row.id,
      training_name: row.trainings.module,
      updated_startdate: startDate,
      updated_enddate: endDate,
    });
  }

  openEndDialog(cell, row, enumObject, rowIndex) {
    let startDate = row.start_date.slice(0, 10);
    let endDate = row.end_date.slice(0, 10);
    this.setState({
      openEnd: true,
      training_id: row.id,
      training_name: row.trainings.module,
      updated_startdate: startDate,
      updated_enddate: endDate
    });
  }
  onClickServiceSelected(row) {
    let startDate = new Date(row.start_date);
    let endDate = new Date(row.end_date);

    let county = "NA";
    if (row.trainingtype === "Corporate") {
      this.setState({
        show_max_participants: true
      });
    } else {
      this.setState({
        show_max_participants: false
      });
    }
    if (row.delivery_mode === "Physical") {
      this.setState({
        showlocation: true
      });
      county = this.getCounty(row.county);
    }

    this.setState({
      updated_training_id: row.id,
      updated_startdate: this.dateConverter(startDate),
      updated_enddate: this.dateConverter(endDate),
      training_name: row.module,
      updated_delivery_mode: row.delivery_mode,
      updated_fees: row.fee,
      updated_county: row.county,
      countyName: county

    });

    this.openUpdateDialog();
  }


  async saveService() {
    this.closeAddDialog();
    this.setState({ show_progress_status: true });
    const notification = this.notificationSystem.current;

    if (this.state.training_id == null || this.state.training_id === '') {
      this.setState({ show_progress_status: false });

      notification.addNotification({
        message: 'Please enter service name',
        level: 'warning',
        autoDismiss: 5
      });
    } else if (this.state.startdate == null || this.state.startdate === '') {
      this.setState({ show_progress_status: false });

      notification.addNotification({
        message: 'Please enter start date',
        level: 'warning',
        autoDismiss: 5
      });
    } else if (this.state.enddate == null || this.state.enddate === '') {
      this.setState({ show_progress_status: false });

      notification.addNotification({
        message: 'Please enter end date',
        level: 'warning',
        autoDismiss: 5
      });
    } else {

      let params = {};
      params["id"] = this.state.training_id;
      params["start_date"] = this.dateConverter(this.state.startdate);
      params["end_date"] = this.dateConverter(this.state.enddate);
      params["delivery_mode"] = this.state.delivery_mode;
      params["trainingtype"] = this.state.training_type;
      params["participants"] = this.state.no_of_participants;
      params["fees"] = this.state.fees;
      params["county"] = this.state.county;


      let result = await APIService.makePostRequest("schedule_training", params);
      if (result.success) {
        notification.addNotification({
          message: 'Training schedule saved',
          level: 'success',
          autoDismiss: 5
        });
        this.closeAddDialog();
        this.setState({
          enddate: '',
          new_newfeetwo: '',
          startdate: '',
          training_id: '',
        });
        this.getServices();
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
  async updateService(flag) {
    this.closeUpdateDialog();
    this.setState({ show_progress_status: true });
    const notification = this.notificationSystem.current;

    //check permissions
    let privilegeList = [];
    let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
    for (let k in privileges) {

      privilegeList.push(privileges[k].mprivileges.privilege_name);
    }
    if (!privilegeList.includes("approve_scheduled_training")) {
      this.setState({ show_progress_status: false });
      notification.addNotification({
        message: "You do not have the rights to approve a scheduled training request. Please contact your Systems Administrator",
        level: 'error',
        autoDismiss: 5
      });
    } else {
      if (this.state.updated_startdate == null || this.state.updated_startdate === '') {
        this.setState({ show_progress_status: false });

        notification.addNotification({
          message: 'Please select start date',
          level: 'warning',
          autoDismiss: 5
        });
      } else if (this.state.updated_enddate == null || this.state.updated_enddate === '') {
        this.setState({ show_progress_status: false });

        notification.addNotification({
          message: 'Please select end date',
          level: 'warning',
          autoDismiss: 5
        });
      } else {

        let params = {};
        params["id"] = this.state.updated_training_id;
        params["actionflag"] = flag;
        params["fees"] = this.state.updated_fees;




        let result = await APIService.makePostRequest("finance/training_actions", params);
        if (result.success) {
          notification.addNotification({
            message: result.message,
            level: 'success',
            autoDismiss: 5
          });
          this.closeUpdateDialog();
          this.setState({
            updated_enddate: '',
            updated_enddate: '',
            updated_training_id: '',
          });
          this.getServices();
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

  setStartDate(e) {

    this.setState({
      startdate: e
    })
  }
  setEndDate(e) {


    this.setState({
      enddate: e
    })
  }

  setStartUpdateDate(e) {

    this.setState({
      updated_startdate: e
    })
  }
  setEndUpdateDate(e) {


    this.setState({
      updated_enddate: e
    })
  }

  getCounty(val) {
    let countyName = this.state.counties.filter(c => {
      return c.id == val;
    });
    return countyName[0].county;
  }
  getTraining(cell, row) {
    return cell.module;
  }
  getFormatedStartDate(row) {

    let val = row.start_date
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
  getFormatedEndDate(row) {
    let val = row.end_date
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

    let concatTime = year + '-' + month + '-' + dt + ' ' + hour + ':' + mins;

    return concatTime;
  }
  handleTrainingSearch(e) {
    let value = e.target.value;

    //lets do a filter
    let searchResult = this.state.schedule_list.filter(s => {
      return s.module.includes(value) || s.start_date.includes(value) || s.end_date.includes(value);
    });
    this.setState({
      schedule_list_temp: searchResult
    });

  }
  render() {
    return (
      <Aux>
        {this.state.show_progress_status && (<SpinnerDiv>
          <CircularProgress />
        </SpinnerDiv>)}
        <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />

        <Card title='Approve Training schedule' isOption>


          {/*<BootstrapTable data={this.state.schedule_list} striped hover>
      <TableHeaderColumn isKey dataField='id' hidden>ID</TableHeaderColumn>
      <TableHeaderColumn dataField='module'>Name</TableHeaderColumn>
      <TableHeaderColumn dataField='start_date' dataFormat={this.getFormatedStartDate} >Start</TableHeaderColumn>
      <TableHeaderColumn dataField='end_date' dataFormat={this.getFormatedEndDate}>End</TableHeaderColumn>
      <TableHeaderColumn dataField='finance_approve'>Approved</TableHeaderColumn>

      <TableHeaderColumn
                                         
                                            thStyle={{ verticalAlign: "top" }}
                                            dataField="button"
                                            dataFormat={this.cellButton.bind(this)}
                                        >
                                            Action
                        </TableHeaderColumn>
                </BootstrapTable>*/}

          <br />
          <br />

          <div className="input-group mb-3">
            <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by Training name or start date or end date" onChange={e => this.handleTrainingSearch(e)} />
          </div>
          <br />
          <Table>
            <Thead>
              <Tr style={{ border: '1px solid' }}>
                <Th>Name</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Approved</Th>
                <Th>Action</Th>


              </Tr>

            </Thead>
            {this.state.schedule_list_temp.length == 0 ? <Tbody>
              <Tr style={{ border: '1px solid' }} key={0}>
                <Td>Loading ......</Td>
              </Tr>
            </Tbody> : <Tbody>
              {this.state.schedule_list_temp.map(
                (u, index) => (
                  <Tr style={{ border: '1px solid' }} key={index}>

                    <Td>
                      {u.module}
                    </Td>
                    <Td>
                      {this.getFormatedStartDate(u)}
                    </Td>
                    <Td>
                      {this.getFormatedEndDate(u)}
                    </Td>
                    <Td>{u.finance_approve}</Td>
                    <Td>{this.cellButton(u)}</Td>

                  </Tr>
                )
              )}
            </Tbody>}
          </Table>


        </Card>



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

            <div className="card-body text-center">
              <h3>Approve - {this.state.training_name}</h3>
              <br />
              <Table>
                <Tbody>


                  <Tr key={0}>
                    <Td><b>Delivery mode</b></Td>
                    <Td>{this.state.updated_delivery_mode}</Td>
                  </Tr>

                  {this.state.showlocation ? <Tr key={1}>
                    <Td><b>Location</b></Td>
                    <Td>{this.state.countyName}</Td>
                  </Tr> : null}
                  {this.state.show_max_participants ?
                    <Tr key={2}>
                      <Td><b>Maximum number of participants</b></Td>
                      <Td>{this.state.updated_no_of_participants}</Td>
                    </Tr> : null}

                  <Tr key={3}>
                    <Td><b>Start date</b></Td>
                    <Td>{this.state.updated_startdate}</Td>
                  </Tr>
                  <Tr key={4}>
                    <Td><b>End date</b></Td>
                    <Td>{this.state.updated_enddate}</Td>
                  </Tr>
                  <Tr key={5}>
                    <Td><b>Fee (KES)</b></Td>
                    <Td>{this.state.updated_fees}</Td>
                  </Tr>
                </Tbody>
              </Table>


              <Row>
                <Col>
                  <div className="card-body text-center">
                    <button className="btn btn-danger shadow-2 mb-4" onClick={() => { this.updateService("reject") }}>Do not approve</button>
                  </div>
                </Col>
                <Col>
                  <div className="card-body text-center">
                    <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.updateService("approve") }}>Approve</button>
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

export default Finance;