import React from 'react';
import swal from 'sweetalert';
import { Col, Container, Image, Row, Button, InputGroup, Form, Dropdown } from 'react-bootstrap';
import { useParams } from 'react-router';
import { Roles } from 'meteor/alanning:roles';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { PAGE_IDS } from '../utilities/PageIDs';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserProfiles } from '../../api/user/UserProfileCollection';
import { AdminProfiles } from '../../api/user/AdminProfileCollection';
import { ROLE } from '../../api/role/Role';
import { updateMethod } from '../../api/base/BaseCollection.methods';
import { COMPONENT_IDS } from '../utilities/ComponentIDs';

/* TODO: Implement Edit profile, review user profile subscription (currently getting all profiles) */
const EditProfile = () => {

  const { _id } = useParams();
  let pfp;

  const { ready, user } = useTracker(() => {
    // Get access to Reservations and User Profile documents.
    const profileSubscription = UserProfiles.subscribe();
    const adminProfileSubscription = AdminProfiles.subscribe();
    // Determine if the subscriptions are ready
    const rdy1 = adminProfileSubscription.ready();
    const rdy2 = profileSubscription.ready();
    const rdy = rdy1 && rdy2;
    // Get the Reservations and User Profile documents
    let usr = UserProfiles.findOne({ _id: _id }, {});
    if (usr === undefined) usr = AdminProfiles.findOne({ _id: _id }, {});
    return {
      user: usr,
      ready: rdy,
    };
  }, [_id]);

  const submit = () => {
    const fName = document.getElementById(COMPONENT_IDS.EDIT_PROFILE_FORM_FIRST_NAME).value.toString();
    const lName = document.getElementById(COMPONENT_IDS.EDIT_PROFILE_FORM_LAST_NAME).value.toString();

    let collectionName;
    if (Roles.userIsInRole(Meteor.userId(), [ROLE.USER])) {
      collectionName = UserProfiles.getCollectionName();
    } else {
      collectionName = AdminProfiles.getCollectionName();
    }
    const updateData = { id: user._id, firstName: fName, lastName: lName, image: pfp };
    updateMethod.callPromise({ collectionName, updateData })
      .catch(error => swal('Error', error.message, 'error'))
      .then(() => swal('Success', 'Profile updated successfully', 'success'));
  };

  const pfpUpdate = (src) => {
    pfp = src;
  };

  return (ready ? (
    <Container id={PAGE_IDS.PROFILE} className="py-3">
      <Row>
        <Col>
          <h1 className="montserrat" style={{ textAlign: 'left', fontSize: '2em' }}>Edit Profile</h1>
        </Col>
      </Row>
      <Col className="align-content-center text-center py-5">
        <Row className="justify-content-center pb-4">
          <Image id="profile-image" roundedCircle className="h-25 w-25" src={user.image} />
        </Row>
        <Dropdown drop="up-centered" id={COMPONENT_IDS.EDIT_PROFILE_FORM_PFP} onSelect={pfpUpdate}>
          <Dropdown.Toggle id="dropdown-basic">
            Change Profile Picture
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item eventKey="/images/cam-moore.jpg"><Image rounded height={50} width={50} src="/images/cam-moore.jpg" /> PFP 1</Dropdown.Item>
            <Dropdown.Item eventKey="/images/depeng-li.jpg"><Image roundedCircle height={50} width={50} src="/images/depeng-li.jpg" /> PFP 2</Dropdown.Item>
            <Dropdown.Item eventKey="">Something else</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Row>
          <h2 id="profile-name" style={{ textTransform: 'uppercase' }}>{`${user.firstName} ${user.lastName}`}</h2>
        </Row>
        <Row>
          {Roles.userIsInRole(Meteor.userId(), [ROLE.ADMIN]) ? (
            <h4 id="profile-role" style={{ textTransform: 'uppercase' }}>ADMIN</h4>
          ) :
            <h4 id="profile-role" style={{ textTransform: 'uppercase' }}>{`${user.position}`}</h4> }
        </Row>
        <Row />
        <Row>
          <Col style={{ textAlign: 'right' }}>
            <Button variant="outline-secondary" href={`/profile/${_id}`}>Return to Profile</Button>
            <Button variant="success" onClick={submit}>Save</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <InputGroup size="sm">
              <InputGroup.Text><b>First Name</b></InputGroup.Text>
              <Form.Control id={COMPONENT_IDS.EDIT_PROFILE_FORM_FIRST_NAME} defaultValue={user.firstName ? user.firstName : ''} />
            </InputGroup>
          </Col>
          <Col>
            <InputGroup size="sm">
              <InputGroup.Text><b>Last Name</b></InputGroup.Text>
              <Form.Control id={COMPONENT_IDS.EDIT_PROFILE_FORM_LAST_NAME} defaultValue={user.lastName ? user.lastName : ''} />
            </InputGroup>
          </Col>
        </Row>
      </Col>
    </Container>
  ) : <LoadingSpinner message="Loading Profile" />);
};

export default EditProfile;
