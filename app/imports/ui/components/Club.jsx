import React, { useState } from 'react';
import { Button, Card, Table } from 'react-bootstrap';
import ReactCardFlip from 'react-card-flip';
import PropTypes from 'prop-types';
import { COMPONENT_IDS } from '../utilities/ComponentIDs';

// Renders a single row in the Club Information table. See pages/ClubInfo.jsx.
const Club = ({ club }) => {
  const [showMore, setShowMore] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
      <div className="card-front" style={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)' }}>
        <a href={club.website} target="_blank" rel="noopener noreferrer" style={{ alignContent: 'center' }}>
          <Card.Img alt="Club logo" src={club.image} style={{ borderRadius: '10px' }} />
        </a>
        <div style={{ alignItems: 'center', padding: '20px', textAlign: 'center' }}>
          <Card.Body>
            <Card.Title>{club.clubName}</Card.Title>
            <hr />
            <Card.Text>
              {showMore ? club.description : `${club.description.substring(0, 100)}`}
              <Button size="sm" variant="link" className="btn" onClick={() => setShowMore(!showMore)}>{showMore ? 'Read less' : 'Read more'}
              </Button>
            </Card.Text>
            <div id={COMPONENT_IDS.CLUB_INFORMATION_SEARCH}>
              <Button className="card-btn" onClick={handleClick}>More Info</Button>
            </div>
          </Card.Body>
        </div>
      </div>
      <div className="card-back" style={{ alignItems: 'center', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', padding: '20px', textAlign: 'center' }}>
        <Card.Body>
          <Card.Title>{club.clubName}</Card.Title>
          <hr />
          <Card.Text>
            <Table>
              <thead>
                <tr>
                  <th> </th>
                  <th>RIO Student(s)</th>
                  <th>Advisor(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th> </th>
                  <td>{`${club.rio.join(', \n')}`}</td>
                  <td>{`${club.advisor.join(', \n')}`}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Text>
          <div id={COMPONENT_IDS.CLUB_INFORMATION_SEARCH}>
            <Button className="card-btn" onClick={handleClick}>More Info</Button>
          </div>
        </Card.Body>
      </div>
    </ReactCardFlip>
  );
};

// Require a document to be passed to this component.
Club.propTypes = {
  club: PropTypes.shape({
    clubName: PropTypes.string,
    website: PropTypes.string,
    image: PropTypes.string,
    description: PropTypes.string,
    rio: PropTypes.arrayOf(PropTypes.string),
    advisor: PropTypes.arrayOf(PropTypes.string),
    _id: PropTypes.string,
  }).isRequired,
};

export default Club;
