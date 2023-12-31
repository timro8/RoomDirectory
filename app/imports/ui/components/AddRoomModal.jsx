import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Modal, Row } from 'react-bootstrap';
import swal from 'sweetalert';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import { AutoField, AutoForm, ErrorsField, ListField, ListItemField, NumField, SelectField, SubmitField, TextField } from 'uniforms-bootstrap5';
import { PlusLg, Trash3 } from 'react-bootstrap-icons';
import TagsInput from 'react-tagsinput';
import { defineMethod, updateMethod } from '../../api/base/BaseCollection.methods';
import { Room } from '../../api/room/RoomCollection';
import { RoomResources } from '../../api/room/RoomResourceCollection';
import { FacultyProfiles } from '../../api/faculty/FacultyProfileCollection';

const typeList = ['conference', 'lecture', 'study room', 'office'];
const buildingList = ['POST', 'building2'];

const formSchema = new SimpleSchema({
  roomNumber: String,
  building: {
    type: String,
    allowedValues: buildingList,
    defaultValue: 'POST',
  },
  type: {
    type: String,
    allowedValues: typeList,
    defaultValue: 'conference',
  },
  occupants: Array,
  'occupants.$': String,
  squareFt: {
    type: Number,
    min: 0,
    defaultValue: 0,
  },
  isICS: {
    type: Boolean,
    defaultValue: false,
  },
  capacity: {
    type: Number,
    min: 0,
    defaultValue: 0,
  },
  chairs: {
    type: Number,
    min: 0,
    defaultValue: 0,
  },
  desks: {
    type: Number,
    min: 0,
    defaultValue: 0,
  },
  phoneNumber: {
    type: String,
    defaultValue: 'None',
  },
  tv: [Object],
  'tv.$.number': String,
  'tv.$.location': {
    type: String,
  },
  dataJacks: [Object],
  'dataJacks.$.number': String,
  'dataJacks.$.location': {
    type: String,
  },
  notes: {
    type: String,
    defaultValue: 'None',
  },
});

const bridge = new SimpleSchema2Bridge(formSchema);

// Renders the modal for adding a new room. See pages/AdminManage.jsx.
const AddRoomModal = ({ showAddRoom, setShowAddRoom }) => {

  const [occupantList, setOccupantList] = useState([]);

  // on form submit, add room to the collection
  const submit = (data, formRef) => {
    const { roomNumber, building, type, occupants, squareFt, isICS, capacity, chairs, desks, phoneNumber, tv, dataJacks, notes } = data;
    let definitionData = { roomNumber, building, type, occupants, squareFt, notes };
    definitionData.occupants = occupantList;
    let collectionName = Room.getCollectionName();

    if (Room.findOne({ roomNumber: data.roomNumber, building: data.building })) {
      swal('Error', 'That room exists already!', 'error');
    } else {
      defineMethod.callPromise({ collectionName, definitionData })
        .catch(error => swal('Error', error.message, 'error'))
        .then(() => {
          collectionName = RoomResources.getCollectionName();
          definitionData = { roomNumber, isICS, capacity, chairs, desks, phoneNumber, tv, dataJacks };
          defineMethod.callPromise({ collectionName, definitionData })
            .catch(error => swal('Error', error.message, 'error'))
            .then(() => {
              const facultyMembers = FacultyProfiles.find({}).fetch();
              facultyMembers.map((facultyMember) => {
                if (facultyMember.officeLocation.includes(`${building} ${roomNumber}`) && !occupantList.includes(facultyMember.email)) {
                  facultyMember.officeLocation.splice(facultyMember.officeLocation.indexOf(`${building} ${roomNumber}`), 1);
                  collectionName = FacultyProfiles.getCollectionName();
                  const updateData = { id: facultyMember._id, officeLocation: facultyMember.officeLocation };
                  updateMethod.callPromise({ collectionName, updateData })
                    .catch((err) => swal('Error', err.message, 'error'))
                    .then(() => (true));
                  return null;
                }
                if (!facultyMember.officeLocation.includes(`${building} ${roomNumber}`) && occupantList.includes(facultyMember.email)) {
                  facultyMember.officeLocation.push(`${building} ${roomNumber}`);
                  const updateData = { id: facultyMember._id, officeLocation: facultyMember.officeLocation };
                  collectionName = FacultyProfiles.getCollectionName();
                  updateMethod.callPromise({ collectionName, updateData })
                    .catch((err) => swal('Error', err.message, 'error'))
                    .then(() => (true));
                  return null;
                }
                return null;
              });
              swal('Success', 'Room updated successfully', 'success');
            });
        });
    }
    formRef.reset();
    setOccupantList([]);
  };

  // on change, update the occupants state
  const handleChangeOccupants = (list) => setOccupantList(list);

  // reset states when exiting modal
  const handleHideModal = () => {
    setShowAddRoom(false);
    setOccupantList([]);
  };

  let fRef = null;
  return (
    <Modal show={showAddRoom} onHide={() => handleHideModal()} centered dialogClassName="modal-90w" className="modal-xl">
      <Modal.Header closeButton />
      <Modal.Body>
        <h4>Add Room</h4>
        <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => submit(data, fRef)}>
          <Row>
            <Col>
              <Row>
                <Col>
                  <TextField name="building" placeholder="Building" />
                </Col>
                <Col>
                  <TextField name="roomNumber" placeholder="Room Number" />
                </Col>
                <Col>
                  <AutoField name="isICS" placeholder="ICS Room" />
                </Col>
                <Col>
                  <TextField name="notes" placeholder="Notes" />
                </Col>
              </Row>
              <Row>
                <Col>
                  <TextField name="phoneNumber" placeholder="Phone Number" />
                </Col>
                <Col>
                  <SelectField name="type" allowedValues={typeList} placeholder="Room Type" />
                </Col>
                <Col>
                  <NumField name="capacity" step={1} min={0} placeholder="Capacity" />
                </Col>
              </Row>
              <Row>
                <Col>
                  <NumField name="chairs" step={1} min={0} placeholder="Chairs" />
                </Col>
                <Col>
                  <NumField name="desks" step={1} min={0} placeholder="Desks" />
                </Col>
                <Col>
                  <NumField name="squareFt" step={1} min={0} icon="user" />
                </Col>
              </Row>
              <Row className="pb-3">
                <Col>
                  <ListField hidden name="occupants" style={{ maxHeight: '200px', overflowY: 'auto' }} addIcon={<PlusLg className="listIcons" />} removeIcon={<Trash3 className="listIcons" />} />
                  <span>Occupants</span>
                  <TagsInput name="occupants" value={occupantList} onChange={handleChangeOccupants} inputProps={{ className: 'react-tagsinput-input', placeholder: 'Add an Occupant...' }} />
                </Col>
              </Row>
            </Col>
            <Col className="col-3" style={{ paddingRight: '1.5em' }}>
              <Row>
                <ListField name="tv" style={{ maxHeight: '200px', overflowY: 'auto' }} addIcon={<PlusLg className="listIcons" />} removeIcon={<Trash3 className="listIcons" />}>
                  <ListItemField name="$">
                    <TextField name="number" />
                    <TextField name="location" placeholder="Select location" />
                  </ListItemField>
                </ListField>
              </Row>
              <Row>
                <ListField name="dataJacks" style={{ maxHeight: '200px', overflowY: 'auto' }} addIcon={<PlusLg className="listIcons" />} removeIcon={<Trash3 className="listIcons" />}>
                  <ListItemField name="$">
                    <TextField name="number" />
                    <TextField name="location" placeholder="Select location" />
                  </ListItemField>
                </ListField>
              </Row>
            </Col>
          </Row>
          <SubmitField value="Submit" />
          <ErrorsField />
        </AutoForm>
      </Modal.Body>
    </Modal>
  );
};

// Require a document to be passed to this component.
AddRoomModal.propTypes = {
  showAddRoom: PropTypes.bool.isRequired,
  setShowAddRoom: PropTypes.func.isRequired,
};

export default AddRoomModal;
